#pragma once

#include <cstddef>
#include <vector>

namespace quantpulse::domain::performance
{

    struct PerformanceReport
    {
        double totalReturn;
        double annualizedReturn;
        double volatility;

        double sharpeRatio;
        double sortinoRatio;

        double maximumDrawdown;
        double calmarRatio;

        double winRate;
        double profitFactor;

        double averageTradeReturn;
        double bestTradeReturn;
        double worstTradeReturn;

        std::size_t numberOfTrades;
        std::size_t winningTrades;
        std::size_t losingTrades;
    };

    class PerformanceEngine
    {
    public:
        /**
         * @brief Evaluate the performance of an equity curve.
         *
         * @param equityCurve Portfolio equity observations.
         * @param periodsPerYear Number of observations per year.
         * @param riskFreeRate Risk-free return per observation period.
         *
         * @return Performance report.
         *
         * @throw std::invalid_argument if the equity curve is invalid
         *        or periodsPerYear is not positive.
         */
        [[nodiscard]]
        static PerformanceReport evaluate(
            const std::vector<double> &equityCurve,
            double periodsPerYear,
            double riskFreeRate,
            const std::vector<double> &tradeReturns);
    };

} // namespace quantpulse::domain::performance
