#include "quantpulse/domain/sizing/PositionSizingEngine.hpp"

#include <algorithm>
#include <cmath>
#include <stdexcept>
#include <string>

namespace quantpulse::domain::sizing
{

    namespace
    {

        void validateFinitePositive(
            double value,
            const char *name)
        {
            if (!std::isfinite(value) ||
                value <= 0.0)
            {
                throw std::invalid_argument(
                    std::string(name) +
                    " must be finite and positive.");
            }
        }

        void validateFraction(
            double value,
            const char *name)
        {
            if (!std::isfinite(value) ||
                value < 0.0 ||
                value > 1.0)
            {
                throw std::invalid_argument(
                    std::string(name) +
                    " must be between 0 and 1.");
            }
        }

        void validateConfig(
            const PositionSizingConfig &config)
        {
            validateFraction(
                config.allocationFraction,
                "Allocation fraction");

            validateFraction(
                config.maximumAllocationFraction,
                "Maximum allocation fraction");

            validateFraction(
                config.riskFraction,
                "Risk fraction");

            if (config.allocationFraction >
                config.maximumAllocationFraction)
            {
                throw std::invalid_argument(
                    "Allocation fraction must not exceed "
                    "maximum allocation fraction.");
            }
        }

    } // namespace

    PositionSizingResult
    PositionSizingEngine::calculate(
        double capital,
        double entryPrice,
        double stopPrice,
        const PositionSizingConfig &config)
    {
        validateFinitePositive(
            capital,
            "Capital");

        validateFinitePositive(
            entryPrice,
            "Entry price");

        validateFinitePositive(
            stopPrice,
            "Stop price");

        validateConfig(config);

        const double maximumPositionValue =
            capital *
            config.maximumAllocationFraction;

        double positionValue = 0.0;

        switch (config.method)
        {
        case PositionSizingMethod::FixedFraction:
        {
            positionValue =
                capital *
                config.allocationFraction;

            break;
        }

        case PositionSizingMethod::RiskBased:
        {
            const double stopDistance =
                std::abs(
                    entryPrice -
                    stopPrice);

            if (stopDistance == 0.0)
            {
                throw std::invalid_argument(
                    "Entry price and stop price "
                    "must not be equal for risk-based sizing.");
            }

            const double riskCapital =
                capital *
                config.riskFraction;

            const double uncappedQuantity =
                riskCapital /
                stopDistance;

            positionValue =
                uncappedQuantity *
                entryPrice;

            break;
        }

        default:
        {
            throw std::invalid_argument(
                "Invalid position sizing method.");
        }
        }

        positionValue =
            std::min(
                positionValue,
                maximumPositionValue);

        const double quantity =
            positionValue /
            entryPrice;

        return PositionSizingResult{
            positionValue,
            quantity,
            positionValue};
    }

} // namespace quantpulse::domain::sizing