#include "quantpulse/domain/orders/OrderManagementEngine.hpp"

#include <cmath>
#include <stdexcept>

namespace quantpulse::domain::orders
{

    namespace
    {

        void validatePositiveFinite(
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

        void validateOrder(
            const Order &order)
        {
            validatePositiveFinite(
                order.quantity,
                "Order quantity");

            validatePositiveFinite(
                order.price,
                "Order price");

            if (!std::isfinite(
                    order.filledQuantity) ||
                order.filledQuantity < 0.0 ||
                order.filledQuantity >
                    order.quantity)
            {
                throw std::invalid_argument(
                    "Filled quantity is invalid.");
            }
        }

        bool isActive(
            OrderStatus status)
        {
            return status == OrderStatus::Created ||
                   status == OrderStatus::Submitted ||
                   status == OrderStatus::Accepted ||
                   status == OrderStatus::PartiallyFilled;
        }

    } // namespace

    Order OrderManagementEngine::create(
        std::size_t id,
        OrderSide side,
        double quantity,
        double price)
    {
        validatePositiveFinite(
            quantity,
            "Order quantity");

        validatePositiveFinite(
            price,
            "Order price");

        return Order{
            id,
            side,
            quantity,
            0.0,
            price,
            OrderStatus::Created};
    }

    Order OrderManagementEngine::submit(
        const Order &order)
    {
        validateOrder(order);

        if (order.status !=
            OrderStatus::Created)
        {
            throw std::invalid_argument(
                "Only created orders may be submitted.");
        }

        Order updatedOrder = order;

        updatedOrder.status =
            OrderStatus::Submitted;

        return updatedOrder;
    }

    Order OrderManagementEngine::accept(
        const Order &order)
    {
        validateOrder(order);

        if (order.status !=
            OrderStatus::Submitted)
        {
            throw std::invalid_argument(
                "Only submitted orders may be accepted.");
        }

        Order updatedOrder = order;

        updatedOrder.status =
            OrderStatus::Accepted;

        return updatedOrder;
    }

    Order OrderManagementEngine::reject(
        const Order &order)
    {
        validateOrder(order);

        if (order.status !=
            OrderStatus::Submitted)
        {
            throw std::invalid_argument(
                "Only submitted orders may be rejected.");
        }

        Order updatedOrder = order;

        updatedOrder.status =
            OrderStatus::Rejected;

        return updatedOrder;
    }

    Order OrderManagementEngine::fill(
        const Order &order,
        double fillQuantity)
    {
        validateOrder(order);

        validatePositiveFinite(
            fillQuantity,
            "Fill quantity");

        if (order.status !=
                OrderStatus::Accepted &&
            order.status !=
                OrderStatus::PartiallyFilled)
        {
            throw std::invalid_argument(
                "Only active accepted orders may be filled.");
        }

        const double remainingQuantity =
            order.quantity -
            order.filledQuantity;

        if (fillQuantity >
            remainingQuantity)
        {
            throw std::invalid_argument(
                "Fill quantity exceeds remaining order quantity.");
        }

        Order updatedOrder = order;

        updatedOrder.filledQuantity +=
            fillQuantity;

        if (updatedOrder.filledQuantity ==
            updatedOrder.quantity)
        {
            updatedOrder.status =
                OrderStatus::Filled;
        }
        else
        {
            updatedOrder.status =
                OrderStatus::PartiallyFilled;
        }

        return updatedOrder;
    }

    Order OrderManagementEngine::cancel(
        const Order &order)
    {
        validateOrder(order);

        if (!isActive(order.status))
        {
            throw std::invalid_argument(
                "Order cannot be cancelled.");
        }

        Order updatedOrder = order;

        updatedOrder.status =
            OrderStatus::Cancelled;

        return updatedOrder;
    }

} // namespace quantpulse::domain::orders