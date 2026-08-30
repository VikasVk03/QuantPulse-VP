#include "quantpulse/domain/research/ResearchEngine.hpp"

#include "quantpulse/domain/backtest/BacktestEngine.hpp"
#include "quantpulse/domain/features/FeatureEngine.hpp"
#include "quantpulse/domain/signals/SignalEngine.hpp"
#include "quantpulse/domain/strategy/StrategyEngine.hpp"

#include <cmath>
#include <stdexcept>
#include <vector>

namespace quantpulse::domain::research
{

    namespace
    {

        void validateObservation(
            const ResearchObservation &observation)
        {
            if (!std::isfinite(observation.price) ||
                observation.price <= 0.0)
            {
                throw std::invalid_argument(
                    "Observation price must be finite and positive.");
            }

            if (!std::isfinite(observation.volume) ||
                observation.volume < 0.0)
            {
                throw std::invalid_argument(
                    "Observation volume must be finite and non-negative.");
            }

            if (!std::isfinite(observation.bidPrice) ||
                observation.bidPrice <= 0.0)
            {
                throw std::invalid_argument(
                    "Bid price must be finite and positive.");
            }

            if (!std::isfinite(observation.askPrice) ||
                observation.askPrice <= 0.0)
            {
                throw std::invalid_argument(
                    "Ask price must be finite and positive.");
            }

            if (observation.askPrice <
                observation.bidPrice)
            {
                throw std::invalid_argument(
                    "Ask price must not be less than bid price.");
            }

            const double volumes[] =
                {
                    observation.bidVolume,
                    observation.askVolume,
                    observation.tradeBuyVolume,
                    observation.tradeSellVolume};

            for (const double value : volumes)
            {
                if (!std::isfinite(value) ||
                    value < 0.0)
                {
                    throw std::invalid_argument(
                        "Market volumes must be finite and non-negative.");
                }
            }
        }

        void validateConfig(
            const ResearchConfig &config)
        {
            if (config.featureWindow < 2)
            {
                throw std::invalid_argument(
                    "Feature window must contain at least two observations.");
            }

            if (!std::isfinite(config.entryThreshold))
            {
                throw std::invalid_argument(
                    "Entry threshold must be finite.");
            }

            if (!std::isfinite(config.exitThreshold))
            {
                throw std::invalid_argument(
                    "Exit threshold must be finite.");
            }

            if (config.exitThreshold >
                config.entryThreshold)
            {
                throw std::invalid_argument(
                    "Exit threshold must not exceed entry threshold.");
            }

            if (!std::isfinite(config.initialCapital) ||
                config.initialCapital <= 0.0)
            {
                throw std::invalid_argument(
                    "Initial capital must be finite and positive.");
            }

            if (!std::isfinite(
                    config.transactionCostRate) ||
                config.transactionCostRate < 0.0)
            {
                throw std::invalid_argument(
                    "Transaction cost rate must be finite and non-negative.");
            }

            if (!std::isfinite(
                    config.periodsPerYear) ||
                config.periodsPerYear <= 0.0)
            {
                throw std::invalid_argument(
                    "Periods per year must be finite and positive.");
            }

            if (!std::isfinite(
                    config.riskFreeRate))
            {
                throw std::invalid_argument(
                    "Risk-free rate must be finite.");
            }
        }

    } // namespace

    ResearchResult ResearchEngine::run(
        const std::vector<ResearchObservation> &observations,
        const ResearchConfig &config)
    {
        validateConfig(config);

        if (observations.size() <
            config.featureWindow)
        {
            throw std::invalid_argument(
                "Insufficient observations for feature window.");
        }

        for (const auto &observation :
             observations)
        {
            validateObservation(
                observation);
        }

        using quantpulse::domain::backtest::
            BacktestEngine;

        using quantpulse::domain::backtest::
            MarketObservation;

        using quantpulse::domain::features::
            FeatureEngine;

        using quantpulse::domain::performance::
            PerformanceEngine;

        using quantpulse::domain::signals::
            SignalEngine;

        using quantpulse::domain::strategy::
            Position;

        using quantpulse::domain::strategy::
            StrategyEngine;

        std::vector<double> rawSignals;
        rawSignals.reserve(
            observations.size());

        std::vector<double> strategySignals;
        strategySignals.reserve(
            observations.size());

        std::vector<MarketObservation>
            backtestObservations;

        backtestObservations.reserve(
            observations.size());

        Position currentPosition =
            Position::Flat;

        /*
         * ----------------------------------------------------
         * Warm-up period
         * ----------------------------------------------------
         *
         * There is not enough historical data before the
         * feature window is available.
         *
         * We remain flat during this period.
         */
        for (std::size_t i = 0;
             i < config.featureWindow - 1;
             ++i)
        {
            rawSignals.push_back(0.0);
            strategySignals.push_back(0.0);

            backtestObservations.push_back(
                MarketObservation{
                    observations[i].price,
                    0.0});
        }

        /*
         * ----------------------------------------------------
         * Rolling quantitative research pipeline
         * ----------------------------------------------------
         */
        for (std::size_t i =
                 config.featureWindow - 1;
             i < observations.size();
             ++i)
        {
            std::vector<double> prices;
            std::vector<double> volumes;

            prices.reserve(
                config.featureWindow);

            volumes.reserve(
                config.featureWindow);

            const std::size_t start =
                i + 1 -
                config.featureWindow;

            for (std::size_t j = start;
                 j <= i;
                 ++j)
            {
                prices.push_back(
                    observations[j].price);

                volumes.push_back(
                    observations[j].volume);
            }

            const auto &current =
                observations[i];

            /*
             * STEP 1
             * Generate quantitative features.
             */
            const auto features =
                FeatureEngine::generate(
                    prices,
                    volumes,
                    current.bidPrice,
                    current.askPrice,
                    current.bidVolume,
                    current.askVolume,
                    current.tradeBuyVolume,
                    current.tradeSellVolume);

            /*
             * STEP 2
             * Generate multi-factor signal.
             */
            const auto signal =
                SignalEngine::generate(
                    features);

            rawSignals.push_back(
                signal.overallScore);

            /*
             * STEP 3
             * Convert signal into a stateful
             * trading decision.
             */
            const auto decision =
                StrategyEngine::evaluate(
                    signal.overallScore,
                    currentPosition,
                    config.entryThreshold,
                    config.exitThreshold);

            currentPosition =
                decision.nextPosition;

            /*
             * STEP 4
             * Convert strategy position into
             * BacktestEngine-compatible signal.
             *
             * BacktestEngine enters long when:
             *
             * signal > threshold
             *
             * We use:
             *
             * Long -> +1.0
             * Flat ->  0.0
             */
            const double backtestSignal =
                currentPosition ==
                        Position::Long
                    ? 1.0
                    : 0.0;

            strategySignals.push_back(
                backtestSignal);

            backtestObservations.push_back(
                MarketObservation{
                    current.price,
                    backtestSignal});
        }

        /*
         * STEP 5
         * Historical strategy simulation.
         */
        const auto backtestResult =
            BacktestEngine::run(
                backtestObservations,
                config.initialCapital,
                0.5,
                config.transactionCostRate);

        /*
         * STEP 6
         * Performance evaluation.
         */
        const auto performance =
            PerformanceEngine::evaluate(
                backtestResult.equityCurve,
                config.periodsPerYear,
                config.riskFreeRate,
                backtestResult.tradeReturn);

        return ResearchResult{
            std::move(rawSignals),
            std::move(strategySignals),
            performance};
    }

} // namespace quantpulse::domain::research