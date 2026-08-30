#include "quantpulse/domain/orders/OrderManagementEngine.hpp"

#include <benchmark/benchmark.h>

namespace
{

    using quantpulse::domain::orders::
        OrderManagementEngine;

    using quantpulse::domain::orders::
        OrderSide;

    static void BM_ORDER_CREATE(
        benchmark::State &state)
    {
        for (auto _ : state)
        {
            const auto order =
                OrderManagementEngine::create(
                    1,
                    OrderSide::Buy,
                    100.0,
                    50.0);

            benchmark::DoNotOptimize(
                order);
        }
    }

    static void BM_ORDER_SUBMIT(
        benchmark::State &state)
    {
        const auto order =
            OrderManagementEngine::create(
                1,
                OrderSide::Buy,
                100.0,
                50.0);

        for (auto _ : state)
        {
            const auto result =
                OrderManagementEngine::submit(
                    order);

            benchmark::DoNotOptimize(
                result);
        }
    }

    static void BM_ORDER_ACCEPT(
        benchmark::State &state)
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

        for (auto _ : state)
        {
            const auto result =
                OrderManagementEngine::accept(
                    order);

            benchmark::DoNotOptimize(
                result);
        }
    }

    static void BM_ORDER_PARTIAL_FILL(
        benchmark::State &state)
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

        for (auto _ : state)
        {
            const auto result =
                OrderManagementEngine::fill(
                    order,
                    50.0);

            benchmark::DoNotOptimize(
                result);
        }
    }

    static void BM_ORDER_FULL_FILL(
        benchmark::State &state)
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

        for (auto _ : state)
        {
            const auto result =
                OrderManagementEngine::fill(
                    order,
                    100.0);

            benchmark::DoNotOptimize(
                result);
        }
    }

    static void BM_ORDER_CANCEL(
        benchmark::State &state)
    {
        const auto order =
            OrderManagementEngine::create(
                1,
                OrderSide::Buy,
                100.0,
                50.0);

        for (auto _ : state)
        {
            const auto result =
                OrderManagementEngine::cancel(
                    order);

            benchmark::DoNotOptimize(
                result);
        }
    }

} // namespace
BENCHMARK(BM_ORDER_CREATE);

BENCHMARK(BM_ORDER_SUBMIT);

BENCHMARK(BM_ORDER_ACCEPT);

BENCHMARK(BM_ORDER_PARTIAL_FILL);

BENCHMARK(BM_ORDER_FULL_FILL);

BENCHMARK(BM_ORDER_CANCEL);