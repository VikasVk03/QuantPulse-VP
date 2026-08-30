#include "quantpulse/domain/orders/OrderManagementEngine.hpp"

#include <gtest/gtest.h>

#include <limits>
#include <stdexcept>

namespace
{

    using quantpulse::domain::orders::
        OrderManagementEngine;

    using quantpulse::domain::orders::
        OrderSide;

    using quantpulse::domain::orders::
        OrderStatus;

    TEST(
        OrderManagementEngineTest,
        CreatesBuyOrder)
    {
        const auto order =
            OrderManagementEngine::create(
                1,
                OrderSide::Buy,
                100.0,
                50.0);

        EXPECT_EQ(
            order.id,
            1U);

        EXPECT_EQ(
            order.side,
            OrderSide::Buy);

        EXPECT_DOUBLE_EQ(
            order.quantity,
            100.0);

        EXPECT_DOUBLE_EQ(
            order.filledQuantity,
            0.0);

        EXPECT_DOUBLE_EQ(
            order.price,
            50.0);

        EXPECT_EQ(
            order.status,
            OrderStatus::Created);
    }

    TEST(
        OrderManagementEngineTest,
        CreatesSellOrder)
    {
        const auto order =
            OrderManagementEngine::create(
                2,
                OrderSide::Sell,
                50.0,
                100.0);

        EXPECT_EQ(
            order.side,
            OrderSide::Sell);

        EXPECT_EQ(
            order.status,
            OrderStatus::Created);
    }

    TEST(
        OrderManagementEngineTest,
        SubmitsCreatedOrder)
    {
        const auto created =
            OrderManagementEngine::create(
                1,
                OrderSide::Buy,
                100.0,
                50.0);

        const auto submitted =
            OrderManagementEngine::submit(
                created);

        EXPECT_EQ(
            submitted.status,
            OrderStatus::Submitted);
    }

    TEST(
        OrderManagementEngineTest,
        AcceptsSubmittedOrder)
    {
        auto order =
            OrderManagementEngine::create(
                1,
                OrderSide::Buy,
                100.0,
                50.0);

        order =
            OrderManagementEngine::submit(
                order);

        order =
            OrderManagementEngine::accept(
                order);

        EXPECT_EQ(
            order.status,
            OrderStatus::Accepted);
    }

    TEST(
        OrderManagementEngineTest,
        RejectsSubmittedOrder)
    {
        auto order =
            OrderManagementEngine::create(
                1,
                OrderSide::Buy,
                100.0,
                50.0);

        order =
            OrderManagementEngine::submit(
                order);

        order =
            OrderManagementEngine::reject(
                order);

        EXPECT_EQ(
            order.status,
            OrderStatus::Rejected);
    }

    TEST(
        OrderManagementEngineTest,
        PartialFillUpdatesQuantity)
    {
        auto order =
            OrderManagementEngine::create(
                1,
                OrderSide::Buy,
                100.0,
                50.0);

        order =
            OrderManagementEngine::submit(
                order);

        order =
            OrderManagementEngine::accept(
                order);

        order =
            OrderManagementEngine::fill(
                order,
                40.0);

        EXPECT_DOUBLE_EQ(
            order.filledQuantity,
            40.0);

        EXPECT_EQ(
            order.status,
            OrderStatus::PartiallyFilled);
    }

    TEST(
        OrderManagementEngineTest,
        MultipleFillsCompleteOrder)
    {
        auto order =
            OrderManagementEngine::create(
                1,
                OrderSide::Buy,
                100.0,
                50.0);

        order =
            OrderManagementEngine::submit(
                order);

        order =
            OrderManagementEngine::accept(
                order);

        order =
            OrderManagementEngine::fill(
                order,
                40.0);

        order =
            OrderManagementEngine::fill(
                order,
                60.0);

        EXPECT_DOUBLE_EQ(
            order.filledQuantity,
            100.0);

        EXPECT_EQ(
            order.status,
            OrderStatus::Filled);
    }

    TEST(
        OrderManagementEngineTest,
        CancelsCreatedOrder)
    {
        auto order =
            OrderManagementEngine::create(
                1,
                OrderSide::Buy,
                100.0,
                50.0);

        order =
            OrderManagementEngine::cancel(
                order);

        EXPECT_EQ(
            order.status,
            OrderStatus::Cancelled);
    }

    TEST(
        OrderManagementEngineTest,
        CancelsSubmittedOrder)
    {
        auto order =
            OrderManagementEngine::create(
                1,
                OrderSide::Buy,
                100.0,
                50.0);

        order =
            OrderManagementEngine::submit(
                order);

        order =
            OrderManagementEngine::cancel(
                order);

        EXPECT_EQ(
            order.status,
            OrderStatus::Cancelled);
    }

    TEST(
        OrderManagementEngineTest,
        CancelsPartiallyFilledOrder)
    {
        auto order =
            OrderManagementEngine::create(
                1,
                OrderSide::Buy,
                100.0,
                50.0);

        order =
            OrderManagementEngine::submit(
                order);

        order =
            OrderManagementEngine::accept(
                order);

        order =
            OrderManagementEngine::fill(
                order,
                25.0);

        order =
            OrderManagementEngine::cancel(
                order);

        EXPECT_EQ(
            order.status,
            OrderStatus::Cancelled);
    }

    TEST(
        OrderManagementEngineTest,
        RejectsInvalidOrderQuantity)
    {
        EXPECT_THROW(
            OrderManagementEngine::create(
                1,
                OrderSide::Buy,
                0.0,
                50.0),
            std::invalid_argument);
    }

    TEST(
        OrderManagementEngineTest,
        RejectsInvalidOrderPrice)
    {
        EXPECT_THROW(
            OrderManagementEngine::create(
                1,
                OrderSide::Buy,
                100.0,
                0.0),
            std::invalid_argument);
    }

    TEST(
        OrderManagementEngineTest,
        RejectsNonFiniteOrderValues)
    {
        EXPECT_THROW(
            OrderManagementEngine::create(
                1,
                OrderSide::Buy,
                std::numeric_limits<double>::
                    infinity(),
                50.0),
            std::invalid_argument);

        EXPECT_THROW(
            OrderManagementEngine::create(
                1,
                OrderSide::Buy,
                100.0,
                std::numeric_limits<double>::
                    quiet_NaN()),
            std::invalid_argument);
    }

    TEST(
        OrderManagementEngineTest,
        RejectsInvalidSubmitTransition)
    {
        const auto order =
            OrderManagementEngine::create(
                1,
                OrderSide::Buy,
                100.0,
                50.0);

        EXPECT_THROW(
            OrderManagementEngine::accept(
                order),
            std::invalid_argument);
    }

    TEST(
        OrderManagementEngineTest,
        RejectsInvalidFillTransition)
    {
        const auto order =
            OrderManagementEngine::create(
                1,
                OrderSide::Buy,
                100.0,
                50.0);

        EXPECT_THROW(
            OrderManagementEngine::fill(
                order,
                10.0),
            std::invalid_argument);
    }

    TEST(
        OrderManagementEngineTest,
        RejectsFillGreaterThanRemainingQuantity)
    {
        auto order =
            OrderManagementEngine::create(
                1,
                OrderSide::Buy,
                100.0,
                50.0);

        order =
            OrderManagementEngine::submit(
                order);

        order =
            OrderManagementEngine::accept(
                order);

        EXPECT_THROW(
            OrderManagementEngine::fill(
                order,
                101.0),
            std::invalid_argument);
    }

    TEST(
        OrderManagementEngineTest,
        RejectsCancellationOfFilledOrder)
    {
        auto order =
            OrderManagementEngine::create(
                1,
                OrderSide::Buy,
                100.0,
                50.0);

        order =
            OrderManagementEngine::submit(
                order);

        order =
            OrderManagementEngine::accept(
                order);

        order =
            OrderManagementEngine::fill(
                order,
                100.0);

        EXPECT_THROW(
            OrderManagementEngine::cancel(
                order),
            std::invalid_argument);
    }

    TEST(
        OrderManagementEngineTest,
        RejectsCancellationOfRejectedOrder)
    {
        auto order =
            OrderManagementEngine::create(
                1,
                OrderSide::Buy,
                100.0,
                50.0);

        order =
            OrderManagementEngine::submit(
                order);

        order =
            OrderManagementEngine::reject(
                order);

        EXPECT_THROW(
            OrderManagementEngine::cancel(
                order),
            std::invalid_argument);
    }

    TEST(
        OrderManagementEngineTest,
        RejectsZeroFillQuantity)
    {
        auto order =
            OrderManagementEngine::create(
                1,
                OrderSide::Buy,
                100.0,
                50.0);

        order =
            OrderManagementEngine::submit(
                order);

        order =
            OrderManagementEngine::accept(
                order);

        EXPECT_THROW(
            OrderManagementEngine::fill(
                order,
                0.0),
            std::invalid_argument);
    }

} // namespace