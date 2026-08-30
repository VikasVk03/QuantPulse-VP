#include "quantpulse/domain/portfolio_state/PortfolioStateEngine.hpp"

#include <cmath>
#include <stdexcept>
#include <string>

namespace quantpulse::domain::portfolio_state
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

        void validateState(
            const PortfolioState &state)
        {
            validateFiniteNonNegative(
                state.cash,
                "Cash");

            validateFiniteNonNegative(
                state.quantity,
                "Quantity");

            validateFiniteNonNegative(
                state.averageEntryPrice,
                "Average entry price");

            if (!std::isfinite(
                    state.realizedPnL))
            {
                throw std::invalid_argument(
                    "Realized PnL must be finite.");
            }

            /*
             * An empty position must not retain
             * an entry price.
             */
            if (state.quantity == 0.0 &&
                state.averageEntryPrice != 0.0)
            {
                throw std::invalid_argument(
                    "Empty position must have zero "
                    "average entry price.");
            }

            /*
             * A non-empty position requires
             * a valid entry price.
             */
            if (state.quantity > 0.0 &&
                state.averageEntryPrice <= 0.0)
            {
                throw std::invalid_argument(
                    "Non-empty position requires "
                    "a positive average entry price.");
            }
        }

    } // namespace

    PortfolioState
    PortfolioStateEngine::initialize(
        double initialCapital)
    {
        validateFinitePositive(
            initialCapital,
            "Initial capital");

        return PortfolioState{
            initialCapital,
            0.0,
            0.0,
            0.0};
    }

    PortfolioState
    PortfolioStateEngine::buy(
        const PortfolioState &state,
        double quantity,
        double price)
    {
        validateState(state);

        validateFinitePositive(
            quantity,
            "Buy quantity");

        validateFinitePositive(
            price,
            "Buy price");

        const double transactionValue =
            quantity * price;

        if (!std::isfinite(
                transactionValue))
        {
            throw std::invalid_argument(
                "Transaction value must be finite.");
        }

        if (transactionValue >
            state.cash)
        {
            throw std::invalid_argument(
                "Insufficient cash for purchase.");
        }

        const double newQuantity =
            state.quantity +
            quantity;

        const double existingPositionValue =
            state.quantity *
            state.averageEntryPrice;

        const double newPositionValue =
            existingPositionValue +
            transactionValue;

        const double newAverageEntryPrice =
            newPositionValue /
            newQuantity;

        return PortfolioState{
            state.cash -
                transactionValue,

            newQuantity,

            newAverageEntryPrice,

            state.realizedPnL};
    }

    PortfolioState
    PortfolioStateEngine::sell(
        const PortfolioState &state,
        double quantity,
        double price)
    {
        validateState(state);

        validateFinitePositive(
            quantity,
            "Sell quantity");

        validateFinitePositive(
            price,
            "Sell price");

        if (quantity >
            state.quantity)
        {
            throw std::invalid_argument(
                "Insufficient quantity for sale.");
        }

        const double transactionValue =
            quantity *
            price;

        if (!std::isfinite(
                transactionValue))
        {
            throw std::invalid_argument(
                "Transaction value must be finite.");
        }

        const double realizedProfitLoss =
            quantity *
            (price -
             state.averageEntryPrice);

        const double newQuantity =
            state.quantity -
            quantity;

        /*
         * If the position is completely closed,
         * reset average entry price.
         */
        const double newAverageEntryPrice =
            newQuantity == 0.0
                ? 0.0
                : state.averageEntryPrice;

        return PortfolioState{
            state.cash +
                transactionValue,

            newQuantity,

            newAverageEntryPrice,

            state.realizedPnL +
                realizedProfitLoss};
    }

    PortfolioSnapshot
    PortfolioStateEngine::snapshot(
        const PortfolioState &state,
        double marketPrice)
    {
        validateState(state);

        validateFinitePositive(
            marketPrice,
            "Market price");

        const double marketValue =
            state.quantity *
            marketPrice;

        const double unrealizedPnL =
            state.quantity *
            (marketPrice -
             state.averageEntryPrice);

        const double totalEquity =
            state.cash +
            marketValue;

        return PortfolioSnapshot{
            state.cash,
            state.quantity,
            state.averageEntryPrice,
            state.realizedPnL,
            unrealizedPnL,
            marketValue,
            totalEquity};
    }

} // namespace quantpulse::domain::portfolio_state