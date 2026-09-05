#include "quantpulse/domain/position/PositionEngine.hpp"

#include <cmath>
#include <stdexcept>
#include <string>

namespace quantpulse::domain::position
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

        void validatePosition(
            const Position &position)
        {
            if (!std::isfinite(position.quantity) ||
                position.quantity < 0.0)
            {
                throw std::invalid_argument(
                    "Position quantity must be finite "
                    "and non-negative.");
            }

            if (!std::isfinite(
                    position.averageEntryPrice) ||
                position.averageEntryPrice < 0.0)
            {
                throw std::invalid_argument(
                    "Average entry price must be finite "
                    "and non-negative.");
            }

            if (!std::isfinite(
                    position.realizedPnL))
            {
                throw std::invalid_argument(
                    "Realized P&L must be finite.");
            }
        }

    } // namespace

    void PositionEngine::buy(
        double quantity,
        double executionPrice)
    {
        validateFinitePositive(
            quantity,
            "Quantity");

        validateFinitePositive(
            executionPrice,
            "Execution price");

        validatePosition(
            position_);

        const double oldValue =
            position_.quantity *
            position_.averageEntryPrice;

        const double newValue =
            quantity *
            executionPrice;

        const double newQuantity =
            position_.quantity +
            quantity;

        position_.averageEntryPrice =
            (oldValue + newValue) /
            newQuantity;

        position_.quantity =
            newQuantity;
    }

    void PositionEngine::sell(
        double quantity,
        double executionPrice)
    {
        validateFinitePositive(
            quantity,
            "Quantity");

        validateFinitePositive(
            executionPrice,
            "Execution price");

        validatePosition(
            position_);

        if (position_.quantity <= 0.0)
        {
            throw std::invalid_argument(
                "Cannot sell from a flat position.");
        }

        if (quantity > position_.quantity)
        {
            throw std::invalid_argument(
                "Sell quantity exceeds current position.");
        }

        position_.realizedPnL +=
            quantity *
            (executionPrice -
             position_.averageEntryPrice);

        position_.quantity -=
            quantity;

        if (position_.quantity == 0.0)
        {
            position_.averageEntryPrice =
                0.0;
        }
    }

    const Position &
    PositionEngine::state() const noexcept
    {
        return position_;
    }

    PositionSnapshot
    PositionEngine::snapshot(
        double marketPrice) const
    {
        validateFinitePositive(
            marketPrice,
            "Market price");

        validatePosition(
            position_);

        const double marketValue =
            position_.quantity *
            marketPrice;

        const double unrealizedPnL =
            position_.quantity *
            (marketPrice -
             position_.averageEntryPrice);

        const double totalPnL =
            position_.realizedPnL +
            unrealizedPnL;

        return PositionSnapshot{
            position_.quantity,
            position_.averageEntryPrice,
            marketPrice,
            marketValue,
            unrealizedPnL,
            position_.realizedPnL,
            totalPnL};
    }

    bool PositionEngine::isFlat() const noexcept
    {
        return position_.quantity == 0.0;
    }

    void PositionEngine::reset() noexcept
    {
        position_ = Position{};
    }

} // namespace quantpulse::domain::position