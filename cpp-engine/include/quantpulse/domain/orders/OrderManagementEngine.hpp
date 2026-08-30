#pragma once

#include <cstddef>

namespace quantpulse::domain::orders
{

    enum class OrderSide
    {
        Buy,
        Sell
    };

    enum class OrderStatus
    {
        Created,
        Submitted,
        Accepted,
        PartiallyFilled,
        Filled,
        Cancelled,
        Rejected
    };

    struct Order
    {
        std::size_t id;

        OrderSide side;

        double quantity;
        double filledQuantity;

        double price;

        OrderStatus status;
    };

    class OrderManagementEngine
    {
    public:
        /**
         * @brief Create a new order.
         *
         * A newly created order has zero filled quantity
         * and the Created status.
         *
         * @param id Unique order identifier.
         * @param side Buy or sell side.
         * @param quantity Requested order quantity.
         * @param price Expected execution price.
         *
         * @return Newly created order.
         *
         * @throw std::invalid_argument if quantity or
         *        price are invalid.
         */
        [[nodiscard]]
        static Order create(
            std::size_t id,
            OrderSide side,
            double quantity,
            double price);

        /**
         * @brief Submit an order for execution.
         *
         * Only Created orders may be submitted.
         *
         * @param order Existing order.
         *
         * @return Updated order.
         *
         * @throw std::invalid_argument if the state
         *        transition is invalid.
         */
        [[nodiscard]]
        static Order submit(
            const Order &order);

        /**
         * @brief Accept a submitted order.
         *
         * Only Submitted orders may be accepted.
         *
         * @param order Existing order.
         *
         * @return Updated order.
         *
         * @throw std::invalid_argument if the state
         *        transition is invalid.
         */
        [[nodiscard]]
        static Order accept(
            const Order &order);

        /**
         * @brief Reject an order.
         *
         * Only Submitted orders may be rejected.
         *
         * @param order Existing order.
         *
         * @return Updated order.
         *
         * @throw std::invalid_argument if the state
         *        transition is invalid.
         */
        [[nodiscard]]
        static Order reject(
            const Order &order);

        /**
         * @brief Apply an execution fill to an order.
         *
         * Accepted or partially filled orders may receive
         * additional fills.
         *
         * The order becomes:
         *
         * PartiallyFilled
         *     if total filled quantity is less than
         *     requested quantity.
         *
         * Filled
         *     if total filled quantity equals requested
         *     quantity.
         *
         * @param order Existing order.
         * @param fillQuantity Newly executed quantity.
         *
         * @return Updated order.
         *
         * @throw std::invalid_argument if the fill or
         *        order state is invalid.
         */
        [[nodiscard]]
        static Order fill(
            const Order &order,
            double fillQuantity);

        /**
         * @brief Cancel an active order.
         *
         * Created, Submitted, Accepted, and
         * PartiallyFilled orders may be cancelled.
         *
         * @param order Existing order.
         *
         * @return Updated order.
         *
         * @throw std::invalid_argument if the order
         *        cannot be cancelled.
         */
        [[nodiscard]]
        static Order cancel(
            const Order &order);
    };

} // namespace quantpulse::domain::orders