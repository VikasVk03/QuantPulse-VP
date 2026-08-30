#include "quantpulse/domain/performance/PerformanceEngine.hpp"

#include <benchmark/benchmark.h>

#include <cmath>
#include <cstddef>
#include <vector>

namespace
{

    std::vector<double> createEquityCurve(
        std::size_t size)
    {
        std::vector<double> equityCurve;
        equityCurve.reserve(size);

        double equity = 100000.0;

        for (std::size_t i = 0;
             i < size;
             ++i)
        {
            /*
             * Generate deterministic periodic movement.
             *
             * The alternating components create both
             * positive and negative returns so that the
             * performance calculations are realistic.
             */
            const double periodicReturn =
                0.0002 +
                0.0015 *
                    std::sin(
                        static_cast<double>(i) *
                        0.01);

            equity *=
                1.0 + periodicReturn;

            equityCurve.push_back(equity);
        }

        return equityCurve;
    }

    std::vector<double> createTradeReturns(
        std::size_t size)
    {
        std::vector<double> tradeReturns;
        tradeReturns.reserve(size);

        /*
         * We do not necessarily have one trade per
         * market observation.
         *
         * Generate approximately one trade for every
         * 10 observations.
         */
        const std::size_t numberOfTrades =
            size / 10;

        for (std::size_t i = 0;
             i < numberOfTrades;
             ++i)
        {
            const double tradeReturn =
                0.003 *
                std::sin(
                    static_cast<double>(i) *
                    0.1);

            tradeReturns.push_back(
                tradeReturn);
        }

        return tradeReturns;
    }

} // namespace

static void BM_PERFORMANCE_ENGINE(
    benchmark::State &state)
{
    using quantpulse::domain::performance::
        PerformanceEngine;

    const std::size_t size =
        static_cast<std::size_t>(
            state.range(0));

    const auto equityCurve =
        createEquityCurve(size);

    const auto tradeReturns =
        createTradeReturns(size);

    constexpr double periodsPerYear = 252.0;
    constexpr double riskFreeRate = 0.0001;

    for (auto _ : state)
    {
        const auto result =
            PerformanceEngine::evaluate(
                equityCurve,
                periodsPerYear,
                riskFreeRate,
                tradeReturns);

        benchmark::DoNotOptimize(
            result.totalReturn);
    }

    state.SetItemsProcessed(
        state.iterations() *
        static_cast<std::int64_t>(size));
}

BENCHMARK(BM_PERFORMANCE_ENGINE)
    ->Arg(1000)
    ->Arg(10000)
    ->Arg(100000)
    ->Arg(1000000);