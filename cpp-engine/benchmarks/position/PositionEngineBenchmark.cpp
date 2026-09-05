#include "quantpulse/domain/position/PositionEngine.hpp"

#include <benchmark/benchmark.h>

namespace
{

    using quantpulse::domain::position::PositionEngine;

} // namespace

static void BM_POSITION_BUY(
    benchmark::State &state)
{
    for (auto _ : state)
    {
        PositionEngine engine;

        engine.buy(
            100.0,
            100.0);

        benchmark::DoNotOptimize(
            engine.state().quantity);
    }

    state.SetItemsProcessed(
        state.iterations());
}

BENCHMARK(
    BM_POSITION_BUY);

static void BM_POSITION_SELL(
    benchmark::State &state)
{
    for (auto _ : state)
    {
        PositionEngine engine;

        engine.buy(
            100.0,
            100.0);

        engine.sell(
            25.0,
            110.0);

        benchmark::DoNotOptimize(
            engine.state().realizedPnL);
    }

    state.SetItemsProcessed(
        state.iterations());
}

BENCHMARK(
    BM_POSITION_SELL);

static void BM_POSITION_SNAPSHOT(
    benchmark::State &state)
{
    PositionEngine engine;

    engine.buy(
        100.0,
        100.0);

    for (auto _ : state)
    {
        const auto snapshot =
            engine.snapshot(
                110.0);

        benchmark::DoNotOptimize(
            snapshot.totalPnL);
    }

    state.SetItemsProcessed(
        state.iterations());
}

BENCHMARK(
    BM_POSITION_SNAPSHOT);

static void BM_POSITION_MULTI_BUY(
    benchmark::State &state)
{
    for (auto _ : state)
    {
        PositionEngine engine;

        engine.buy(
            100.0,
            100.0);

        engine.buy(
            200.0,
            105.0);

        engine.buy(
            150.0,
            110.0);

        benchmark::DoNotOptimize(
            engine.state().averageEntryPrice);
    }

    state.SetItemsProcessed(
        state.iterations());
}
BENCHMARK(
    BM_POSITION_MULTI_BUY);

static void BM_POSITION_FULL_LIFECYCLE(
    benchmark::State &state)
{
    for (auto _ : state)
    {
        PositionEngine engine;

        engine.buy(
            100.0,
            100.0);

        engine.buy(
            50.0,
            105.0);

        engine.sell(
            75.0,
            110.0);

        const auto snapshot =
            engine.snapshot(
                108.0);

        benchmark::DoNotOptimize(
            snapshot.totalPnL);
    }

    state.SetItemsProcessed(
        state.iterations());
}

BENCHMARK(
    BM_POSITION_FULL_LIFECYCLE);