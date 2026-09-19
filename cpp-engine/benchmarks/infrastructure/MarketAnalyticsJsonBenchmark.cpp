#include "quantpulse/infrastructure/serialization/MarketAnalyticsJson.hpp"

#include <benchmark/benchmark.h>

#include <string>
#include <vector>

namespace quantpulse::infrastructure::serialization
{

    namespace
    {

        quantpulse::application::analytics::MarketAnalyticsReport
        createReport()
        {
            using quantpulse::application::analytics::MarketAnalyticsReport;

            MarketAnalyticsReport report;

            report.symbol = "NIFTY";
            report.observationCount = 1000;
            report.firstPrice = 22000.0;
            report.lastPrice = 22100.0;
            report.totalVolume = 1000000.0;
            report.averageVolume = 1000.0;
            report.returnPercentage = 0.45;
            report.volatility = 0.18;

            report.series.reserve(1000);

            for (std::int64_t i = 0; i < 1000; ++i)
            {
                report.series.push_back(
                    {.timestamp = i,
                     .open = 22000.0 + i * 0.1,
                     .high = 22005.0 + i * 0.1,
                     .low = 21995.0 + i * 0.1,
                     .close = 22002.0 + i * 0.1,
                     .volume = 1000.0 + i});
            }

            return report;
        }

    } // namespace

    static void BM_MarketAnalyticsJsonSerialize(
        benchmark::State &state)
    {
        const auto report = createReport();

        for (auto _ : state)
        {
            const auto json =
                MarketAnalyticsJson::serialize(report);

            benchmark::DoNotOptimize(json);
        }
    }

    BENCHMARK(BM_MarketAnalyticsJsonSerialize);

} // namespace quantpulse::infrastructure::serialization
