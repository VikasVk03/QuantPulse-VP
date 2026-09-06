#include "quantpulse/domain/latency/LatencyEngine.hpp"

#include <gtest/gtest.h>

#include <stdexcept>

using quantpulse::domain::latency::LatencyConfig;
using quantpulse::domain::latency::LatencyEngine;

TEST(LatencyEngineTest, DefaultConfigurationIsZero)
{
    LatencyEngine engine;

    EXPECT_EQ(
        engine.totalLatencyNs(),
        0);
}

TEST(LatencyEngineTest, AcceptsValidConfiguration)
{
    const LatencyConfig config{
        100,
        200,
        300,
        400};

    LatencyEngine engine(config);

    EXPECT_EQ(
        engine.totalLatencyNs(),
        1000);
}

TEST(LatencyEngineTest, CalculatesLatencyBreakdown)
{
    const LatencyConfig config{
        100,
        200,
        300,
        400};

    LatencyEngine engine(config);

    const auto result =
        engine.calculate();

    EXPECT_EQ(
        result.marketDataLatencyNs,
        100);

    EXPECT_EQ(
        result.signalLatencyNs,
        200);

    EXPECT_EQ(
        result.orderLatencyNs,
        300);

    EXPECT_EQ(
        result.executionLatencyNs,
        400);

    EXPECT_EQ(
        result.totalLatencyNs,
        1000);
}

TEST(LatencyEngineTest, ConfigureUpdatesLatency)
{
    LatencyEngine engine;

    engine.configure(
        LatencyConfig{
            10,
            20,
            30,
            40});

    EXPECT_EQ(
        engine.totalLatencyNs(),
        100);
}

TEST(LatencyEngineTest, ConfigReturnsConfiguredValues)
{
    LatencyEngine engine(
        LatencyConfig{
            10,
            20,
            30,
            40});

    const auto &config =
        engine.config();

    EXPECT_EQ(
        config.marketDataLatencyNs,
        10);

    EXPECT_EQ(
        config.signalLatencyNs,
        20);

    EXPECT_EQ(
        config.orderLatencyNs,
        30);

    EXPECT_EQ(
        config.executionLatencyNs,
        40);
}

TEST(LatencyEngineTest, AllowsZeroLatency)
{
    LatencyEngine engine(
        LatencyConfig{
            0,
            0,
            0,
            0});

    EXPECT_EQ(
        engine.totalLatencyNs(),
        0);
}

TEST(LatencyEngineTest, RejectsNegativeMarketDataLatency)
{
    EXPECT_THROW(
        LatencyEngine(
            LatencyConfig{
                -1,
                0,
                0,
                0}),
        std::invalid_argument);
}

TEST(LatencyEngineTest, RejectsNegativeSignalLatency)
{
    EXPECT_THROW(
        LatencyEngine(
            LatencyConfig{
                0,
                -1,
                0,
                0}),
        std::invalid_argument);
}

TEST(LatencyEngineTest, RejectsNegativeOrderLatency)
{
    EXPECT_THROW(
        LatencyEngine(
            LatencyConfig{
                0,
                0,
                -1,
                0}),
        std::invalid_argument);
}

TEST(LatencyEngineTest, RejectsNegativeExecutionLatency)
{
    EXPECT_THROW(
        LatencyEngine(
            LatencyConfig{
                0,
                0,
                0,
                -1}),
        std::invalid_argument);
}

TEST(LatencyEngineTest, CalculatesOnlyMarketDataLatency)
{
    LatencyEngine engine(
        LatencyConfig{
            500,
            0,
            0,
            0});

    EXPECT_EQ(
        engine.totalLatencyNs(),
        500);
}

TEST(LatencyEngineTest, CalculatesOnlyExecutionLatency)
{
    LatencyEngine engine(
        LatencyConfig{
            0,
            0,
            0,
            750});

    EXPECT_EQ(
        engine.totalLatencyNs(),
        750);
}

TEST(LatencyEngineTest, CalculatesLargeLatencyValues)
{
    LatencyEngine engine(
        LatencyConfig{
            1000000,
            2000000,
            3000000,
            4000000});

    EXPECT_EQ(
        engine.totalLatencyNs(),
        10000000);
}

TEST(LatencyEngineTest, ResetRestoresZeroConfiguration)
{
    LatencyEngine engine(
        LatencyConfig{
            100,
            200,
            300,
            400});

    engine.reset();

    EXPECT_EQ(
        engine.totalLatencyNs(),
        0);

    const auto &config =
        engine.config();

    EXPECT_EQ(
        config.marketDataLatencyNs,
        0);

    EXPECT_EQ(
        config.signalLatencyNs,
        0);

    EXPECT_EQ(
        config.orderLatencyNs,
        0);

    EXPECT_EQ(
        config.executionLatencyNs,
        0);
}

TEST(LatencyEngineTest, ReconfigureAfterInitialConfiguration)
{
    LatencyEngine engine(
        LatencyConfig{
            10,
            20,
            30,
            40});

    engine.configure(
        LatencyConfig{
            100,
            200,
            300,
            400});

    EXPECT_EQ(
        engine.totalLatencyNs(),
        1000);
}