#pragma once

#include "quantpulse/domain/backtest/BacktestEngine.hpp"

#include <cstddef>
#include <vector>

namespace quantpulse::application::backtesting
{

    struct BacktestingRequest
    {
        std::vector<
            quantpulse::domain::backtest::MarketObservation>
            observations;

        double initialCapital = 0.0;
        double signalThreshold = 0.0;
        double transactionCostRate = 0.0;
    };

    struct BacktestingReport
    {
        double initialCapital = 0.0;
        double finalCapital = 0.0;
        double totalReturn = 0.0;
        double maximumDrawdown = 0.0;
        double sharpeRatio = 0.0;

        std::size_t numberOfTrades = 0;

        std::vector<double> equityCurve;
        std::vector<double> tradeReturn;
    };

    class BacktestingApplication
    {
    public:
        [[nodiscard]]
        static BacktestingReport run(
            const BacktestingRequest &request);
    };

} // namespace quantpulse::application::backtesting
