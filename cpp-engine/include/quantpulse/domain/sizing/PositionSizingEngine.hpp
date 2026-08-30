#pragma once

namespace quantpulse::domain::sizing
{

    enum class PositionSizingMethod
    {
        FixedFraction,
        RiskBased
    };

    struct PositionSizingConfig
    {
        PositionSizingMethod method =
            PositionSizingMethod::FixedFraction;

        /*
         * Fraction of available capital allocated
         * to a position.
         *
         * Example:
         *
         * allocationFraction = 0.10
         *
         * means allocate 10% of capital.
         */
        double allocationFraction = 0.10;

        /*
         * Maximum fraction of capital that may be
         * allocated to one position.
         */
        double maximumAllocationFraction = 1.0;

        /*
         * Fraction of capital allowed to be lost
         * if the trade reaches its stop price.
         *
         * Used by risk-based sizing.
         */
        double riskFraction = 0.01;
    };

    struct PositionSizingResult
    {
        double positionValue;

        double quantity;

        double allocatedCapital;
    };

    class PositionSizingEngine
    {
    public:
        /**
         * @brief Calculate the position size for a trade.
         *
         * FixedFraction:
         *
         *     allocated capital =
         *         capital * allocationFraction
         *
         *     quantity =
         *         allocated capital / price
         *
         * RiskBased:
         *
         *     risk capital =
         *         capital * riskFraction
         *
         *     quantity =
         *         risk capital /
         *         abs(entryPrice - stopPrice)
         *
         * The resulting position is capped by
         * maximumAllocationFraction.
         *
         * @param capital Available trading capital.
         * @param entryPrice Expected entry price.
         * @param stopPrice Stop-loss price.
         * @param config Position sizing configuration.
         *
         * @return Calculated position size.
         *
         * @throw std::invalid_argument if inputs
         *        or configuration are invalid.
         */
        [[nodiscard]]
        static PositionSizingResult calculate(
            double capital,
            double entryPrice,
            double stopPrice,
            const PositionSizingConfig &config = {});
    };

} // namespace quantpulse::domain::sizing