#include "quantpulse/domain/latency/LatencyEngine.hpp"

#include <benchmark/benchmark.h>

using quantpulse::domain::latency::LatencyConfig;
using quantpulse::domain::latency::LatencyEngine;

static void BM_LATENCY_TOTAL(
    benchmark::State &state)
{
    const LatencyEngine engine(
        LatencyConfig{
            100,
            200,
            300,
            400});

    for (auto _ : state)
    {
        const auto total =
            engine.totalLatencyNs();

        benchmark::DoNotOptimize(total);
    }
}

static void BM_LATENCY_BREAKDOWN(
    benchmark::State &state)
{
    const LatencyEngine engine(
        LatencyConfig{
            100,
            200,
            300,
            400});

    for (auto _ : state)
    {
        const auto result =
            engine.calculate();

        benchmark::DoNotOptimize(
            result.totalLatencyNs);
    }
}

static void BM_LATENCY_CONFIGURE(
    benchmark::State &state)
{
    LatencyEngine engine;

    const LatencyConfig config{
        100,
        200,
        300,
        400};

    for (auto _ : state)
    {
        engine.configure(config);

        benchmark::DoNotOptimize(
            engine.totalLatencyNs());
    }
}

BENCHMARK(BM_LATENCY_TOTAL);

BENCHMARK(BM_LATENCY_BREAKDOWN);

BENCHMARK(BM_LATENCY_CONFIGURE);