#include "quantpulse/domain/market_data_buffer/MarketDataBufferEngine.hpp"

#include <benchmark/benchmark.h>

#include <cstdint>

namespace
{

    using quantpulse::domain::market_data::
        MarketObservation;

    using quantpulse::domain::market_data_buffer::
        MarketDataBufferEngine;

    MarketObservation createMarketObservation(
        std::int64_t timestamp,
        double price = 100.0)
    {
        return MarketObservation{
            timestamp,
            price,
            price - 0.5,
            price + 0.5,
            1000.0};
    }

    static void
    BM_MARKET_DATA_BUFFER_PUSH(
        benchmark::State &state)
    {
        MarketDataBufferEngine buffer(
            1024);

        std::int64_t timestamp =
            0;

        for (auto _ : state)
        {
            const auto observation =
                createMarketObservation(
                    timestamp++,
                    100.0);

            buffer.push(
                observation);

            benchmark::DoNotOptimize(
                buffer.size());
        }
    }

    static void
    BM_MARKET_DATA_BUFFER_LATEST(
        benchmark::State &state)
    {
        MarketDataBufferEngine buffer(
            1024);

        buffer.push(
            createMarketObservation(
                1,
                100.0));

        for (auto _ : state)
        {
            const auto &latest =
                buffer.latest();

            benchmark::DoNotOptimize(
                latest.price);
        }
    }

    static void
    BM_MARKET_DATA_BUFFER_AT(
        benchmark::State &state)
    {
        MarketDataBufferEngine buffer(
            1024);

        for (std::int64_t i = 0;
             i < 1024;
             ++i)
        {
            buffer.push(
                createMarketObservation(
                    i,
                    100.0 +
                        static_cast<double>(i)));
        }

        for (auto _ : state)
        {
            const auto &marketData =
                buffer.at(
                    512);

            benchmark::DoNotOptimize(
                marketData.price);
        }
    }

} // namespace
BENCHMARK(
    BM_MARKET_DATA_BUFFER_PUSH);

BENCHMARK(
    BM_MARKET_DATA_BUFFER_LATEST);

BENCHMARK(
    BM_MARKET_DATA_BUFFER_AT);