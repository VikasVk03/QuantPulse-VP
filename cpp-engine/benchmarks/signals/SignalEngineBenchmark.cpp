#include "quantpulse/domain/signals/SignalEngine.hpp"

#include <benchmark/benchmark.h>

#include <vector>

namespace
{

    quantpulse::domain::features::FeatureVector makeFeatures()
    {
        return quantpulse::domain::features::FeatureVector{
            0.12,  // cumulativeReturn
            0.18,  // volatility
            0.85,  // sharpeRatio
            1.10,  // sortinoRatio
            -0.08, // maximumDrawdown
            0.025, // vwapDeviation
            0.012, // relativeSpread
            0.35,  // orderImbalance
            0.28,  // tradeImbalance
            0.015  // priceImpact
        };
    }

}

static void BM_SIGNAL_ENGINE(
    benchmark::State &state)
{
    const auto features =
        makeFeatures();

    const quantpulse::domain::signals::SignalWeights weights{
        0.30,
        0.30,
        0.40};

    for (auto _ : state)
    {
        const auto signal =
            quantpulse::domain::signals::SignalEngine::generate(
                features,
                weights);

        benchmark::DoNotOptimize(signal);
    }

    state.SetItemsProcessed(
        state.iterations());
}

BENCHMARK(BM_SIGNAL_ENGINE);
