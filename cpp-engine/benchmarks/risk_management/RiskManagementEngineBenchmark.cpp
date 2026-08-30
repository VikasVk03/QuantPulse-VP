#include "quantpulse/domain/risk_management/RiskManagementEngine.hpp"

#include <benchmark/benchmark.h>

#include <cstdint>

namespace
{

    /*
     * --------------------------------------------------------
     * Normal trade
     * --------------------------------------------------------
     *
     * Trade stays within all risk limits.
     */
    static void BM_RISK_MANAGEMENT_ALLOWED(
        benchmark::State &state)
    {
        using quantpulse::domain::risk_management::
            RiskManagementConfig;

        using quantpulse::domain::risk_management::
            RiskManagementEngine;

        const RiskManagementConfig config{
            0.20, // maximumPositionFraction
            0.15, // maximumDrawdownFraction
            0.01  // maximumRiskPerTradeFraction
        };

        constexpr double capital = 100000.0;

        constexpr double proposedPositionValue =
            10000.0;

        constexpr double potentialLoss =
            500.0;

        constexpr double currentDrawdown =
            0.05;

        for (auto _ : state)
        {
            const auto result =
                RiskManagementEngine::evaluate(
                    capital,
                    proposedPositionValue,
                    potentialLoss,
                    currentDrawdown,
                    config);

            benchmark::DoNotOptimize(
                result.allowed);
        }

        state.SetItemsProcessed(
            state.iterations());
    }

    /*
     * --------------------------------------------------------
     * Position limit rejection
     * --------------------------------------------------------
     */
    static void BM_RISK_MANAGEMENT_POSITION_REJECTED(
        benchmark::State &state)
    {
        using quantpulse::domain::risk_management::
            RiskManagementConfig;

        using quantpulse::domain::risk_management::
            RiskManagementEngine;

        const RiskManagementConfig config{
            0.20,
            0.15,
            0.01};

        constexpr double capital = 100000.0;

        /*
         * 30% position.
         * Maximum allowed is 20%.
         */
        constexpr double proposedPositionValue =
            30000.0;

        constexpr double potentialLoss =
            500.0;

        constexpr double currentDrawdown =
            0.05;

        for (auto _ : state)
        {
            const auto result =
                RiskManagementEngine::evaluate(
                    capital,
                    proposedPositionValue,
                    potentialLoss,
                    currentDrawdown,
                    config);

            benchmark::DoNotOptimize(
                result.positionLimitExceeded);
        }

        state.SetItemsProcessed(
            state.iterations());
    }

    /*
     * --------------------------------------------------------
     * Multiple risk limits rejected
     * --------------------------------------------------------
     *
     * Tests the case where several limits
     * are exceeded simultaneously.
     */
    static void BM_RISK_MANAGEMENT_MULTIPLE_REJECTED(
        benchmark::State &state)
    {
        using quantpulse::domain::risk_management::
            RiskManagementConfig;

        using quantpulse::domain::risk_management::
            RiskManagementEngine;

        const RiskManagementConfig config{
            0.20,
            0.15,
            0.01};

        constexpr double capital = 100000.0;

        /*
         * Position:
         *
         * 30000 / 100000 = 30%
         *
         * exceeds 20%.
         */
        constexpr double proposedPositionValue =
            30000.0;

        /*
         * Risk:
         *
         * 2000 / 100000 = 2%
         *
         * exceeds 1%.
         */
        constexpr double potentialLoss =
            2000.0;

        /*
         * 20% drawdown exceeds
         * 15% maximum.
         */
        constexpr double currentDrawdown =
            0.20;

        for (auto _ : state)
        {
            const auto result =
                RiskManagementEngine::evaluate(
                    capital,
                    proposedPositionValue,
                    potentialLoss,
                    currentDrawdown,
                    config);

            benchmark::DoNotOptimize(
                result.allowed);
        }

        state.SetItemsProcessed(
            state.iterations());
    }

} // namespace

BENCHMARK(
    BM_RISK_MANAGEMENT_ALLOWED);

BENCHMARK(
    BM_RISK_MANAGEMENT_POSITION_REJECTED);

BENCHMARK(
    BM_RISK_MANAGEMENT_MULTIPLE_REJECTED);