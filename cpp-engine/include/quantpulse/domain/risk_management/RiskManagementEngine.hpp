#pragma once

namespace quantpulse::domain::risk_management
{

    struct RiskManagementConfig
    {
        /*
         * Maximum fraction of capital allowed
         * to be allocated to a single position.
         *
         * Example:
         *
         * 0.20 = 20%
         */
        double maximumPositionFraction = 0.20;

        /*
         * Maximum portfolio drawdown allowed
         * before new trades are rejected.
         *
         * Example:
         *
         * 0.15 = 15%
         */
        double maximumDrawdownFraction = 0.15;

        /*
         * Maximum fraction of capital that may
         * be lost on a single trade.
         *
         * Example:
         *
         * 0.01 = 1%
         */
        double maximumRiskPerTradeFraction = 0.01;
    };

    struct RiskDecision
    {
        bool allowed;

        bool positionLimitExceeded;

        bool drawdownLimitExceeded;

        bool riskLimitExceeded;
    };

    class RiskManagementEngine
    {
    public:
        /**
         * @brief Evaluate whether a proposed trade
         *        satisfies portfolio risk limits.
         *
         * @param capital Current portfolio capital.
         * @param proposedPositionValue Proposed
         *        position notional value.
         * @param potentialLoss Maximum expected
         *        loss if the trade fails.
         * @param currentDrawdown Current portfolio
         *        drawdown as a positive fraction.
         * @param config Risk management limits.
         *
         * @return Risk decision describing whether
         *         the trade is allowed.
         *
         * @throw std::invalid_argument if inputs
         *        or configuration are invalid.
         */
        [[nodiscard]]
        static RiskDecision evaluate(
            double capital,
            double proposedPositionValue,
            double potentialLoss,
            double currentDrawdown,
            const RiskManagementConfig &config = {});
    };

} // namespace quantpulse::domain::risk_management