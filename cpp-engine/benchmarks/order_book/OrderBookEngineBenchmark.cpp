#include "quantpulse/domain/order_book/OrderBookEngine.hpp"

#include <benchmark/benchmark.h>

#include <cstddef>

using quantpulse::domain::order_book::OrderBookEngine;

namespace
{
    OrderBookEngine makeBook(
        std::size_t levels)
    {
        OrderBookEngine book;

        for (std::size_t i = 0; i < levels; ++i)
        {
            const double offset =
                static_cast<double>(i) * 0.01;

            book.updateBid(
                100.0 - offset,
                10.0 + static_cast<double>(i));

            book.updateAsk(
                101.0 + offset,
                10.0 + static_cast<double>(i));
        }

        return book;
    }
}

static void BM_ORDER_BOOK_UPDATE_BID(
    benchmark::State &state)
{
    OrderBookEngine book;

    for (std::size_t i = 0; i < 100; ++i)
    {
        book.updateBid(
            100.0 - static_cast<double>(i) * 0.01,
            10.0);
    }

    for (auto _ : state)
    {
        book.updateBid(
            99.50,
            25.0);

        benchmark::DoNotOptimize(
            book.bidLevelCount());
    }
}

static void BM_ORDER_BOOK_UPDATE_ASK(
    benchmark::State &state)
{
    OrderBookEngine book;

    for (std::size_t i = 0; i < 100; ++i)
    {
        book.updateAsk(
            101.0 + static_cast<double>(i) * 0.01,
            10.0);
    }

    for (auto _ : state)
    {
        book.updateAsk(
            101.50,
            25.0);

        benchmark::DoNotOptimize(
            book.askLevelCount());
    }
}

static void BM_ORDER_BOOK_BEST_BID(
    benchmark::State &state)
{
    const auto book =
        makeBook(
            static_cast<std::size_t>(state.range(0)));

    for (auto _ : state)
    {
        const double value =
            book.bestBid();

        benchmark::DoNotOptimize(value);
    }
}

static void BM_ORDER_BOOK_BEST_ASK(
    benchmark::State &state)
{
    const auto book =
        makeBook(
            static_cast<std::size_t>(state.range(0)));

    for (auto _ : state)
    {
        const double value =
            book.bestAsk();

        benchmark::DoNotOptimize(value);
    }
}

static void BM_ORDER_BOOK_SPREAD(
    benchmark::State &state)
{
    const auto book =
        makeBook(
            static_cast<std::size_t>(state.range(0)));

    for (auto _ : state)
    {
        const double value =
            book.spread();

        benchmark::DoNotOptimize(value);
    }
}

static void BM_ORDER_BOOK_DEPTH(
    benchmark::State &state)
{
    const auto book =
        makeBook(
            static_cast<std::size_t>(state.range(0)));

    for (auto _ : state)
    {
        const double bidDepth =
            book.bidDepth(10);

        const double askDepth =
            book.askDepth(10);

        benchmark::DoNotOptimize(bidDepth);
        benchmark::DoNotOptimize(askDepth);
    }
}

BENCHMARK(BM_ORDER_BOOK_UPDATE_BID);

BENCHMARK(BM_ORDER_BOOK_UPDATE_ASK);

BENCHMARK(BM_ORDER_BOOK_BEST_BID)
    ->Arg(16)
    ->Arg(64)
    ->Arg(256);

BENCHMARK(BM_ORDER_BOOK_BEST_ASK)
    ->Arg(16)
    ->Arg(64)
    ->Arg(256);

BENCHMARK(BM_ORDER_BOOK_SPREAD)
    ->Arg(16)
    ->Arg(64)
    ->Arg(256);

BENCHMARK(BM_ORDER_BOOK_DEPTH)
    ->Arg(16)
    ->Arg(64)
    ->Arg(256);