#include "quantpulse/domain/backtest/BacktestEngine.hpp"

#include <benchmark/benchmark.h>

#include <vector>

using quantpulse::domain::backtest::BacktestEngine;
using quantpulse::domain::backtest::MarketObservation;

static std::vector<MarketObservation>
makeObservations(std::size_t size)
{
    std::vector<MarketObservation> observations;
    observations.reserve(size);

    for (std::size_t i = 0;
         i < size;
         ++i)
    {
        const double price =
            100.0 +
            static_cast<double>(i % 100) * 0.01;

        const double signal =
            (i % 20 < 10)
                ? 1.0
                : 0.0;

        observations.push_back(
            MarketObservation{
                price,
                signal});
    }

    return observations;
}

static void BM_BACKTEST_ENGINE(
    benchmark::State &state)
{
    const auto observations =
        makeObservations(
            static_cast<std::size_t>(state.range(0)));

    for (auto _ : state)
    {
        const auto result =
            BacktestEngine::run(
                observations,
                100000.0,
                0.5,
                0.0005);

        benchmark::DoNotOptimize(result.finalCapital);
    }

    state.SetItemsProcessed(
        state.iterations() *
        state.range(0));
}

BENCHMARK(BM_BACKTEST_ENGINE)
    ->Arg(1000)
    ->Arg(10000)
    ->Arg(100000)
    ->Arg(1000000);
