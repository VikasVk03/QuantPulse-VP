#include "quantpulse/domain/trading/TradingEngine.hpp"

#include <benchmark/benchmark.h>

namespace
{

    using quantpulse::domain::strategy::
        Position;

    using quantpulse::domain::trading::
        TradingConfig;

    using quantpulse::domain::trading::
        TradingEngine;

    using quantpulse::domain::trading::
        TradingRequest;

    TradingConfig createConfig()
    {
        TradingConfig config{};

        config.entryThreshold =
            0.25;

        config.exitThreshold =
            -0.25;

        return config;
    }

    TradingRequest createEntryRequest()
    {
        return TradingRequest{
            0.50,
            Position::Flat,

            100000.0,

            100.0,
            95.0,

            500.0,
            0.05};
    }

    TradingRequest createExitRequest()
    {
        return TradingRequest{
            -0.50,
            Position::Long,

            100000.0,

            100.0,
            95.0,

            500.0,
            0.05};
    }

    TradingRequest createHoldRequest()
    {
        return TradingRequest{
            0.0,
            Position::Flat,

            100000.0,

            100.0,
            95.0,

            500.0,
            0.05};
    }

    TradingRequest createRejectedRequest()
    {
        return TradingRequest{
            0.50,
            Position::Flat,

            100000.0,

            100.0,
            95.0,

            2000.0,
            0.20};
    }

} // namespace

/*
 * --------------------------------------------------------
 * HOLD PATH
 * --------------------------------------------------------
 *
 * Strategy produces Hold.
 *
 * No sizing, risk evaluation or execution occurs.
 */
static void BM_TRADING_ENGINE_HOLD(
    benchmark::State &state)
{
    const auto request =
        createHoldRequest();

    const auto config =
        createConfig();

    for (auto _ : state)
    {
        const auto result =
            TradingEngine::evaluate(
                request,
                config);

        benchmark::DoNotOptimize(
            result.executionDecision
                .shouldExecute);
    }

    state.SetItemsProcessed(
        state.iterations());
}

/*
 * --------------------------------------------------------
 * ENTRY PATH
 * --------------------------------------------------------
 *
 * Full pipeline:
 *
 * Strategy
 *   ->
 * Position sizing
 *   ->
 * Risk management
 *   ->
 * Execution
 */
static void BM_TRADING_ENGINE_ENTRY(
    benchmark::State &state)
{
    const auto request =
        createEntryRequest();

    const auto config =
        createConfig();

    for (auto _ : state)
    {
        const auto result =
            TradingEngine::evaluate(
                request,
                config);

        benchmark::DoNotOptimize(
            result.executionDecision
                .shouldExecute);
    }

    state.SetItemsProcessed(
        state.iterations());
}

/*
 * --------------------------------------------------------
 * EXIT PATH
 * --------------------------------------------------------
 */
static void BM_TRADING_ENGINE_EXIT(
    benchmark::State &state)
{
    const auto request =
        createExitRequest();

    const auto config =
        createConfig();

    for (auto _ : state)
    {
        const auto result =
            TradingEngine::evaluate(
                request,
                config);

        benchmark::DoNotOptimize(
            result.executionDecision
                .shouldExecute);
    }

    state.SetItemsProcessed(
        state.iterations());
}

/*
 * --------------------------------------------------------
 * RISK REJECTION PATH
 * --------------------------------------------------------
 *
 * Strategy requests entry but risk management
 * rejects the proposed trade.
 */
static void BM_TRADING_ENGINE_RISK_REJECTED(
    benchmark::State &state)
{
    auto request =
        createRejectedRequest();

    auto config =
        createConfig();

    config.sizingConfig
        .allocationFraction =
        0.50;

    config.riskManagementConfig
        .maximumPositionFraction =
        0.20;

    config.riskManagementConfig
        .maximumDrawdownFraction =
        0.15;

    config.riskManagementConfig
        .maximumRiskPerTradeFraction =
        0.01;

    for (auto _ : state)
    {
        const auto result =
            TradingEngine::evaluate(
                request,
                config);

        benchmark::DoNotOptimize(
            result.riskDecision.allowed);
    }

    state.SetItemsProcessed(
        state.iterations());
}

BENCHMARK(
    BM_TRADING_ENGINE_HOLD);

BENCHMARK(
    BM_TRADING_ENGINE_ENTRY);

BENCHMARK(
    BM_TRADING_ENGINE_EXIT);

BENCHMARK(
    BM_TRADING_ENGINE_RISK_REJECTED);