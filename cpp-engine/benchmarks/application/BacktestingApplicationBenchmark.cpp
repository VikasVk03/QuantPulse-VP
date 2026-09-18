#include "quantpulse/application/backtesting/BacktestingApplication.hpp"

#include <benchmark/benchmark.h>

#include <vector>

namespace
{

    std::vector<
        quantpulse::domain::backtest::MarketObservation>
    createObservations(std::size_t count)
    {
        std::vector<
            quantpulse::domain::backtest::MarketObservation>
            observations;

        observations.reserve(count);

        for (std::size_t i = 0; i < count; ++i)
        {
            const double price =
                100.0 +
                static_cast<double>(i) * 0.01;

            const double signal =
                (i % 2 == 0) ? 1.0 : 0.0;

            observations.push_back(
                {.price = price,
                 .signal = signal});
        }

        return observations;
    }

    static void BM_BacktestingApplicationRun(
        benchmark::State &state)
    {
        const auto observations =
            createObservations(
                static_cast<std::size_t>(state.range(0)));

        const quantpulse::application::backtesting::
            BacktestingRequest request{
                .observations = observations,
                .initialCapital = 100000.0,
                .signalThreshold = 0.5,
                .transactionCostRate = 0.001,
        };

        for (auto _ : state)
        {
            const auto report =
                quantpulse::application::backtesting::
                    BacktestingApplication::run(request);

            benchmark::DoNotOptimize(report);
        }
    }

} // namespace

BENCHMARK(BM_BacktestingApplicationRun)
    ->Arg(100)
    ->Arg(1000)
    ->Arg(10000);
