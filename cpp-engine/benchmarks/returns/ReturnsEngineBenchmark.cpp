#include "quantpulse/domain/returns/ReturnsEngine.hpp"

#include <benchmark/benchmark.h>

#include <random>
#include <vector>

using quantpulse::domain::returns::ReturnsEngine;

namespace
{

    std::vector<double> generatePrices(std::size_t size)
    {
        std::mt19937_64 generator(42);

        std::uniform_real_distribution<double> distribution(
            50.0,
            150.0);

        std::vector<double> prices;
        prices.reserve(size);

        for (std::size_t i = 0; i < size; ++i)
        {
            prices.push_back(distribution(generator));
        }

        return prices;
    }

    std::vector<double> generateReturns(std::size_t size)
    {
        std::mt19937_64 generator(42);

        std::uniform_real_distribution<double> distribution(
            -0.05,
            0.05);

        std::vector<double> returns;
        returns.reserve(size);

        for (std::size_t i = 0; i < size; ++i)
        {
            returns.push_back(distribution(generator));
        }

        return returns;
    }

} // namespace

static void BM_SIMPLE_RETURNS(benchmark::State &state)
{
    const auto prices =
        generatePrices(static_cast<std::size_t>(state.range(0)));

    for (auto _ : state)
    {
        const auto result =
            ReturnsEngine::simpleReturns(prices);

        benchmark::DoNotOptimize(result);
    }
}

static void BM_LOG_RETURNS(benchmark::State &state)
{
    const auto prices =
        generatePrices(static_cast<std::size_t>(state.range(0)));

    for (auto _ : state)
    {
        const auto result =
            ReturnsEngine::logReturns(prices);

        benchmark::DoNotOptimize(result);
    }
}

static void BM_CUMULATIVE_RETURN(benchmark::State &state)
{
    const auto returns =
        generateReturns(static_cast<std::size_t>(state.range(0)));

    for (auto _ : state)
    {
        const auto result =
            ReturnsEngine::cumulativeReturn(returns);

        benchmark::DoNotOptimize(result);
    }
}

BENCHMARK(BM_SIMPLE_RETURNS)
    ->RangeMultiplier(10)
    ->Range(1'000, 1'000'000);

BENCHMARK(BM_LOG_RETURNS)
    ->RangeMultiplier(10)
    ->Range(1'000, 1'000'000);

BENCHMARK(BM_CUMULATIVE_RETURN)
    ->RangeMultiplier(10)
    ->Range(1'000, 1'000'000);

// BENCHMARK_MAIN();