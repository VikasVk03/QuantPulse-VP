#pragma once

#include <cstddef>
#include <vector>

namespace quantpulse::domain::backtest
{

    enum class Position
    {
        Flat,
        Long
    };

    struct MarketObservation
    {
        double price;
        double signal;
    };

    struct BacktestResult
    {
        double initialCapital;
        double finalCapital;
        double totalReturn;
        double maximumDrawdown;
        double sharpeRatio;

        std::size_t numberOfTrades;

        std::vector<double> equityCurve;
    };

    class BacktestEngine
    {
    public:
        /**
         * @brief Run a long/flat historical backtest.
         *
         * A signal strictly greater than the threshold enters a long
         * position. A signal less than or equal to the threshold exits
         * the position.
         *
         * Positions are executed at the supplied market observation price.
         *
         * @param observations Historical price and signal observations.
         * @param initialCapital Starting portfolio capital.
         * @param signalThreshold Threshold used to enter a position.
         * @param transactionCostRate Transaction cost as a fraction
         *        of traded notional.
         *
         * @return BacktestResult containing portfolio performance and
         *         the generated equity curve.
         *
         * @throw std::invalid_argument if inputs are invalid.
         */
        [[nodiscard]]
        static BacktestResult run(
            const std::vector<MarketObservation> &observations,
            double initialCapital,
            double signalThreshold,
            double transactionCostRate);
    };

} // namespace quantpulse::domain::backtest