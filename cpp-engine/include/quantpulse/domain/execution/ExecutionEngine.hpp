#pragma once

#include "quantpulse/domain/matching/MatchingEngine.hpp"
#include "quantpulse/domain/strategy/StrategyEngine.hpp"

namespace quantpulse::domain::execution
{

    enum class OrderSide
    {
        None,
        Buy,
        Sell
    };

    struct ExecutionDecision
    {
        OrderSide orderSide;
        bool shouldExecute;
    };

    enum class ExecutionStatus
    {
        NoExecution,
        PartiallyFilled,
        Filled
    };

    struct ExecutionReport
    {
        double requestedQuantity = 0.0;
        double executedQuantity = 0.0;
        double remainingQuantity = 0.0;
        double averageExecutionPrice = 0.0;
        ExecutionStatus status =
            ExecutionStatus::NoExecution;
    };

    class ExecutionEngine
    {
    public:
        /**
         * @brief Convert a strategy action into an execution decision.
         */
        [[nodiscard]]
        static ExecutionDecision evaluate(
            strategy::StrategyAction action);

        /**
         * @brief Convert a matching result into an execution report.
         */
        [[nodiscard]]
        static ExecutionReport process(
            const matching::MatchResult &matchResult);
    };

} // namespace quantpulse::domain::execution