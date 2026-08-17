#include "quantpulse/domain/volatility/VolatilityEngine.hpp"

#include <benchmark/benchmark.h>

#include <vector>

using quantpulse::domain::volatility::VolatilityEngine;

namespace
{

    std::vector<double> generateReturns(std::size_t size)
    {
        std::vector<double> returns;
        returns.reserve(size);

        for (std::size_t i = 0; i < size; ++i)
        {
            returns.push_back(
                (static_cast<double>(i % 100) - 50.0) / 10000.0);
        }

        return returns;
    }

} // namespace

static void BM_HISTORICAL_VOLATILITY(
    benchmark::State &state)
{
    const auto returns =
        generateReturns(static_cast<std::size_t>(state.range(0)));

    for (auto _ : state)
    {
        const double result =
            VolatilityEngine::historicalVolatility(
                returns,
                252.0);

        benchmark::DoNotOptimize(result);
    }
}

BENCHMARK(BM_HISTORICAL_VOLATILITY)
    ->RangeMultiplier(10)
    ->Range(1000, 1000000);

BENCHMARK_MAIN();