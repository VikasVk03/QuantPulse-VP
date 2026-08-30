#include "quantpulse/domain/risk_management/RiskManagementEngine.hpp"

#include <cmath>
#include <stdexcept>
#include <string>

namespace quantpulse::domain::risk_management
{

    namespace
    {

        void validateFiniteNonNegative(
            double value,
            const char *name)
        {
            if (!std::isfinite(value) ||
                value < 0.0)
            {
                throw std::invalid_argument(
                    std::string(name) +
                    " must be finite and non-negative.");
            }
        }

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
            const RiskManagementConfig &config)
        {
            validateFraction(
                config.maximumPositionFraction,
                "Maximum position fraction");

            validateFraction(
                config.maximumDrawdownFraction,
                "Maximum drawdown fraction");

            validateFraction(
                config.maximumRiskPerTradeFraction,
                "Maximum risk per trade fraction");
        }

    } // namespace

    RiskDecision RiskManagementEngine::evaluate(
        double capital,
        double proposedPositionValue,
        double potentialLoss,
        double currentDrawdown,
        const RiskManagementConfig &config)
    {
        validateFinitePositive(
            capital,
            "Capital");

        validateFiniteNonNegative(
            proposedPositionValue,
            "Proposed position value");

        validateFiniteNonNegative(
            potentialLoss,
            "Potential loss");

        validateFraction(
            currentDrawdown,
            "Current drawdown");

        validateConfig(config);

        const double maximumPositionValue =
            capital *
            config.maximumPositionFraction;

        const double maximumRisk =
            capital *
            config.maximumRiskPerTradeFraction;

        const bool positionLimitExceeded =
            proposedPositionValue >
            maximumPositionValue;

        const bool drawdownLimitExceeded =
            currentDrawdown >
            config.maximumDrawdownFraction;

        const bool riskLimitExceeded =
            potentialLoss >
            maximumRisk;

        const bool allowed =
            !positionLimitExceeded &&
            !drawdownLimitExceeded &&
            !riskLimitExceeded;

        return RiskDecision{
            allowed,
            positionLimitExceeded,
            drawdownLimitExceeded,
            riskLimitExceeded};
    }

} // namespace quantpulse::domain::risk_management