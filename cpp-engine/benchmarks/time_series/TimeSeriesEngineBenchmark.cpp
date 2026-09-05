#include "quantpulse/domain/time_series/TimeSeriesEngine.hpp"

#include <benchmark/benchmark.h>

#include <cstddef>

using quantpulse::domain::time_series::TimeSeriesEngine;

namespace
{
    TimeSeriesEngine makeSeries(
        std::size_t size)
    {
        TimeSeriesEngine series;

        for (std::size_t i = 0; i < size; ++i)
        {
            series.append(
                static_cast<std::int64_t>(i),
                100.0 +
                    static_cast<double>(i) * 0.01);
        }

        return series;
    }
}

static void BM_TIME_SERIES_APPEND(
    benchmark::State &state)
{
    for (auto _ : state)
    {
        TimeSeriesEngine series;

        for (std::size_t i = 0;
             i < static_cast<std::size_t>(state.range(0));
             ++i)
        {
            series.append(
                static_cast<std::int64_t>(i),
                100.0 +
                    static_cast<double>(i) * 0.01);
        }

        benchmark::DoNotOptimize(series.size());
    }
}

static void BM_TIME_SERIES_LATEST(
    benchmark::State &state)
{
    const auto series =
        makeSeries(
            static_cast<std::size_t>(state.range(0)));

    for (auto _ : state)
    {
        const auto &point =
            series.latest();

        benchmark::DoNotOptimize(
            point.value);
    }
}

static void BM_TIME_SERIES_AT(
    benchmark::State &state)
{
    const auto series =
        makeSeries(
            static_cast<std::size_t>(state.range(0)));

    const std::size_t index =
        static_cast<std::size_t>(state.range(0) / 2);

    for (auto _ : state)
    {
        const auto &point =
            series.at(index);

        benchmark::DoNotOptimize(
            point.value);
    }
}

static void BM_TIME_SERIES_SIZE(
    benchmark::State &state)
{
    const auto series =
        makeSeries(
            static_cast<std::size_t>(state.range(0)));

    for (auto _ : state)
    {
        const auto size =
            series.size();

        benchmark::DoNotOptimize(size);
    }
}

BENCHMARK(BM_TIME_SERIES_APPEND)
    ->Arg(1000)
    ->Arg(10000)
    ->Arg(100000);

BENCHMARK(BM_TIME_SERIES_LATEST)
    ->Arg(1000)
    ->Arg(10000)
    ->Arg(100000);

BENCHMARK(BM_TIME_SERIES_AT)
    ->Arg(1000)
    ->Arg(10000)
    ->Arg(100000);

BENCHMARK(BM_TIME_SERIES_SIZE)
    ->Arg(1000)
    ->Arg(10000)
    ->Arg(100000);