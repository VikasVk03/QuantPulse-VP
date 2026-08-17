#include "quantpulse/domain/statistics/StatisticsEngine.hpp"

#include <benchmark/benchmark.h>

#include <random>
#include <vector>

using quantpulse::domain::statistics::StatisticsEngine;

namespace
{
    std::vector<double> generateDataset(std::size_t size)
    {
        std::vector<double> values;
        values.reserve(size);

        std::mt19937_64 generator(42);
        std::uniform_real_distribution<double> distribution(50.0, 150.0);

        for (std::size_t i = 0; i < size; ++i)
        {
            values.push_back(distribution(generator));
        }

        return values;
    }

    void benchmarkDatasetSize(benchmark::State &state)
    {
        state.SetComplexityN(state.range(0));
    }
} // namespace

// ---------------------------------------------------------
// * Mean
// ---------------------------------------------------------

static void BM_MEAN(benchmark::State &state)
{
    const auto values = generateDataset(static_cast<std::size_t>(state.range(0)));

    for (auto _ : state)
    {
        double result = StatisticsEngine::mean(values);

        benchmark::DoNotOptimize(result);
    }

    benchmarkDatasetSize(state);
}

// ---------------------------------------------------------
// * Median
// ---------------------------------------------------------

static void BM_Median(benchmark::State &state)
{
    const auto values = generateDataset(static_cast<std::size_t>(state.range(0)));

    for (auto _ : state)
    {
        double result = StatisticsEngine::median(values);

        benchmark::DoNotOptimize(result);
    }

    benchmarkDatasetSize(state);
}

// ---------------------------------------------------------
// * Variance
// ---------------------------------------------------------

static void BM_Variance(benchmark::State &state)
{
    const auto values = generateDataset(static_cast<std::size_t>(state.range(0)));

    for (auto _ : state)
    {
        double result = StatisticsEngine::variance(values);

        benchmark::DoNotOptimize(result);
    }

    benchmarkDatasetSize(state);
}

// ---------------------------------------------------------
// * Standard Deviation
// ---------------------------------------------------------

static void BM_StandardDeviation(benchmark::State &state)
{
    const auto values = generateDataset(static_cast<std::size_t>(state.range(0)));

    for (auto _ : state)
    {
        double result = StatisticsEngine::standardDeviation(values);

        benchmark::DoNotOptimize(result);
    }

    benchmarkDatasetSize(state);
}

// ---------------------------------------------------------
// * Dataset Sizes
// ---------------------------------------------------------

#define QUANTPULSE_BENCHMARK_SIZES \
    ->Arg(1'000)                   \
        ->Arg(10'000)              \
        ->Arg(100'000)             \
        ->Arg(1'000'000)           \
        ->Complexity()

BENCHMARK(BM_MEAN)
QUANTPULSE_BENCHMARK_SIZES
    ->Complexity(benchmark::oN);

BENCHMARK(BM_Median)
QUANTPULSE_BENCHMARK_SIZES
    ->Complexity(benchmark::oNLogN);

BENCHMARK(BM_Variance)
QUANTPULSE_BENCHMARK_SIZES
    ->Complexity(benchmark::oN);

BENCHMARK(BM_StandardDeviation)
QUANTPULSE_BENCHMARK_SIZES
    ->Complexity(benchmark::oN);

// BENCHMARK_MAIN();

// commented this BENCHMARK_MAIN() as only one main we want to execute for whole quantpulse .. at this point
