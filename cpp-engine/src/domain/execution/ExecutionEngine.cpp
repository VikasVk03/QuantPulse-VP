#include "quantpulse/domain/execution/ExecutionEngine.hpp"

#include <stdexcept>

namespace quantpulse::domain::execution
{

    ExecutionDecision ExecutionEngine::evaluate(
        strategy::StrategyAction action)
    {
        switch (action)
        {
        case strategy::StrategyAction::Hold:
        {
            return ExecutionDecision{
                OrderSide::None,
                false};
        }

        case strategy::StrategyAction::EnterLong:
        {
            return ExecutionDecision{
                OrderSide::Buy,
                true};
        }

        case strategy::StrategyAction::ExitLong:
        {
            return ExecutionDecision{
                OrderSide::Sell,
                true};
        }
        }

        throw std::invalid_argument(
            "Invalid strategy action.");
    }

    ExecutionReport ExecutionEngine::process(
        const matching::MatchResult &matchResult)
    {
        ExecutionReport report{};

        report.requestedQuantity =
            matchResult.requestedQuantity;

        report.executedQuantity =
            matchResult.filledQuantity;

        report.remainingQuantity =
            matchResult.remainingQuantity;

        report.averageExecutionPrice =
            matchResult.averageFillPrice;

        if (matchResult.filledQuantity <= 0.0)
        {
            report.status =
                ExecutionStatus::NoExecution;
        }
        else if (matchResult.remainingQuantity > 0.0)
        {
            report.status =
                ExecutionStatus::PartiallyFilled;
        }
        else
        {
            report.status =
                ExecutionStatus::Filled;
        }

        return report;
    }

} // namespace quantpulse::domain::execution