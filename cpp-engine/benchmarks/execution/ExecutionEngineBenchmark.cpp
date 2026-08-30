#include "quantpulse/domain/execution/ExecutionEngine.hpp"

#include <benchmark/benchmark.h>

namespace
{

    using quantpulse::domain::execution::
        ExecutionEngine;

    using quantpulse::domain::strategy::
        StrategyAction;

    static void BM_EXECUTION_ENGINE(
        benchmark::State &state)
    {
        for (auto _ : state)
        {
            const auto holdResult =
                ExecutionEngine::evaluate(
                    StrategyAction::Hold);

            benchmark::DoNotOptimize(
                holdResult);

            const auto enterResult =
                ExecutionEngine::evaluate(
                    StrategyAction::EnterLong);

            benchmark::DoNotOptimize(
                enterResult);

            const auto exitResult =
                ExecutionEngine::evaluate(
                    StrategyAction::ExitLong);

            benchmark::DoNotOptimize(
                exitResult);
        }

        state.SetItemsProcessed(
            state.iterations() * 3);
    }

} // namespace

BENCHMARK(BM_EXECUTION_ENGINE);