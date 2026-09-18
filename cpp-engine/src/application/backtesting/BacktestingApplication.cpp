#include "quantpulse/application/backtesting/BacktestingApplication.hpp"

#include <utility>

namespace quantpulse::application::backtesting
{

    BacktestingReport BacktestingApplication::run(
        const BacktestingRequest &request)
    {
        const auto result =
            quantpulse::domain::backtest::BacktestEngine::run(
                request.observations,
                request.initialCapital,
                request.signalThreshold,
                request.transactionCostRate);

        return BacktestingReport{
            .initialCapital = result.initialCapital,
            .finalCapital = result.finalCapital,
            .totalReturn = result.totalReturn,
            .maximumDrawdown = result.maximumDrawdown,
            .sharpeRatio = result.sharpeRatio,
            .numberOfTrades = result.numberOfTrades,
            .equityCurve = std::move(result.equityCurve),
            .tradeReturn = std::move(result.tradeReturn),
        };
    }

} // namespace quantpulse::application::backtesting
