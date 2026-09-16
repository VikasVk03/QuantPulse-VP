#include "quantpulse/infrastructure/market_data/CsvMarketDataReader.hpp"

#include <benchmark/benchmark.h>

#include <chrono>
#include <filesystem>
#include <fstream>
#include <string>

namespace
{

    std::filesystem::path createBenchmarkCsv(
        std::size_t rowCount)
    {
        const auto path =
            std::filesystem::temp_directory_path() /
            "quantpulse_csv_market_data_benchmark.csv";

        std::ofstream file(path, std::ios::binary);

        file
            << "timestamp,symbol,open,high,low,close,volume\n";

        for (std::size_t i = 0; i < rowCount; ++i)
        {
            const auto timestamp =
                static_cast<std::int64_t>(i + 1);

            const double price =
                100.0 + static_cast<double>(i) * 0.01;

            file
                << timestamp
                << ",RELIANCE,"
                << price
                << ","
                << price + 1.0
                << ","
                << price - 1.0
                << ","
                << price + 0.5
                << ",1000\n";
        }

        file.close();

        return path;
    }

    static void BM_CsvMarketDataReaderRead(
        benchmark::State &state)
    {
        const auto rowCount =
            static_cast<std::size_t>(state.range(0));

        const auto path =
            createBenchmarkCsv(rowCount);

        for (auto _ : state)
        {
            const auto dataset =
                quantpulse::infrastructure::market_data::
                    CsvMarketDataReader::read(
                        path.string());

            benchmark::DoNotOptimize(dataset);
        }

        std::filesystem::remove(path);
    }

} // namespace

BENCHMARK(BM_CsvMarketDataReaderRead)
    ->Arg(100)
    ->Arg(1000)
    ->Arg(10000);
