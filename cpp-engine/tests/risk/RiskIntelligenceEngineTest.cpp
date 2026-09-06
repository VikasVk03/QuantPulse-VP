#include "quantpulse/domain/risk/RiskIntelligenceEngine.hpp"

#include <gtest/gtest.h>

#include <cmath>
#include <limits>
#include <stdexcept>

namespace
{

    using quantpulse::domain::risk::MarketMicrostructureRiskInputs;
    using quantpulse::domain::risk::RiskIntelligenceConfig;
    using quantpulse::domain::risk::RiskIntelligenceEngine;
    using quantpulse::domain::risk::RiskIntelligenceInputs;
    using quantpulse::domain::risk::RiskLevel;

    RiskIntelligenceInputs createNormalInputs()
    {
        RiskIntelligenceInputs inputs{};
        inputs.microstructure.spread = 0.0005;          // 5 bps
        inputs.microstructure.depthImbalance = 0.05;    // Slight buy pressure
        inputs.microstructure.micropriceDrift = 0.0001; // Tiny drift
        inputs.volatility = 0.12;                       // 12% annualized volatility
        inputs.currentDrawdown = 0.02;                  // 2% drawdown
        inputs.portfolioExposure = 0.25;                // 25% capital exposure
        return inputs;
    }

    TEST(RiskIntelligenceEngineTest, NormalMarketProducesNormalRiskAndFullSizing)
    {
        const auto inputs = createNormalInputs();
        const auto report = RiskIntelligenceEngine::evaluate(inputs);

        EXPECT_EQ(report.level, RiskLevel::Normal);
        EXPECT_DOUBLE_EQ(report.sizingMultiplier, 1.0);
        EXPECT_TRUE(report.allowTrading);
        EXPECT_LT(report.compositeRiskScore, 25.0);
        EXPECT_GE(report.compositeRiskScore, 0.0);
    }

    TEST(RiskIntelligenceEngineTest, ElevatedMicrostructureSpreadProducesElevatedRisk)
    {
        auto inputs = createNormalInputs();
        inputs.microstructure.spread = 0.0030; // 30 bps > spreadElevated (20 bps)

        const auto report = RiskIntelligenceEngine::evaluate(inputs);

        EXPECT_EQ(report.level, RiskLevel::Elevated);
        EXPECT_DOUBLE_EQ(report.sizingMultiplier, 0.60);
        EXPECT_TRUE(report.allowTrading);
    }

    TEST(RiskIntelligenceEngineTest, ElevatedDepthImbalanceProducesElevatedRisk)
    {
        auto inputs = createNormalInputs();
        inputs.microstructure.depthImbalance = -0.65; // |-0.65| > imbalanceElevated (0.50)

        const auto report = RiskIntelligenceEngine::evaluate(inputs);

        EXPECT_EQ(report.level, RiskLevel::Elevated);
        EXPECT_DOUBLE_EQ(report.sizingMultiplier, 0.60);
        EXPECT_TRUE(report.allowTrading);
    }

    TEST(RiskIntelligenceEngineTest, HighVolatilityProducesHighRiskAndReducesSizing)
    {
        auto inputs = createNormalInputs();
        inputs.volatility = 0.45; // 45% > volatilityHigh (40%)

        const auto report = RiskIntelligenceEngine::evaluate(inputs);

        EXPECT_EQ(report.level, RiskLevel::High);
        EXPECT_DOUBLE_EQ(report.sizingMultiplier, 0.25);
        EXPECT_TRUE(report.allowTrading);
    }

    TEST(RiskIntelligenceEngineTest, HighDrawdownProducesHighRiskAndReducesSizing)
    {
        auto inputs = createNormalInputs();
        inputs.currentDrawdown = 0.13; // 13% > drawdownHigh (12%)

        const auto report = RiskIntelligenceEngine::evaluate(inputs);

        EXPECT_EQ(report.level, RiskLevel::High);
        EXPECT_DOUBLE_EQ(report.sizingMultiplier, 0.25);
        EXPECT_TRUE(report.allowTrading);
    }

    TEST(RiskIntelligenceEngineTest, CriticalDrawdownHaltsTrading)
    {
        auto inputs = createNormalInputs();
        inputs.currentDrawdown = 0.16; // 16% >= drawdownCritical (15%)

        const auto report = RiskIntelligenceEngine::evaluate(inputs);

        EXPECT_EQ(report.level, RiskLevel::Critical);
        EXPECT_DOUBLE_EQ(report.sizingMultiplier, 0.0);
        EXPECT_FALSE(report.allowTrading);
    }

    TEST(RiskIntelligenceEngineTest, CriticalSpreadHaltsTrading)
    {
        auto inputs = createNormalInputs();
        inputs.microstructure.spread = 0.0120; // 120 bps >= spreadCritical (100 bps)

        const auto report = RiskIntelligenceEngine::evaluate(inputs);

        EXPECT_EQ(report.level, RiskLevel::Critical);
        EXPECT_DOUBLE_EQ(report.sizingMultiplier, 0.0);
        EXPECT_FALSE(report.allowTrading);
    }

    TEST(RiskIntelligenceEngineTest, ExtremeExposureHaltsTrading)
    {
        auto inputs = createNormalInputs();
        inputs.portfolioExposure = 0.98; // 98% >= exposureCritical (95%)

        const auto report = RiskIntelligenceEngine::evaluate(inputs);

        EXPECT_EQ(report.level, RiskLevel::Critical);
        EXPECT_DOUBLE_EQ(report.sizingMultiplier, 0.0);
        EXPECT_FALSE(report.allowTrading);
    }

    TEST(RiskIntelligenceEngineTest, RejectsNegativeSpread)
    {
        auto inputs = createNormalInputs();
        inputs.microstructure.spread = -0.001;

        EXPECT_THROW(
            RiskIntelligenceEngine::evaluate(inputs),
            std::invalid_argument);
    }

    TEST(RiskIntelligenceEngineTest, RejectsOutOfRangeDepthImbalance)
    {
        auto inputs = createNormalInputs();
        inputs.microstructure.depthImbalance = 1.25;

        EXPECT_THROW(
            RiskIntelligenceEngine::evaluate(inputs),
            std::invalid_argument);

        inputs.microstructure.depthImbalance = -1.05;

        EXPECT_THROW(
            RiskIntelligenceEngine::evaluate(inputs),
            std::invalid_argument);
    }

    TEST(RiskIntelligenceEngineTest, RejectsNonFiniteInputs)
    {
        auto inputs = createNormalInputs();
        inputs.volatility = std::numeric_limits<double>::infinity();

        EXPECT_THROW(
            RiskIntelligenceEngine::evaluate(inputs),
            std::invalid_argument);

        inputs = createNormalInputs();
        inputs.microstructure.micropriceDrift = std::numeric_limits<double>::quiet_NaN();

        EXPECT_THROW(
            RiskIntelligenceEngine::evaluate(inputs),
            std::invalid_argument);
    }

    TEST(RiskIntelligenceEngineTest, RejectsInvalidConfigurationThresholds)
    {
        const auto inputs = createNormalInputs();
        RiskIntelligenceConfig config{};
        config.spreadHigh = 0.0010; // spreadElevated is 0.0020, so high < elevated is invalid

        EXPECT_THROW(
            RiskIntelligenceEngine::evaluate(inputs, config),
            std::invalid_argument);
    }

    TEST(RiskIntelligenceEngineTest, RejectsWeightsNotSummingToOne)
    {
        const auto inputs = createNormalInputs();
        RiskIntelligenceConfig config{};
        config.weightMicrostructure = 0.50; // Total becomes 1.15

        EXPECT_THROW(
            RiskIntelligenceEngine::evaluate(inputs, config),
            std::invalid_argument);
    }

    TEST(RiskIntelligenceEngineTest, ElevatedMicropriceDriftProducesElevatedRisk)
    {
        auto inputs = createNormalInputs();
        inputs.microstructure.micropriceDrift = 0.0030;

        const auto report = RiskIntelligenceEngine::evaluate(inputs);

        EXPECT_EQ(report.level, RiskLevel::Elevated);
        EXPECT_DOUBLE_EQ(report.sizingMultiplier, 0.60);
        EXPECT_TRUE(report.allowTrading);
    }

    TEST(RiskIntelligenceEngineTest, CriticalDepthImbalanceHaltsTrading)
    {
        auto inputs = createNormalInputs();
        inputs.microstructure.depthImbalance = 0.95;

        const auto report = RiskIntelligenceEngine::evaluate(inputs);

        EXPECT_EQ(report.level, RiskLevel::Critical);
        EXPECT_DOUBLE_EQ(report.sizingMultiplier, 0.0);
        EXPECT_FALSE(report.allowTrading);
    }

    TEST(RiskIntelligenceEngineTest, RejectsNonAscendingMicropriceDriftThresholds)
    {
        const auto inputs = createNormalInputs();
        RiskIntelligenceConfig config{};

        config.micropriceDriftHigh = config.micropriceDriftElevated;

        EXPECT_THROW(
            RiskIntelligenceEngine::evaluate(inputs, config),
            std::invalid_argument);
    }

    TEST(RiskIntelligenceEngineTest, MicropriceDriftUsesDedicatedThreshold)
    {
        auto inputs = createNormalInputs();
        RiskIntelligenceConfig config{};

        inputs.microstructure.micropriceDrift =
            config.micropriceDriftCritical;

        const auto report =
            RiskIntelligenceEngine::evaluate(inputs, config);

        EXPECT_GE(report.microstructureScore, 15.0);
    }

} // namespace
