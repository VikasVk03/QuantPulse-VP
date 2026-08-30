#pragma once

namespace quantpulse::domain::strategy
{

    enum class Position
    {
        Flat,
        Long
    };

    enum class StrategyAction
    {
        Hold,
        EnterLong,
        ExitLong
    };

    struct StrategyDecision
    {
        StrategyAction action;
        Position nextPosition;
    };

    class StrategyEngine
    {
    public:
        /**
         * @brief Evaluate a trading signal and determine
         *        the next trading action.
         *
         * Entry and exit thresholds implement hysteresis.
         *
         * When currently flat:
         *
         *     signal > entryThreshold
         *         -> EnterLong
         *
         * Otherwise:
         *
         *     -> Hold
         *
         * When currently long:
         *
         *     signal < exitThreshold
         *         -> ExitLong
         *
         * Otherwise:
         *
         *     -> Hold
         *
         * @param signal Trading signal.
         * @param currentPosition Current portfolio position.
         * @param entryThreshold Threshold required to enter long.
         * @param exitThreshold Threshold required to exit long.
         *
         * @return StrategyDecision containing the trading
         *         action and next position.
         *
         * @throw std::invalid_argument if any threshold or
         *        signal is non-finite, or if exitThreshold is
         *        greater than entryThreshold.
         */
        [[nodiscard]]
        static StrategyDecision evaluate(
            double signal,
            Position currentPosition,
            double entryThreshold,
            double exitThreshold);
    };

} // namespace quantpulse::domain::strategy