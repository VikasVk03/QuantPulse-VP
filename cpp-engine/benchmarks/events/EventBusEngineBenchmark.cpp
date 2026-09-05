#include "quantpulse/domain/events/EventBusEngine.hpp"

#include <benchmark/benchmark.h>

#include <string>

using quantpulse::domain::events::EventBusEngine;

static void BM_EVENT_BUS_PUBLISH_ONE_HANDLER(
    benchmark::State &state)
{
    EventBusEngine bus;

    std::size_t received = 0;

    bus.subscribe(
        "MARKET_UPDATE",
        [&received](const std::string &)
        {
            ++received;
        });

    const std::string payload =
        "price=100.25";

    for (auto _ : state)
    {
        bus.publish(
            "MARKET_UPDATE",
            payload);
    }

    benchmark::DoNotOptimize(received);
}

static void BM_EVENT_BUS_PUBLISH_FIVE_HANDLERS(
    benchmark::State &state)
{
    EventBusEngine bus;

    std::size_t received = 0;

    for (int i = 0; i < 5; ++i)
    {
        bus.subscribe(
            "MARKET_UPDATE",
            [&received](const std::string &)
            {
                ++received;
            });
    }

    const std::string payload =
        "price=100.25";

    for (auto _ : state)
    {
        bus.publish(
            "MARKET_UPDATE",
            payload);
    }

    benchmark::DoNotOptimize(received);
}

static void BM_EVENT_BUS_SUBSCRIBE(
    benchmark::State &state)
{
    for (auto _ : state)
    {
        EventBusEngine bus;

        bus.subscribe(
            "MARKET_UPDATE",
            [](const std::string &) {});

        benchmark::DoNotOptimize(
            bus.subscriberCount("MARKET_UPDATE"));
    }
}

static void BM_EVENT_BUS_LOOKUP(
    benchmark::State &state)
{
    EventBusEngine bus;

    bus.subscribe(
        "MARKET_UPDATE",
        [](const std::string &) {});

    for (auto _ : state)
    {
        const auto count =
            bus.subscriberCount("MARKET_UPDATE");

        benchmark::DoNotOptimize(count);
    }
}

BENCHMARK(BM_EVENT_BUS_PUBLISH_ONE_HANDLER);

BENCHMARK(BM_EVENT_BUS_PUBLISH_FIVE_HANDLERS);

BENCHMARK(BM_EVENT_BUS_SUBSCRIBE);

BENCHMARK(BM_EVENT_BUS_LOOKUP);