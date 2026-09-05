#include "quantpulse/domain/indicators/IndicatorEngine.hpp"

#include <benchmark/benchmark.h>

#include <vector>

using quantpulse::domain::indicators::IndicatorEngine;

namespace
{
    std::vector<double> makePrices(std::size_t size)
    {
        std::vector<double> prices;
        prices.reserve(size);

        double price = 100.0;

        for (std::size_t i = 0; i < size; ++i)
        {
            price += 0.01;

            if (i % 17 == 0)
            {
                price -= 0.03;
            }

            prices.push_back(price);
        }

        return prices;
    }
}

static void BM_INDICATOR_SMA(benchmark::State &state)
{
    const auto prices =
        makePrices(static_cast<std::size_t>(state.range(0)));

    for (auto _ : state)
    {
        const double result =
            IndicatorEngine::simpleMovingAverage(prices, 20);

        benchmark::DoNotOptimize(result);
    }
}

static void BM_INDICATOR_EMA(benchmark::State &state)
{
    const auto prices =
        makePrices(static_cast<std::size_t>(state.range(0)));

    for (auto _ : state)
    {
        const double result =
            IndicatorEngine::exponentialMovingAverage(prices, 20);

        benchmark::DoNotOptimize(result);
    }
}

static void BM_INDICATOR_RSI(benchmark::State &state)
{
    const auto prices =
        makePrices(static_cast<std::size_t>(state.range(0)));

    for (auto _ : state)
    {
        const double result =
            IndicatorEngine::relativeStrengthIndex(prices, 14);

        benchmark::DoNotOptimize(result);
    }
}

static void BM_INDICATOR_MOMENTUM(benchmark::State &state)
{
    const auto prices =
        makePrices(static_cast<std::size_t>(state.range(0)));

    for (auto _ : state)
    {
        const double result =
            IndicatorEngine::momentum(prices, 14);

        benchmark::DoNotOptimize(result);
    }
}

BENCHMARK(BM_INDICATOR_SMA)
    ->Arg(1000)
    ->Arg(10000)
    ->Arg(100000);

BENCHMARK(BM_INDICATOR_EMA)
    ->Arg(1000)
    ->Arg(10000)
    ->Arg(100000);

BENCHMARK(BM_INDICATOR_RSI)
    ->Arg(1000)
    ->Arg(10000)
    ->Arg(100000);

BENCHMARK(BM_INDICATOR_MOMENTUM)
    ->Arg(1000)
    ->Arg(10000)
    ->Arg(100000);