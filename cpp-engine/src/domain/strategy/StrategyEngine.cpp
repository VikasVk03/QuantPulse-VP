#include "quantpulse/domain/strategy/StrategyEngine.hpp"

#include <cmath>
#include <stdexcept>

namespace quantpulse::domain::strategy
{

    StrategyDecision StrategyEngine::evaluate(
        double signal,
        Position currentPosition,
        double entryThreshold,
        double exitThreshold)
    {
        if (!std::isfinite(signal))
        {
            throw std::invalid_argument(
                "Signal must be finite.");
        }

        if (!std::isfinite(entryThreshold))
        {
            throw std::invalid_argument(
                "Entry threshold must be finite.");
        }

        if (!std::isfinite(exitThreshold))
        {
            throw std::invalid_argument(
                "Exit threshold must be finite.");
        }

        if (exitThreshold > entryThreshold)
        {
            throw std::invalid_argument(
                "Exit threshold must not exceed entry threshold.");
        }

        switch (currentPosition)
        {
        case Position::Flat:
        {
            if (signal > entryThreshold)
            {
                return StrategyDecision{
                    StrategyAction::EnterLong,
                    Position::Long};
            }

            return StrategyDecision{
                StrategyAction::Hold,
                Position::Flat};
        }

        case Position::Long:
        {
            if (signal < exitThreshold)
            {
                return StrategyDecision{
                    StrategyAction::ExitLong,
                    Position::Flat};
            }

            return StrategyDecision{
                StrategyAction::Hold,
                Position::Long};
        }
        }

        throw std::invalid_argument(
            "Invalid strategy position.");
    }

} // namespace quantpulse::domain::strategy