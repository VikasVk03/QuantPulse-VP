#include "quantpulse/domain/liquidity/LiquidityEngine.hpp"

#include <benchmark/benchmark.h>

namespace quantpulse::domain::liquidity
{

    static void BM_LIQUIDITY_EVALUATE(benchmark::State &state)
    {
        const LiquiditySnapshot snapshot{
            .bestBid = 100.0,
            .bestAsk = 101.0,
            .bids = {
                {100.0, 10.0},
                {99.9, 20.0},
                {99.8, 30.0},
                {99.7, 40.0},
                {99.6, 50.0}},
            .asks = {{101.0, 15.0}, {101.1, 25.0}, {101.2, 35.0}, {101.3, 45.0}, {101.4, 55.0}}};

        for (auto _ : state)
        {
            const auto result =
                LiquidityEngine::evaluate(snapshot);

            benchmark::DoNotOptimize(result);
        }
    }

    BENCHMARK(BM_LIQUIDITY_EVALUATE);

} // namespace quantpulse::domain::liquidity
