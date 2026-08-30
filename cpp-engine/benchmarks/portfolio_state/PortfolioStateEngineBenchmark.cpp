#include "quantpulse/domain/portfolio_state/PortfolioStateEngine.hpp"

#include <benchmark/benchmark.h>

namespace
{

    using quantpulse::domain::portfolio_state::
        PortfolioStateEngine;

    static void BM_PORTFOLIO_STATE_BUY(
        benchmark::State &state)
    {
        const auto portfolio =
            PortfolioStateEngine::initialize(
                1000000.0);

        for (auto _ : state)
        {
            const auto result =
                PortfolioStateEngine::buy(
                    portfolio,
                    100.0,
                    100.0);

            benchmark::DoNotOptimize(
                result);
        }
    }

    static void BM_PORTFOLIO_STATE_SELL(
        benchmark::State &state)
    {
        auto portfolio =
            PortfolioStateEngine::initialize(
                1000000.0);

        portfolio =
            PortfolioStateEngine::buy(
                portfolio,
                1000.0,
                100.0);

        for (auto _ : state)
        {
            const auto result =
                PortfolioStateEngine::sell(
                    portfolio,
                    100.0,
                    110.0);

            benchmark::DoNotOptimize(
                result);
        }
    }

    static void BM_PORTFOLIO_STATE_SNAPSHOT(
        benchmark::State &state)
    {
        auto portfolio =
            PortfolioStateEngine::initialize(
                1000000.0);

        portfolio =
            PortfolioStateEngine::buy(
                portfolio,
                1000.0,
                100.0);

        for (auto _ : state)
        {
            const auto result =
                PortfolioStateEngine::snapshot(
                    portfolio,
                    105.0);

            benchmark::DoNotOptimize(
                result);
        }
    }

} // namespace

BENCHMARK(BM_PORTFOLIO_STATE_BUY);

BENCHMARK(BM_PORTFOLIO_STATE_SELL);

BENCHMARK(BM_PORTFOLIO_STATE_SNAPSHOT);