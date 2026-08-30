#include "quantpulse/domain/performance/PerformanceEngine.hpp"

#include <algorithm>
#include <cmath>
#include <limits>
#include <stdexcept>

namespace quantpulse::domain::performance
{

    namespace
    {

        void validateEquityCurve(
            const std::vector<double> &equityCurve)
        {
            if (equityCurve.empty())
            {
                throw std::invalid_argument(
                    "Equity curve must not be empty.");
            }

            for (const double value : equityCurve)
            {
                if (!std::isfinite(value) ||
                    value <= 0.0)
                {
                    throw std::invalid_argument(
                        "Equity values must be finite and positive.");
                }
            }
        }

        void validateTradeReturns(
            const std::vector<double> &tradeReturns)
        {
            for (const double value : tradeReturns)
            {
                if (!std::isfinite(value))
                {
                    throw std::invalid_argument(
                        "Trade returns must be finite.");
                }

                if (value <= -1.0)
                {
                    throw std::invalid_argument(
                        "Trade returns must be greater than -100%.");
                }
            }
        }

        double calculateVolatility(
            const std::vector<double> &returns,
            double periodsPerYear)
        {
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

            return std::sqrt(variance * periodsPerYear);
        }

        double calculateSharpe(
            const std::vector<double> &returns,
            double periodsPerYear,
            double riskFreeRate)
        {
            if (returns.size() < 2)
            {
                return 0.0;
            }

            double excessMean = 0.0;

            for (const double value : returns)
            {
                excessMean +=
                    value - riskFreeRate;
            }

            excessMean /=
                static_cast<double>(returns.size());

            double squaredDeviationSum = 0.0;

            for (const double value : returns)
            {
                const double excess =
                    (value - riskFreeRate) -
                    excessMean;

                squaredDeviationSum +=
                    excess * excess;
            }

            const double variance =
                squaredDeviationSum /
                static_cast<double>(returns.size() - 1);

            if (variance == 0.0)
            {
                return 0.0;
            }

            return (excessMean / std::sqrt(variance)) *
                   std::sqrt(periodsPerYear);
        }

        double calculateSortino(
            const std::vector<double> &returns,
            double periodsPerYear,
            double riskFreeRate)
        {
            if (returns.empty())
            {
                return 0.0;
            }

            double excessMean = 0.0;

            for (const double value : returns)
            {
                excessMean +=
                    value - riskFreeRate;
            }

            excessMean /=
                static_cast<double>(returns.size());

            double downsideSquaredSum = 0.0;

            for (const double value : returns)
            {
                const double downside =
                    std::min(
                        value - riskFreeRate,
                        0.0);

                downsideSquaredSum +=
                    downside * downside;
            }

            const double downsideDeviation =
                std::sqrt(
                    downsideSquaredSum /
                    static_cast<double>(returns.size()));

            if (downsideDeviation == 0.0)
            {
                return 0.0;
            }

            return (excessMean / downsideDeviation) *
                   std::sqrt(periodsPerYear);
        }

        double calculateMaximumDrawdown(
            const std::vector<double> &equityCurve)
        {
            double peak = equityCurve.front();
            double maximumDrawdown = 0.0;

            for (const double equity : equityCurve)
            {
                peak =
                    std::max(peak, equity);

                const double drawdown =
                    equity / peak - 1.0;

                maximumDrawdown =
                    std::min(
                        maximumDrawdown,
                        drawdown);
            }

            return maximumDrawdown;
        }

    } // namespace

    PerformanceReport PerformanceEngine::evaluate(
        const std::vector<double> &equityCurve,
        double periodsPerYear,
        double riskFreeRate,
        const std::vector<double> &tradeReturns)
    {
        validateEquityCurve(equityCurve);
        validateTradeReturns(tradeReturns);

        if (!std::isfinite(periodsPerYear) ||
            periodsPerYear <= 0.0)
        {
            throw std::invalid_argument(
                "Periods per year must be finite and positive.");
        }

        if (!std::isfinite(riskFreeRate))
        {
            throw std::invalid_argument(
                "Risk-free rate must be finite.");
        }

        const double initialEquity =
            equityCurve.front();

        const double finalEquity =
            equityCurve.back();

        const double totalReturn =
            finalEquity / initialEquity - 1.0;

        double annualizedReturn = 0.0;

        if (equityCurve.size() > 1)
        {
            const double periods =
                static_cast<double>(
                    equityCurve.size() - 1);

            const double years =
                periods / periodsPerYear;

            if (years > 0.0)
            {
                annualizedReturn =
                    std::pow(
                        finalEquity / initialEquity,
                        1.0 / years) -
                    1.0;
            }
        }

        std::vector<double> periodicReturns;
        periodicReturns.reserve(
            equityCurve.size() > 1
                ? equityCurve.size() - 1
                : 0);

        for (std::size_t i = 1;
             i < equityCurve.size();
             ++i)
        {
            periodicReturns.push_back(
                equityCurve[i] /
                    equityCurve[i - 1] -
                1.0);
        }

        const double volatility =
            calculateVolatility(
                periodicReturns,
                periodsPerYear);

        const double sharpeRatio =
            calculateSharpe(
                periodicReturns,
                periodsPerYear,
                riskFreeRate);

        const double sortinoRatio =
            calculateSortino(
                periodicReturns,
                periodsPerYear,
                riskFreeRate);

        const double maximumDrawdown =
            calculateMaximumDrawdown(
                equityCurve);

        double calmarRatio = 0.0;

        if (maximumDrawdown < 0.0)
        {
            calmarRatio =
                annualizedReturn /
                std::abs(maximumDrawdown);
        }

        std::size_t winningTrades = 0;
        std::size_t losingTrades = 0;

        double tradeReturnSum = 0.0;
        double bestTradeReturn =
            -std::numeric_limits<double>::infinity();
        double worstTradeReturn =
            std::numeric_limits<double>::infinity();

        double grossProfit = 0.0;
        double grossLoss = 0.0;

        for (const double tradeReturn : tradeReturns)
        {
            tradeReturnSum += tradeReturn;

            bestTradeReturn =
                std::max(
                    bestTradeReturn,
                    tradeReturn);

            worstTradeReturn =
                std::min(
                    worstTradeReturn,
                    tradeReturn);

            if (tradeReturn > 0.0)
            {
                ++winningTrades;
                grossProfit += tradeReturn;
            }
            else if (tradeReturn < 0.0)
            {
                ++losingTrades;
                grossLoss +=
                    std::abs(tradeReturn);
            }
        }

        const std::size_t numberOfTrades =
            tradeReturns.size();

        const double winRate =
            numberOfTrades == 0
                ? 0.0
                : static_cast<double>(winningTrades) /
                      static_cast<double>(numberOfTrades);

        const double profitFactor =
            grossLoss == 0.0
                ? (grossProfit > 0.0
                       ? std::numeric_limits<double>::infinity()
                       : 0.0)
                : grossProfit / grossLoss;

        const double averageTradeReturn =
            numberOfTrades == 0
                ? 0.0
                : tradeReturnSum /
                      static_cast<double>(numberOfTrades);

        if (numberOfTrades == 0)
        {
            bestTradeReturn = 0.0;
            worstTradeReturn = 0.0;
        }

        return PerformanceReport{
            totalReturn,
            annualizedReturn,
            volatility,
            sharpeRatio,
            sortinoRatio,
            maximumDrawdown,
            calmarRatio,
            winRate,
            profitFactor,
            averageTradeReturn,
            bestTradeReturn,
            worstTradeReturn,
            numberOfTrades,
            winningTrades,
            losingTrades};
    }

} // namespace quantpulse::domain::performance
