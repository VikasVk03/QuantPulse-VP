#include "quantpulse/domain/features/FeatureEngine.hpp"

#include <benchmark/benchmark.h>

#include <vector>

namespace
{

    void BM_FEATURE_ENGINE(
        benchmark::State &state)
    {
        const auto n =
            static_cast<std::size_t>(state.range(0));

        std::vector<double> prices(n);
        std::vector<double> volumes(n);

        for (std::size_t i = 0; i < n; ++i)
        {
            prices[i] =
                100.0 +
                static_cast<double>(i % 100) * 0.01;

            volumes[i] =
                1000.0 +
                static_cast<double>(i % 500);
        }

        for (auto _ : state)
        {
            const auto features =
                quantpulse::domain::features::FeatureEngine::generate(
                    prices,
                    volumes,
                    100.50,
                    100.60,
                    5000.0,
                    4500.0,
                    6000.0,
                    4000.0);

            benchmark::DoNotOptimize(features);
        }

        state.SetItemsProcessed(
            state.iterations() *
            static_cast<int64_t>(n));
    }

}

BENCHMARK(BM_FEATURE_ENGINE)
    ->Arg(1000)
    ->Arg(10000)
    ->Arg(100000)
    ->Arg(1000000);