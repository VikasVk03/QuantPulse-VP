#include "quantpulse/application/analytics/MarketDataAnalytics.hpp"

#include <benchmark/benchmark.h>

#include <string>
#include <vector>

namespace
{

    std::vector<
        quantpulse::domain::market_data::MarketBar>
    createBars(std::size_t count)
    {
        std::vector<
            quantpulse::domain::market_data::MarketBar>
            bars;

        bars.reserve(count);

        for (std::size_t i = 0; i < count; ++i)
        {
            const double price =
                100.0 + static_cast<double>(i % 100);

            bars.push_back(
                {.timestamp =
                     static_cast<std::int64_t>(i + 1),
                 .symbol = "TEST",
                 .open = price,
                 .high = price + 2.0,
                 .low = price - 2.0,
                 .close = price + 1.0,
                 .volume = 1000.0});
        }

        return bars;
    }

    static void BM_MarketDataAnalyticsAnalyze(
        benchmark::State &state)
    {
        const auto bars =
            createBars(
                static_cast<std::size_t>(state.range(0)));

        for (auto _ : state)
        {
            const auto report =
                quantpulse::application::analytics::
                    MarketDataAnalytics::analyze(
                        "TEST",
                        bars);

            benchmark::DoNotOptimize(report);
        }
    }

} // namespace

BENCHMARK(BM_MarketDataAnalyticsAnalyze)
    ->Arg(100)
    ->Arg(1000)
    ->Arg(10000);


