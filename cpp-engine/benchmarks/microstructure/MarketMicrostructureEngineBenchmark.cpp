#include "quantpulse/domain/microstructure/MarketMicrostructureEngine.hpp"

#include <benchmark/benchmark.h>

#include <vector>

using quantpulse::domain::microstructure::MarketMicrostructureEngine;

namespace
{

    std::vector<double> generatePrices(
        std::size_t size)
    {
        std::vector<double> prices(size);

        for (std::size_t i = 0;
             i < size;
             ++i)
        {
            prices[i] =
                100.0 +
                static_cast<double>(i % 100);
        }

        return prices;
    }

    std::vector<double> generateVolumes(
        std::size_t size)
    {
        std::vector<double> volumes(size);

        for (std::size_t i = 0;
             i < size;
             ++i)
        {
            volumes[i] =
                100.0 +
                static_cast<double>(i % 1000);
        }

        return volumes;
    }

    static void BM_VWAP(
        benchmark::State &state)
    {
        const auto prices =
            generatePrices(
                static_cast<std::size_t>(state.range(0)));

        const auto volumes =
            generateVolumes(
                static_cast<std::size_t>(state.range(0)));

        for (auto _ : state)
        {
            const double result =
                MarketMicrostructureEngine::vwap(
                    prices,
                    volumes);

            benchmark::DoNotOptimize(result);
        }

        state.SetItemsProcessed(
            state.iterations() *
            state.range(0));
    }

    static void BM_TWAP(
        benchmark::State &state)
    {
        const auto prices =
            generatePrices(
                static_cast<std::size_t>(state.range(0)));

        for (auto _ : state)
        {
            const double result =
                MarketMicrostructureEngine::twap(
                    prices);

            benchmark::DoNotOptimize(result);
        }

        state.SetItemsProcessed(
            state.iterations() *
            state.range(0));
    }

    static void BM_MID_PRICE(
        benchmark::State &state)
    {
        const double bid = 100.0;
        const double ask = 100.10;

        for (auto _ : state)
        {
            const double result =
                MarketMicrostructureEngine::midPrice(
                    bid,
                    ask);

            benchmark::DoNotOptimize(result);
        }
    }

    static void BM_BID_ASK_SPREAD(
        benchmark::State &state)
    {
        const double bid = 100.0;
        const double ask = 100.10;

        for (auto _ : state)
        {
            const double result =
                MarketMicrostructureEngine::bidAskSpread(
                    bid,
                    ask);

            benchmark::DoNotOptimize(result);
        }
    }

    static void BM_RELATIVE_SPREAD(
        benchmark::State &state)
    {
        const double bid = 100.0;
        const double ask = 100.10;

        for (auto _ : state)
        {
            const double result =
                MarketMicrostructureEngine::relativeSpread(
                    bid,
                    ask);

            benchmark::DoNotOptimize(result);
        }
    }

    static void BM_ORDER_IMBALANCE(
        benchmark::State &state)
    {
        for (auto _ : state)
        {
            const double result =
                MarketMicrostructureEngine::orderImbalance(
                    700.0,
                    300.0);

            benchmark::DoNotOptimize(result);
        }
    }

    static void BM_TRADE_IMBALANCE(
        benchmark::State &state)
    {
        for (auto _ : state)
        {
            const double result =
                MarketMicrostructureEngine::tradeImbalance(
                    800.0,
                    200.0);

            benchmark::DoNotOptimize(result);
        }
    }

    static void BM_PRICE_IMPACT(
        benchmark::State &state)
    {
        for (auto _ : state)
        {
            const double result =
                MarketMicrostructureEngine::priceImpact(
                    100.0,
                    101.0);

            benchmark::DoNotOptimize(result);
        }
    }

} // namespace

BENCHMARK(BM_VWAP)
    ->Arg(1000)
    ->Arg(10000)
    ->Arg(100000)
    ->Arg(1000000);

BENCHMARK(BM_TWAP)
    ->Arg(1000)
    ->Arg(10000)
    ->Arg(100000)
    ->Arg(1000000);

BENCHMARK(BM_MID_PRICE);

BENCHMARK(BM_BID_ASK_SPREAD);

BENCHMARK(BM_RELATIVE_SPREAD);

BENCHMARK(BM_ORDER_IMBALANCE);

BENCHMARK(BM_TRADE_IMBALANCE);

BENCHMARK(BM_PRICE_IMPACT);