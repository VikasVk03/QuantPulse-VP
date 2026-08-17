#include "quantpulse/domain/risk/RiskEngine.hpp"

#include <benchmark/benchmark.h>

#include <cmath>
#include <vector>

namespace
{

    std::vector<double> generateReturns(std::size_t size)
    {
        std::vector<double> returns;
        returns.reserve(size);

        for (std::size_t i = 0; i < size; ++i)
        {
            // Deterministic synthetic return series.
            returns.push_back(
                0.001 * std::sin(static_cast<double>(i)) -
                0.0002);
        }

        return returns;
    }

    static void BM_SHARPE_RATIO(benchmark::State &state)
    {
        const auto returns =
            generateReturns(static_cast<std::size_t>(state.range(0)));

        for (auto _ : state)
        {
            const double result =
                quantpulse::domain::risk::RiskEngine::sharpeRatio(
                    returns,
                    0.0001);

            benchmark::DoNotOptimize(result);
        }

        state.SetItemsProcessed(
            state.iterations() * state.range(0));
    }

    static void BM_MAXIMUM_DRAWDOWN(benchmark::State &state)
    {
        const auto returns =
            generateReturns(static_cast<std::size_t>(state.range(0)));

        for (auto _ : state)
        {
            const double result =
                quantpulse::domain::risk::RiskEngine::maximumDrawdown(
                    returns);

            benchmark::DoNotOptimize(result);
        }

        state.SetItemsProcessed(
            state.iterations() * state.range(0));
    }

    static void BM_DOWNSIDE_DEVIATION(benchmark::State &state)
    {
        const auto returns =
            generateReturns(static_cast<std::size_t>(state.range(0)));

        for (auto _ : state)
        {
            const double result =
                quantpulse::domain::risk::RiskEngine::downsideDeviation(
                    returns,
                    0.0);

            benchmark::DoNotOptimize(result);
        }

        state.SetItemsProcessed(
            state.iterations() * state.range(0));
    }

} // namespace

BENCHMARK(BM_SHARPE_RATIO)
    ->Arg(1000)
    ->Arg(10000)
    ->Arg(100000)
    ->Arg(1000000);

BENCHMARK(BM_MAXIMUM_DRAWDOWN)
    ->Arg(1000)
    ->Arg(10000)
    ->Arg(100000)
    ->Arg(1000000);

BENCHMARK(BM_DOWNSIDE_DEVIATION)
    ->Arg(1000)
    ->Arg(10000)
    ->Arg(100000)
    ->Arg(1000000);