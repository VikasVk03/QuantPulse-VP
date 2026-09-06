#include "quantpulse/domain/matching/MatchingEngine.hpp"

#include <benchmark/benchmark.h>

#include <cstddef>

using quantpulse::domain::matching::MatchingEngine;
using quantpulse::domain::matching::MatchRequest;
using quantpulse::domain::matching::OrderSide;
using quantpulse::domain::order_book::OrderBookEngine;

namespace
{
    OrderBookEngine makeBook()
    {
        OrderBookEngine book;

        for (std::size_t i = 0; i < 100; ++i)
        {
            const double offset =
                static_cast<double>(i) * 0.01;

            book.updateBid(
                100.0 - offset,
                100.0);

            book.updateAsk(
                101.0 + offset,
                100.0);
        }

        return book;
    }
    static OrderBookEngine makeMultiLevelBook(
        std::size_t levels)
    {
        OrderBookEngine book;

        for (std::size_t i = 0; i < levels; ++i)
        {
            const double offset =
                static_cast<double>(i) * 0.01;

            book.updateBid(
                100.0 - offset,
                100.0);

            book.updateAsk(
                101.0 + offset,
                100.0);
        }

        return book;
    }
}

static void BM_MATCHING_BUY(
    benchmark::State &state)
{
    MatchingEngine engine;

    const auto book =
        makeBook();

    for (auto _ : state)
    {
        const auto result =
            engine.match(
                book,
                MatchRequest{
                    OrderSide::Buy,
                    10.0});

        benchmark::DoNotOptimize(
            result.filledQuantity);
    }
}

static void BM_MATCHING_SELL(
    benchmark::State &state)
{
    MatchingEngine engine;

    const auto book =
        makeBook();

    for (auto _ : state)
    {
        const auto result =
            engine.match(
                book,
                MatchRequest{
                    OrderSide::Sell,
                    10.0});

        benchmark::DoNotOptimize(
            result.filledQuantity);
    }
}

static void BM_MATCHING_PARTIAL_BUY(
    benchmark::State &state)
{
    MatchingEngine engine;

    const auto book =
        makeBook();

    for (auto _ : state)
    {
        const auto result =
            engine.match(
                book,
                MatchRequest{
                    OrderSide::Buy,
                    150.0});

        benchmark::DoNotOptimize(
            result.remainingQuantity);
    }
}

static void BM_MATCHING_MULTI_LEVEL_BUY(
    benchmark::State &state)
{
    const auto book =
        makeMultiLevelBook(
            static_cast<std::size_t>(
                state.range(0)));

    MatchingEngine engine;

    for (auto _ : state)
    {
        const auto result =
            engine.match(
                book,
                MatchRequest{
                    OrderSide::Buy,
                    500.0});

        benchmark::DoNotOptimize(
            result);
    }
}

static void BM_MATCHING_MULTI_LEVEL_SELL(
    benchmark::State &state)
{
    const auto book =
        makeMultiLevelBook(
            static_cast<std::size_t>(
                state.range(0)));

    MatchingEngine engine;

    for (auto _ : state)
    {
        const auto result =
            engine.match(
                book,
                MatchRequest{
                    OrderSide::Sell,
                    500.0});

        benchmark::DoNotOptimize(
            result);
    }
}

BENCHMARK(BM_MATCHING_BUY);

BENCHMARK(BM_MATCHING_SELL);

BENCHMARK(BM_MATCHING_PARTIAL_BUY);

BENCHMARK(BM_MATCHING_MULTI_LEVEL_BUY)
    ->Arg(5)
    ->Arg(10)
    ->Arg(25)
    ->Arg(50);

BENCHMARK(BM_MATCHING_MULTI_LEVEL_SELL)
    ->Arg(5)
    ->Arg(10)
    ->Arg(25)
    ->Arg(50);