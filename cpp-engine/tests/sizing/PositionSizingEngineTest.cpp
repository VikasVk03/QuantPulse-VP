#include "quantpulse/domain/sizing/PositionSizingEngine.hpp"

#include <gtest/gtest.h>

#include <limits>
#include <stdexcept>

namespace
{

    using quantpulse::domain::sizing::
        PositionSizingConfig;

    using quantpulse::domain::sizing::
        PositionSizingEngine;

    using quantpulse::domain::sizing::
        PositionSizingMethod;

    /*
     * ============================================================
     * Fixed Fraction Tests
     * ============================================================
     */

    TEST(
        PositionSizingEngineTest,
        CalculatesFixedFractionPosition)
    {
        PositionSizingConfig config;

        config.method =
            PositionSizingMethod::FixedFraction;

        config.allocationFraction =
            0.10;

        config.maximumAllocationFraction =
            1.0;

        const auto result =
            PositionSizingEngine::calculate(
                100000.0,
                100.0,
                90.0,
                config);

        EXPECT_DOUBLE_EQ(
            result.positionValue,
            10000.0);

        EXPECT_DOUBLE_EQ(
            result.quantity,
            100.0);

        EXPECT_DOUBLE_EQ(
            result.allocatedCapital,
            10000.0);
    }

    TEST(
        PositionSizingEngineTest,
        FixedFractionRespectsMaximumAllocation)
    {
        PositionSizingConfig config;

        config.method =
            PositionSizingMethod::FixedFraction;

        config.allocationFraction =
            0.50;

        config.maximumAllocationFraction =
            0.25;

        /*
         * This configuration itself is invalid.
         *
         * The engine should reject it instead of silently
         * changing the requested allocation.
         */
        EXPECT_THROW(
            PositionSizingEngine::calculate(
                100000.0,
                100.0,
                90.0,
                config),
            std::invalid_argument);
    }

    /*
     * ============================================================
     * Risk-Based Tests
     * ============================================================
     */

    TEST(
        PositionSizingEngineTest,
        CalculatesRiskBasedPosition)
    {
        PositionSizingConfig config;

        config.method =
            PositionSizingMethod::RiskBased;

        config.riskFraction =
            0.01;

        config.maximumAllocationFraction =
            1.0;

        /*
         * Capital = 100000
         *
         * Risk capital =
         *
         * 100000 * 0.01 = 1000
         *
         * Stop distance =
         *
         * |100 - 90| = 10
         *
         * Quantity =
         *
         * 1000 / 10 = 100
         *
         * Position value =
         *
         * 100 * 100 = 10000
         */
        const auto result =
            PositionSizingEngine::calculate(
                100000.0,
                100.0,
                90.0,
                config);

        EXPECT_DOUBLE_EQ(
            result.positionValue,
            10000.0);

        EXPECT_DOUBLE_EQ(
            result.quantity,
            100.0);

        EXPECT_DOUBLE_EQ(
            result.allocatedCapital,
            10000.0);
    }

    TEST(
        PositionSizingEngineTest,
        RiskBasedPositionIsCappedByMaximumAllocation)
    {
        PositionSizingConfig config;

        config.method =
            PositionSizingMethod::RiskBased;

        config.riskFraction =
            0.10;

        config.maximumAllocationFraction =
            0.20;

        /*
         * Risk capital:
         *
         * 100000 * 0.10 = 10000
         *
         * Stop distance:
         *
         * |100 - 99| = 1
         *
         * Uncapped quantity:
         *
         * 10000 / 1 = 10000
         *
         * Uncapped position value:
         *
         * 10000 * 100 = 1000000
         *
         * Maximum allowed:
         *
         * 100000 * 0.20 = 20000
         */
        const auto result =
            PositionSizingEngine::calculate(
                100000.0,
                100.0,
                99.0,
                config);

        EXPECT_DOUBLE_EQ(
            result.positionValue,
            20000.0);

        EXPECT_DOUBLE_EQ(
            result.quantity,
            200.0);

        EXPECT_DOUBLE_EQ(
            result.allocatedCapital,
            20000.0);
    }

    TEST(
        PositionSizingEngineTest,
        RejectsEqualEntryAndStopPriceForRiskBasedSizing)
    {
        PositionSizingConfig config;

        config.method =
            PositionSizingMethod::RiskBased;

        EXPECT_THROW(
            PositionSizingEngine::calculate(
                100000.0,
                100.0,
                100.0,
                config),
            std::invalid_argument);
    }

    /*
     * ============================================================
     * Input Validation Tests
     * ============================================================
     */

    TEST(
        PositionSizingEngineTest,
        RejectsNonPositiveCapital)
    {
        PositionSizingConfig config;

        EXPECT_THROW(
            PositionSizingEngine::calculate(
                0.0,
                100.0,
                90.0,
                config),
            std::invalid_argument);

        EXPECT_THROW(
            PositionSizingEngine::calculate(
                -1000.0,
                100.0,
                90.0,
                config),
            std::invalid_argument);
    }

    TEST(
        PositionSizingEngineTest,
        RejectsNonPositiveEntryPrice)
    {
        PositionSizingConfig config;

        EXPECT_THROW(
            PositionSizingEngine::calculate(
                100000.0,
                0.0,
                90.0,
                config),
            std::invalid_argument);

        EXPECT_THROW(
            PositionSizingEngine::calculate(
                100000.0,
                -100.0,
                90.0,
                config),
            std::invalid_argument);
    }

    TEST(
        PositionSizingEngineTest,
        RejectsNonPositiveStopPrice)
    {
        PositionSizingConfig config;

        EXPECT_THROW(
            PositionSizingEngine::calculate(
                100000.0,
                100.0,
                0.0,
                config),
            std::invalid_argument);

        EXPECT_THROW(
            PositionSizingEngine::calculate(
                100000.0,
                100.0,
                -90.0,
                config),
            std::invalid_argument);
    }

    TEST(
        PositionSizingEngineTest,
        RejectsNonFiniteCapital)
    {
        PositionSizingConfig config;

        EXPECT_THROW(
            PositionSizingEngine::calculate(
                std::numeric_limits<double>::infinity(),
                100.0,
                90.0,
                config),
            std::invalid_argument);

        EXPECT_THROW(
            PositionSizingEngine::calculate(
                std::numeric_limits<double>::quiet_NaN(),
                100.0,
                90.0,
                config),
            std::invalid_argument);
    }

    TEST(
        PositionSizingEngineTest,
        RejectsNonFinitePrices)
    {
        PositionSizingConfig config;

        EXPECT_THROW(
            PositionSizingEngine::calculate(
                100000.0,
                std::numeric_limits<double>::infinity(),
                90.0,
                config),
            std::invalid_argument);

        EXPECT_THROW(
            PositionSizingEngine::calculate(
                100000.0,
                100.0,
                std::numeric_limits<double>::quiet_NaN(),
                config),
            std::invalid_argument);
    }

    /*
     * ============================================================
     * Configuration Validation Tests
     * ============================================================
     */

    TEST(
        PositionSizingEngineTest,
        RejectsNegativeAllocationFraction)
    {
        PositionSizingConfig config;

        config.allocationFraction =
            -0.01;

        EXPECT_THROW(
            PositionSizingEngine::calculate(
                100000.0,
                100.0,
                90.0,
                config),
            std::invalid_argument);
    }

    TEST(
        PositionSizingEngineTest,
        RejectsAllocationFractionGreaterThanOne)
    {
        PositionSizingConfig config;

        config.allocationFraction =
            1.01;

        EXPECT_THROW(
            PositionSizingEngine::calculate(
                100000.0,
                100.0,
                90.0,
                config),
            std::invalid_argument);
    }

    TEST(
        PositionSizingEngineTest,
        RejectsNegativeMaximumAllocationFraction)
    {
        PositionSizingConfig config;

        config.maximumAllocationFraction =
            -0.01;

        EXPECT_THROW(
            PositionSizingEngine::calculate(
                100000.0,
                100.0,
                90.0,
                config),
            std::invalid_argument);
    }

    TEST(
        PositionSizingEngineTest,
        RejectsMaximumAllocationGreaterThanOne)
    {
        PositionSizingConfig config;

        config.maximumAllocationFraction =
            1.01;

        EXPECT_THROW(
            PositionSizingEngine::calculate(
                100000.0,
                100.0,
                90.0,
                config),
            std::invalid_argument);
    }

    TEST(
        PositionSizingEngineTest,
        RejectsNegativeRiskFraction)
    {
        PositionSizingConfig config;

        config.riskFraction =
            -0.01;

        EXPECT_THROW(
            PositionSizingEngine::calculate(
                100000.0,
                100.0,
                90.0,
                config),
            std::invalid_argument);
    }

    TEST(
        PositionSizingEngineTest,
        RejectsRiskFractionGreaterThanOne)
    {
        PositionSizingConfig config;

        config.riskFraction =
            1.01;

        EXPECT_THROW(
            PositionSizingEngine::calculate(
                100000.0,
                100.0,
                90.0,
                config),
            std::invalid_argument);
    }

    TEST(
        PositionSizingEngineTest,
        RejectsAllocationGreaterThanMaximumAllocation)
    {
        PositionSizingConfig config;

        config.allocationFraction =
            0.50;

        config.maximumAllocationFraction =
            0.25;

        EXPECT_THROW(
            PositionSizingEngine::calculate(
                100000.0,
                100.0,
                90.0,
                config),
            std::invalid_argument);
    }

    TEST(
        PositionSizingEngineTest,
        RejectsInvalidSizingMethod)
    {
        PositionSizingConfig config;

        config.method =
            static_cast<
                PositionSizingMethod>(999);

        EXPECT_THROW(
            PositionSizingEngine::calculate(
                100000.0,
                100.0,
                90.0,
                config),
            std::invalid_argument);
    }

} // namespace