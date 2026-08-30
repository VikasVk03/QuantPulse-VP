#include "quantpulse/domain/market_data/MarketDataEngine.hpp"

#include <benchmark/benchmark.h>

#include <cstdint>

namespace
{

    using quantpulse::domain::market_data::
        MarketDataEngine;

    using quantpulse::domain::market_data::
        MarketObservation;

    static void
    BM_MARKET_DATA_UPDATE(
        benchmark::State &state)
    {
        MarketDataEngine engine;

        std::int64_t timestamp =
            0;

        for (auto _ : state)
        {
            ++timestamp;

            engine.update(
                MarketObservation{
                    timestamp,
                    100.0,
                    99.5,
                    100.5,
                    1000.0});

            benchmark::DoNotOptimize(
                engine.hasData());
        }
    }

    BENCHMARK(
        BM_MARKET_DATA_UPDATE);

    static void
    BM_MARKET_DATA_LATEST(
        benchmark::State &state)
    {
        MarketDataEngine engine;

        engine.update(
            MarketObservation{
                1000,
                100.0,
                99.5,
                100.5,
                1000.0});

        for (auto _ : state)
        {
            const auto &observation =
                engine.latest();

            benchmark::DoNotOptimize(
                observation.price);
        }
    }

    BENCHMARK(
        BM_MARKET_DATA_LATEST);

    static void
    BM_MARKET_DATA_HAS_DATA(
        benchmark::State &state)
    {
        MarketDataEngine engine;

        engine.update(
            MarketObservation{
                1000,
                100.0,
                99.5,
                100.5,
                1000.0});

        for (auto _ : state)
        {
            const bool hasData =
                engine.hasData();

            benchmark::DoNotOptimize(
                hasData);
        }
    }

    BENCHMARK(
        BM_MARKET_DATA_HAS_DATA);

} // namespace