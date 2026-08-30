#include "quantpulse/domain/sizing/PositionSizingEngine.hpp"

#include <benchmark/benchmark.h>

namespace
{

    using quantpulse::domain::sizing::
        PositionSizingConfig;

    using quantpulse::domain::sizing::
        PositionSizingEngine;

    using quantpulse::domain::sizing::
        PositionSizingMethod;

    static void BM_POSITION_SIZING_FIXED_FRACTION(
        benchmark::State &state)
    {
        PositionSizingConfig config;

        config.method =
            PositionSizingMethod::FixedFraction;

        config.allocationFraction =
            0.10;

        config.maximumAllocationFraction =
            0.25;

        for (auto _ : state)
        {
            const auto result =
                PositionSizingEngine::calculate(
                    100000.0,
                    100.0,
                    90.0,
                    config);

            benchmark::DoNotOptimize(
                result.quantity);
        }

        state.SetItemsProcessed(
            state.iterations());
    }

    static void BM_POSITION_SIZING_RISK_BASED(
        benchmark::State &state)
    {
        PositionSizingConfig config;

        config.method =
            PositionSizingMethod::RiskBased;

        config.riskFraction =
            0.01;

        config.maximumAllocationFraction =
            0.25;

        for (auto _ : state)
        {
            const auto result =
                PositionSizingEngine::calculate(
                    100000.0,
                    100.0,
                    90.0,
                    config);

            benchmark::DoNotOptimize(
                result.quantity);
        }

        state.SetItemsProcessed(
            state.iterations());
    }

} // namespace

BENCHMARK(
    BM_POSITION_SIZING_FIXED_FRACTION);

BENCHMARK(
    BM_POSITION_SIZING_RISK_BASED);