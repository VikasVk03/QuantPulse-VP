#include "quantpulse/domain/strategy/StrategyEngine.hpp"

#include <benchmark/benchmark.h>

#include <array>
#include <cstddef>

namespace
{

    void BM_STRATEGY_ENGINE(
        benchmark::State &state)
    {
        using quantpulse::domain::strategy::Position;
        using quantpulse::domain::strategy::StrategyEngine;

        constexpr std::array<double, 4> signals{
            0.8,
            0.5,
            0.2,
            0.6};

        constexpr double entryThreshold = 0.7;
        constexpr double exitThreshold = 0.3;

        Position position =
            Position::Flat;

        std::size_t index = 0;

        for (auto _ : state)
        {
            const double signal =
                signals[index % signals.size()];

            const auto decision =
                StrategyEngine::evaluate(
                    signal,
                    position,
                    entryThreshold,
                    exitThreshold);

            position =
                decision.nextPosition;

            benchmark::DoNotOptimize(
                decision.action);

            benchmark::DoNotOptimize(
                decision.nextPosition);

            ++index;
        }

        state.SetItemsProcessed(
            static_cast<int64_t>(
                state.iterations()));
    }

} // namespace

BENCHMARK(
    BM_STRATEGY_ENGINE);