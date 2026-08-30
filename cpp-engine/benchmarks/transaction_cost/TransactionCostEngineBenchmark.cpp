#include "quantpulse/domain/transaction_cost/TransactionCostEngine.hpp"

#include <benchmark/benchmark.h>

namespace
{

    using quantpulse::domain::transaction_cost::
        TransactionCostConfig;

    using quantpulse::domain::transaction_cost::
        TransactionCostEngine;

    static void BM_TRANSACTION_COST_ZERO(
        benchmark::State &state)
    {
        TransactionCostConfig config;

        for (auto _ : state)
        {
            const auto result =
                TransactionCostEngine::calculate(
                    100.0,
                    50.0,
                    config);

            benchmark::DoNotOptimize(
                result.totalCost);
        }
    }

    static void BM_TRANSACTION_COST_COMMISSION(
        benchmark::State &state)
    {
        TransactionCostConfig config;

        config.fixedCommission =
            10.0;

        config.commissionRate =
            0.001;

        for (auto _ : state)
        {
            const auto result =
                TransactionCostEngine::calculate(
                    100.0,
                    50.0,
                    config);

            benchmark::DoNotOptimize(
                result.totalCost);
        }
    }

    static void BM_TRANSACTION_COST_SPREAD(
        benchmark::State &state)
    {
        TransactionCostConfig config;

        config.spreadFraction =
            0.002;

        for (auto _ : state)
        {
            const auto result =
                TransactionCostEngine::calculate(
                    100.0,
                    50.0,
                    config);

            benchmark::DoNotOptimize(
                result.totalCost);
        }
    }

    static void BM_TRANSACTION_COST_COMBINED(
        benchmark::State &state)
    {
        TransactionCostConfig config;

        config.fixedCommission =
            10.0;

        config.commissionRate =
            0.001;

        config.spreadFraction =
            0.002;

        config.slippageFraction =
            0.001;

        for (auto _ : state)
        {
            const auto result =
                TransactionCostEngine::calculate(
                    100.0,
                    50.0,
                    config);

            benchmark::DoNotOptimize(
                result.totalCost);
        }
    }

} // namespace

BENCHMARK(
    BM_TRANSACTION_COST_ZERO);

BENCHMARK(
    BM_TRANSACTION_COST_COMMISSION);

BENCHMARK(
    BM_TRANSACTION_COST_SPREAD);

BENCHMARK(
    BM_TRANSACTION_COST_COMBINED);