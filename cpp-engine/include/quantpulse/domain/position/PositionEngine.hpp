#pragma once

#include <cstddef>

namespace quantpulse::domain::position
{

    struct Position
    {
        double quantity = 0.0;

        double averageEntryPrice = 0.0;

        double realizedPnL = 0.0;
    };

    struct PositionSnapshot
    {
        double quantity;

        double averageEntryPrice;

        double marketPrice;

        double marketValue;

        double unrealizedPnL;

        double realizedPnL;

        double totalPnL;
    };

    class PositionEngine
    {
    public:
        /**
         * @brief Create an empty position.
         */
        PositionEngine() = default;

        /**
         * @brief Apply a buy execution to the position.
         *
         * Buys increase quantity and update the
         * weighted average entry price.
         *
         * @param quantity Executed quantity.
         * @param executionPrice Execution price.
         *
         * @throw std::invalid_argument if inputs are invalid.
         */
        void buy(
            double quantity,
            double executionPrice);

        /**
         * @brief Apply a sell execution to the position.
         *
         * Sells reduce the current position and
         * realize P&L against the average entry price.
         *
         * @param quantity Executed quantity.
         * @param executionPrice Execution price.
         *
         * @throw std::invalid_argument if inputs are invalid
         *        or quantity exceeds the current position.
         */
        void sell(
            double quantity,
            double executionPrice);

        /**
         * @brief Return the current position state.
         */
        [[nodiscard]]
        const Position &state() const noexcept;

        /**
         * @brief Calculate the current marked-to-market
         *        position snapshot.
         *
         * @param marketPrice Current market price.
         *
         * @return Position valuation and P&L.
         *
         * @throw std::invalid_argument if market price
         *        is invalid.
         */
        [[nodiscard]]
        PositionSnapshot snapshot(
            double marketPrice) const;

        /**
         * @brief Return whether the position is flat.
         */
        [[nodiscard]]
        bool isFlat() const noexcept;

        /**
         * @brief Reset the position and realized P&L.
         */
        void reset() noexcept;

    private:
        Position position_{};
    };

} // namespace quantpulse::domain::position