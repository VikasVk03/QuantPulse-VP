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

} // namespace quantpulse::domain::execution