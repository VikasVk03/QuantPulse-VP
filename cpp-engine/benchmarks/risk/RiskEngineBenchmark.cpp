#include "quantpulse/domain/risk/RiskEngine.hpp"

#include <benchmark/benchmark.h>

#include <cmath>
#include <vector>
#include <cstddef>

using quantpulse::domain::risk::RiskEngine;

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

    std::vector<double> generateDeterministicReturns(
        std::size_t size)
    {
        std::vector<double> returns;
        returns.reserve(size);

        for (std::size_t i = 0; i < size; ++i)
        {
            const double value =
                0.01 * std::sin(static_cast<double>(i));

            returns.push_back(value);
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

    static void BM_SORTINO_RATIO(benchmark::State &state)
    {
        const std::size_t size =
            static_cast<std::size_t>(state.range(0));

        const auto returns =
            generateDeterministicReturns(size);

        for (auto _ : state)
        {
            const double result =
                RiskEngine::sortinoRatio(
                    returns,
                    0.0);

            benchmark::DoNotOptimize(&result);
        }

        state.SetItemsProcessed(
            state.iterations() * static_cast<int64_t>(size));
    }

    static void BM_BETA(benchmark::State &state)
    {
        const std::size_t size =
            static_cast<std::size_t>(state.range(0));

        const auto assetReturns =
            generateDeterministicReturns(size);

        const auto benchmarkReturns =
            generateDeterministicReturns(size);

        for (auto _ : state)
        {
            const double result =
                RiskEngine::beta(
                    assetReturns,
                    benchmarkReturns);

            benchmark::DoNotOptimize(result);
        }

        state.SetItemsProcessed(
            state.iterations() * static_cast<int64_t>(size));
    }

    static void BM_ALPHA(benchmark::State &state)
    {
        const std::size_t size =
            static_cast<std::size_t>(state.range(0));

        const auto benchmarkReturns =
            generateDeterministicReturns(size);

        std::vector<double> assetReturns(size);

        /*
         * Construct a deterministic asset series with
         * approximately 2x benchmark exposure.
         *
         * Data generation happens outside the timed loop.
         */
        for (std::size_t i = 0; i < size; ++i)
        {
            assetReturns[i] =
                2.0 * benchmarkReturns[i];
        }

        constexpr double riskFreeRate = 0.01;

        for (auto _ : state)
        {
            const double result =
                RiskEngine::alpha(
                    assetReturns,
                    benchmarkReturns,
                    riskFreeRate);

            benchmark::DoNotOptimize(result);
        }

        state.SetItemsProcessed(
            state.iterations() *
            static_cast<int64_t>(size));
    }

    static void BM_HISTORICAL_VAR(benchmark::State &state)
    {
        const std::size_t size =
            static_cast<std::size_t>(state.range(0));

        const auto returns =
            generateDeterministicReturns(size);

        constexpr double confidenceLevel = 0.95;

        for (auto _ : state)
        {
            const double result =
                RiskEngine::historicalVaR(
                    returns,
                    confidenceLevel);

            benchmark::DoNotOptimize(result);
        }

        state.SetItemsProcessed(
            state.iterations() *
            static_cast<int64_t>(size));
    }

    static void BM_HISTORICAL_CVAR(benchmark::State &state)
    {
        const std::size_t size =
            static_cast<std::size_t>(state.range(0));

        const auto returns =
            generateDeterministicReturns(size);

        constexpr double confidenceLevel = 0.95;

        for (auto _ : state)
        {
            const double result =
                RiskEngine::historicalCVaR(
                    returns,
                    confidenceLevel);

            benchmark::DoNotOptimize(result);
        }
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

BENCHMARK(BM_SORTINO_RATIO)
    ->Arg(1000)
    ->Arg(10000)
    ->Arg(100000)
    ->Arg(1000000);

BENCHMARK(BM_BETA)
    ->RangeMultiplier(10)
    ->Range(1000, 1000000);

BENCHMARK(BM_ALPHA)
    ->RangeMultiplier(10)
    ->Range(1000, 1000000);

BENCHMARK(BM_HISTORICAL_VAR)
    ->RangeMultiplier(10)
    ->Range(1000, 1000000);

BENCHMARK(BM_HISTORICAL_CVAR)
    ->RangeMultiplier(10)
    ->Range(1000, 1000000);