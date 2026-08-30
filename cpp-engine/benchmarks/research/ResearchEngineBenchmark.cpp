#include "quantpulse/domain/research/ResearchEngine.hpp"

#include <benchmark/benchmark.h>

#include <cmath>
#include <cstddef>
#include <cstdint>
#include <vector>

namespace
{

    std::vector<
        quantpulse::domain::research::
            ResearchObservation>
    createObservations(
        std::size_t size)
    {
        using quantpulse::domain::research::
            ResearchObservation;

        std::vector<ResearchObservation>
            observations;

        observations.reserve(size);

        for (std::size_t i = 0;
             i < size;
             ++i)
        {
            const double index =
                static_cast<double>(i);

            /*
             * Generate deterministic synthetic
             * market behaviour.
             */
            const double price =
                100.0 +
                0.01 * index +
                2.0 *
                    std::sin(
                        index * 0.01);

            const double spread =
                0.02 +
                0.005 *
                    std::abs(
                        std::sin(
                            index * 0.05));

            const double bidPrice =
                price -
                spread * 0.5;

            const double askPrice =
                price +
                spread * 0.5;

            const double volume =
                1000.0 +
                200.0 *
                    std::abs(
                        std::sin(
                            index * 0.03));

            const double bidVolume =
                500.0 +
                100.0 *
                    std::sin(
                        index * 0.02);

            const double askVolume =
                500.0 +
                100.0 *
                    std::cos(
                        index * 0.02);

            const double tradeBuyVolume =
                250.0 +
                50.0 *
                    std::abs(
                        std::sin(
                            index * 0.04));

            const double tradeSellVolume =
                250.0 +
                50.0 *
                    std::abs(
                        std::cos(
                            index * 0.04));

            observations.push_back(
                ResearchObservation{
                    price,
                    volume,
                    bidPrice,
                    askPrice,
                    bidVolume,
                    askVolume,
                    tradeBuyVolume,
                    tradeSellVolume});
        }

        return observations;
    }

} // namespace

static void BM_RESEARCH_ENGINE(
    benchmark::State &state)
{
    using quantpulse::domain::research::
        ResearchConfig;

    using quantpulse::domain::research::
        ResearchEngine;

    const std::size_t size =
        static_cast<std::size_t>(
            state.range(0));

    const auto observations =
        createObservations(size);

    ResearchConfig config;

    config.featureWindow = 20;
    config.entryThreshold = 0.25;
    config.exitThreshold = -0.25;

    config.initialCapital = 100000.0;
    config.transactionCostRate = 0.001;

    config.periodsPerYear = 252.0;
    config.riskFreeRate = 0.0;

    for (auto _ : state)
    {
        const auto result =
            ResearchEngine::run(
                observations,
                config);

        benchmark::DoNotOptimize(
            result.performance.totalReturn);
    }

    state.SetItemsProcessed(
        state.iterations() *
        static_cast<std::int64_t>(size));
}

BENCHMARK(BM_RESEARCH_ENGINE)
    ->Arg(1000)
    ->Arg(10000)
    ->Arg(100000);