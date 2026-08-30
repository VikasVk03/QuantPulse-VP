#include "quantpulse/domain/risk_management/RiskManagementEngine.hpp"

#include <gtest/gtest.h>

#include <limits>
#include <stdexcept>

namespace quantpulse::domain::risk_management
{

    class RiskManagementEngineTest
        : public ::testing::Test
    {
    protected:
        RiskManagementConfig config{
            0.20,
            0.15,
            0.01};
    };

    TEST_F(
        RiskManagementEngineTest,
        AllowsTradeWithinAllLimits)
    {
        const auto result =
            RiskManagementEngine::evaluate(
                100000.0,
                10000.0,
                500.0,
                0.05,
                config);

        EXPECT_TRUE(result.allowed);

        EXPECT_FALSE(
            result.positionLimitExceeded);

        EXPECT_FALSE(
            result.drawdownLimitExceeded);

        EXPECT_FALSE(
            result.riskLimitExceeded);
    }

    TEST_F(
        RiskManagementEngineTest,
        RejectsTradeWhenPositionLimitExceeded)
    {
        const auto result =
            RiskManagementEngine::evaluate(
                100000.0,
                25000.0,
                500.0,
                0.05,
                config);

        EXPECT_FALSE(result.allowed);

        EXPECT_TRUE(
            result.positionLimitExceeded);

        EXPECT_FALSE(
            result.drawdownLimitExceeded);

        EXPECT_FALSE(
            result.riskLimitExceeded);
    }

    TEST_F(
        RiskManagementEngineTest,
        RejectsTradeWhenDrawdownLimitExceeded)
    {
        const auto result =
            RiskManagementEngine::evaluate(
                100000.0,
                10000.0,
                500.0,
                0.20,
                config);

        EXPECT_FALSE(result.allowed);

        EXPECT_FALSE(
            result.positionLimitExceeded);

        EXPECT_TRUE(
            result.drawdownLimitExceeded);

        EXPECT_FALSE(
            result.riskLimitExceeded);
    }

    TEST_F(
        RiskManagementEngineTest,
        RejectsTradeWhenRiskLimitExceeded)
    {
        const auto result =
            RiskManagementEngine::evaluate(
                100000.0,
                10000.0,
                2000.0,
                0.05,
                config);

        EXPECT_FALSE(result.allowed);

        EXPECT_FALSE(
            result.positionLimitExceeded);

        EXPECT_FALSE(
            result.drawdownLimitExceeded);

        EXPECT_TRUE(
            result.riskLimitExceeded);
    }

    TEST_F(
        RiskManagementEngineTest,
        RejectsTradeWhenMultipleLimitsExceeded)
    {
        const auto result =
            RiskManagementEngine::evaluate(
                100000.0,
                30000.0,
                2000.0,
                0.20,
                config);

        EXPECT_FALSE(result.allowed);

        EXPECT_TRUE(
            result.positionLimitExceeded);

        EXPECT_TRUE(
            result.drawdownLimitExceeded);

        EXPECT_TRUE(
            result.riskLimitExceeded);
    }

    TEST_F(
        RiskManagementEngineTest,
        AllowsPositionExactlyAtLimit)
    {
        const auto result =
            RiskManagementEngine::evaluate(
                100000.0,
                20000.0,
                500.0,
                0.05,
                config);

        EXPECT_TRUE(result.allowed);

        EXPECT_FALSE(
            result.positionLimitExceeded);
    }

    TEST_F(
        RiskManagementEngineTest,
        AllowsDrawdownExactlyAtLimit)
    {
        const auto result =
            RiskManagementEngine::evaluate(
                100000.0,
                10000.0,
                500.0,
                0.15,
                config);

        EXPECT_TRUE(result.allowed);

        EXPECT_FALSE(
            result.drawdownLimitExceeded);
    }

    TEST_F(
        RiskManagementEngineTest,
        AllowsRiskExactlyAtLimit)
    {
        const auto result =
            RiskManagementEngine::evaluate(
                100000.0,
                10000.0,
                1000.0,
                0.05,
                config);

        EXPECT_TRUE(result.allowed);

        EXPECT_FALSE(
            result.riskLimitExceeded);
    }

    TEST_F(
        RiskManagementEngineTest,
        AllowsZeroPositionAndZeroRisk)
    {
        const auto result =
            RiskManagementEngine::evaluate(
                100000.0,
                0.0,
                0.0,
                0.0,
                config);

        EXPECT_TRUE(result.allowed);
    }

    TEST_F(
        RiskManagementEngineTest,
        RejectsNonPositiveCapital)
    {
        EXPECT_THROW(
            RiskManagementEngine::evaluate(
                0.0,
                1000.0,
                100.0,
                0.0,
                config),
            std::invalid_argument);

        EXPECT_THROW(
            RiskManagementEngine::evaluate(
                -100000.0,
                1000.0,
                100.0,
                0.0,
                config),
            std::invalid_argument);
    }

    TEST_F(
        RiskManagementEngineTest,
        RejectsNegativeProposedPositionValue)
    {
        EXPECT_THROW(
            RiskManagementEngine::evaluate(
                100000.0,
                -1.0,
                100.0,
                0.0,
                config),
            std::invalid_argument);
    }

    TEST_F(
        RiskManagementEngineTest,
        RejectsNegativePotentialLoss)
    {
        EXPECT_THROW(
            RiskManagementEngine::evaluate(
                100000.0,
                1000.0,
                -1.0,
                0.0,
                config),
            std::invalid_argument);
    }

    TEST_F(
        RiskManagementEngineTest,
        RejectsNegativeCurrentDrawdown)
    {
        EXPECT_THROW(
            RiskManagementEngine::evaluate(
                100000.0,
                1000.0,
                100.0,
                -0.01,
                config),
            std::invalid_argument);
    }

    TEST_F(
        RiskManagementEngineTest,
        RejectsDrawdownGreaterThanOne)
    {
        EXPECT_THROW(
            RiskManagementEngine::evaluate(
                100000.0,
                1000.0,
                100.0,
                1.01,
                config),
            std::invalid_argument);
    }

    TEST(
        RiskManagementEngineValidationTest,
        RejectsInvalidMaximumPositionFraction)
    {
        RiskManagementConfig config;

        config.maximumPositionFraction =
            -0.01;

        EXPECT_THROW(
            RiskManagementEngine::evaluate(
                100000.0,
                1000.0,
                100.0,
                0.0,
                config),
            std::invalid_argument);

        config.maximumPositionFraction =
            1.01;

        EXPECT_THROW(
            RiskManagementEngine::evaluate(
                100000.0,
                1000.0,
                100.0,
                0.0,
                config),
            std::invalid_argument);
    }

    TEST(
        RiskManagementEngineValidationTest,
        RejectsInvalidMaximumDrawdownFraction)
    {
        RiskManagementConfig config;

        config.maximumDrawdownFraction =
            -0.01;

        EXPECT_THROW(
            RiskManagementEngine::evaluate(
                100000.0,
                1000.0,
                100.0,
                0.0,
                config),
            std::invalid_argument);

        config.maximumDrawdownFraction =
            1.01;

        EXPECT_THROW(
            RiskManagementEngine::evaluate(
                100000.0,
                1000.0,
                100.0,
                0.0,
                config),
            std::invalid_argument);
    }

    TEST(
        RiskManagementEngineValidationTest,
        RejectsInvalidMaximumRiskPerTradeFraction)
    {
        RiskManagementConfig config;

        config.maximumRiskPerTradeFraction =
            -0.01;

        EXPECT_THROW(
            RiskManagementEngine::evaluate(
                100000.0,
                1000.0,
                100.0,
                0.0,
                config),
            std::invalid_argument);

        config.maximumRiskPerTradeFraction =
            1.01;

        EXPECT_THROW(
            RiskManagementEngine::evaluate(
                100000.0,
                1000.0,
                100.0,
                0.0,
                config),
            std::invalid_argument);
    }

    TEST(
        RiskManagementEngineValidationTest,
        RejectsNonFiniteInputs)
    {
        RiskManagementConfig config;

        EXPECT_THROW(
            RiskManagementEngine::evaluate(
                std::numeric_limits<double>::quiet_NaN(),
                1000.0,
                100.0,
                0.0,
                config),
            std::invalid_argument);

        EXPECT_THROW(
            RiskManagementEngine::evaluate(
                100000.0,
                std::numeric_limits<double>::infinity(),
                100.0,
                0.0,
                config),
            std::invalid_argument);

        EXPECT_THROW(
            RiskManagementEngine::evaluate(
                100000.0,
                1000.0,
                std::numeric_limits<double>::quiet_NaN(),
                0.0,
                config),
            std::invalid_argument);

        EXPECT_THROW(
            RiskManagementEngine::evaluate(
                100000.0,
                1000.0,
                100.0,
                std::numeric_limits<double>::infinity(),
                config),
            std::invalid_argument);
    }

    TEST(
        RiskManagementEngineValidationTest,
        RejectsNonFiniteConfiguration)
    {
        RiskManagementConfig config;

        config.maximumPositionFraction =
            std::numeric_limits<double>::quiet_NaN();

        EXPECT_THROW(
            RiskManagementEngine::evaluate(
                100000.0,
                1000.0,
                100.0,
                0.0,
                config),
            std::invalid_argument);

        config = RiskManagementConfig{};

        config.maximumDrawdownFraction =
            std::numeric_limits<double>::infinity();

        EXPECT_THROW(
            RiskManagementEngine::evaluate(
                100000.0,
                1000.0,
                100.0,
                0.0,
                config),
            std::invalid_argument);

        config = RiskManagementConfig{};

        config.maximumRiskPerTradeFraction =
            std::numeric_limits<double>::quiet_NaN();

        EXPECT_THROW(
            RiskManagementEngine::evaluate(
                100000.0,
                1000.0,
                100.0,
                0.0,
                config),
            std::invalid_argument);
    }

} // namespace quantpulse::domain::risk_management