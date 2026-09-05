#include "quantpulse/domain/rolling_window/RollingWindowEngine.hpp"

#include <benchmark/benchmark.h>

#include <cstddef>

using quantpulse::domain::rolling_window::RollingWindowEngine;

static void BM_ROLLING_WINDOW_PUSH_NOT_FULL(
    benchmark::State &state)
{
    RollingWindowEngine window(
        static_cast<std::size_t>(state.range(0)));

    for (auto _ : state)
    {
        window.push(100.0);

        benchmark::DoNotOptimize(
            window.latest());

        if (window.full())
        {
            window.clear();
        }
    }
}

static void BM_ROLLING_WINDOW_PUSH_FULL(
    benchmark::State &state)
{
    const auto capacity =
        static_cast<std::size_t>(state.range(0));

    RollingWindowEngine window(capacity);

    for (std::size_t i = 0; i < capacity; ++i)
    {
        window.push(
            100.0 +
            static_cast<double>(i));
    }

    for (auto _ : state)
    {
        window.push(200.0);

        benchmark::DoNotOptimize(
            window.latest());
    }
}

static void BM_ROLLING_WINDOW_LATEST(
    benchmark::State &state)
{
    RollingWindowEngine window(
        static_cast<std::size_t>(state.range(0)));

    for (std::size_t i = 0;
         i < static_cast<std::size_t>(state.range(0));
         ++i)
    {
        window.push(
            100.0 +
            static_cast<double>(i));
    }

    for (auto _ : state)
    {
        const double value =
            window.latest();

        benchmark::DoNotOptimize(value);
    }
}

static void BM_ROLLING_WINDOW_AT(
    benchmark::State &state)
{
    const auto capacity =
        static_cast<std::size_t>(state.range(0));

    RollingWindowEngine window(capacity);

    for (std::size_t i = 0; i < capacity; ++i)
    {
        window.push(
            100.0 +
            static_cast<double>(i));
    }

    const std::size_t index =
        capacity / 2;

    for (auto _ : state)
    {
        const double value =
            window.at(index);

        benchmark::DoNotOptimize(value);
    }
}

BENCHMARK(BM_ROLLING_WINDOW_PUSH_NOT_FULL)
    ->Arg(16)
    ->Arg(64)
    ->Arg(256);

BENCHMARK(BM_ROLLING_WINDOW_PUSH_FULL)
    ->Arg(16)
    ->Arg(64)
    ->Arg(256)
    ->Arg(1024);

BENCHMARK(BM_ROLLING_WINDOW_LATEST)
    ->Arg(16)
    ->Arg(64)
    ->Arg(256)
    ->Arg(1024);

BENCHMARK(BM_ROLLING_WINDOW_AT)
    ->Arg(16)
    ->Arg(64)
    ->Arg(256)
    ->Arg(1024);