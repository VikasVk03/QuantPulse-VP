#include "quantpulse/domain/backtest/BacktestEngine.hpp"

#include <algorithm>
#include <cmath>
#include <stdexcept>
#include <utility>

namespace quantpulse::domain::backtest
{

    namespace
    {

        void validateObservation(
            const MarketObservation &observation)
        {
            if (!std::isfinite(observation.price) ||
                observation.price <= 0.0)
            {
                throw std::invalid_argument(
                    "Observation price must be finite and positive.");
            }

            if (!std::isfinite(observation.signal))
            {
                throw std::invalid_argument(
                    "Observation signal must be finite.");
            }
        }

        double calculateMaximumDrawdown(
            const std::vector<double> &equityCurve)
        {
            double peak = equityCurve.front();
            double maximumDrawdown = 0.0;

            for (const double equity : equityCurve)
            {
                peak = std::max(peak, equity);

                const double drawdown =
                    (equity / peak) - 1.0;

                maximumDrawdown =
                    std::min(maximumDrawdown, drawdown);
            }

            return maximumDrawdown;
        }

        double calculateSharpeRatio(
            const std::vector<double> &equityCurve)
        {
            if (equityCurve.size() < 3)
            {
                return 0.0;
            }

            std::vector<double> returns;
            returns.reserve(equityCurve.size() - 1);

            for (std::size_t i = 1;
                 i < equityCurve.size();
                 ++i)
            {
                returns.push_back(
                    equityCurve[i] /
                        equityCurve[i - 1] -
                    1.0);
            }

            if (returns.size() < 2)
            {
                return 0.0;
            }

            double mean = 0.0;

            for (const double value : returns)
            {
                mean += value;
            }

            mean /= static_cast<double>(returns.size());

            double squaredDeviationSum = 0.0;

            for (const double value : returns)
            {
                const double deviation =
                    value - mean;

                squaredDeviationSum +=
                    deviation * deviation;
            }

            const double variance =
                squaredDeviationSum /
                static_cast<double>(returns.size() - 1);

            if (variance == 0.0)
            {
                return 0.0;
            }

            const double standardDeviation =
                std::sqrt(variance);

            return mean / standardDeviation;
        }

    } // namespace

    BacktestResult BacktestEngine::run(
        const std::vector<MarketObservation> &observations,
        double initialCapital,
        double signalThreshold,
        double transactionCostRate)
    {
        if (observations.empty())
        {
            throw std::invalid_argument(
                "At least one market observation is required.");
        }

        if (!std::isfinite(initialCapital) ||
            initialCapital <= 0.0)
        {
            throw std::invalid_argument(
                "Initial capital must be finite and positive.");
        }

        if (!std::isfinite(signalThreshold))
        {
            throw std::invalid_argument(
                "Signal threshold must be finite.");
        }

        if (!std::isfinite(transactionCostRate) ||
            transactionCostRate < 0.0)
        {
            throw std::invalid_argument(
                "Transaction cost rate must be finite and non-negative.");
        }

        for (const auto &observation : observations)
        {
            validateObservation(observation);
        }

        std::vector<double> tradeReturns;
        tradeReturns.reserve(observations.size() / 2);
        double entryPrice = 0.0;

        double cash = initialCapital;
        double shares = 0.0;

        Position position = Position::Flat;

        std::size_t numberOfTrades = 0;

        std::vector<double> equityCurve;
        equityCurve.reserve(observations.size());

        for (const auto &observation : observations)
        {
            const bool shouldBeLong =
                observation.signal > signalThreshold;

            if (shouldBeLong &&
                position == Position::Flat)
            {
                /*
                 * Invest all available cash.
                 *
                 * Transaction cost is charged on traded notional.
                 */
                const double denominator =
                    1.0 + transactionCostRate;

                shares =
                    cash /
                    (observation.price * denominator);

                entryPrice = observation.price;

                const double tradedNotional =
                    shares * observation.price;

                const double transactionCost =
                    tradedNotional *
                    transactionCostRate;

                cash -=
                    tradedNotional +
                    transactionCost;

                position = Position::Long;
                ++numberOfTrades;
            }
            else if (!shouldBeLong &&
                     position == Position::Long)
            {
                const double tradedNotional =
                    shares * observation.price;

                const double transactionCost =
                    tradedNotional *
                    transactionCostRate;

                cash +=
                    tradedNotional -
                    transactionCost;

                const double grossTradeReturn =
                    observation.price /
                        entryPrice -
                    1.0;

                const double netTradeReturn =
                    ((1.0 - transactionCostRate) *
                     (1.0 + grossTradeReturn) /
                     (1.0 + transactionCostRate)) -
                    1.0;

                tradeReturns.push_back(netTradeReturn);

                shares = 0.0;

                position = Position::Flat;
                ++numberOfTrades;
            }

            const double portfolioValue =
                cash +
                shares * observation.price;

            equityCurve.push_back(
                portfolioValue);
        }

        /*
         * Mark the open position to market at the final
         * observation. We intentionally do not add a synthetic
         * transaction just to close it.
         */
        const double finalCapital =
            cash +
            shares * observations.back().price;

        const double totalReturn =
            finalCapital / initialCapital - 1.0;

        const double maximumDrawdown =
            calculateMaximumDrawdown(equityCurve);

        const double sharpeRatio =
            calculateSharpeRatio(equityCurve);

        return BacktestResult{
            initialCapital,
            finalCapital,
            totalReturn,
            maximumDrawdown,
            sharpeRatio,
            numberOfTrades,
            std::move(equityCurve),
            std::move(tradeReturns)};
    }

} // namespace quantpulse::domain::backtest