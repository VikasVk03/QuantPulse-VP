#include "quantpulse/domain/research/ResearchEngine.hpp"

#include <gtest/gtest.h>

#include <cmath>
#include <limits>
#include <vector>

namespace quantpulse::domain::research
{

    namespace
    {

        std::vector<ResearchObservation>
        createObservations(
            std::size_t count)
        {
            std::vector<ResearchObservation>
                observations;

            observations.reserve(count);

            for (std::size_t i = 0;
                 i < count;
                 ++i)
            {
                const double price =
                    100.0 +
                    static_cast<double>(i) * 0.5;

                observations.push_back(
                    ResearchObservation{
                        price,
                        1000.0 +
                            static_cast<double>(i) * 10.0,

                        price - 0.05,
                        price + 0.05,

                        500.0,
                        400.0,

                        600.0,
                        400.0});
            }

            return observations;
        }

    } // namespace

    TEST(
        ResearchEngineTest,
        GeneratesResultsForValidObservations)
    {
        const auto observations =
            createObservations(30);

        ResearchConfig config;

        config.featureWindow = 20;

        const auto result =
            ResearchEngine::run(
                observations,
                config);

        EXPECT_EQ(
            result.signals.size(),
            observations.size());

        EXPECT_EQ(
            result.strategySignals.size(),
            observations.size());

        EXPECT_TRUE(
            std::isfinite(
                result.performance.totalReturn));

        EXPECT_TRUE(
            std::isfinite(
                result.performance.volatility));

        EXPECT_TRUE(
            std::isfinite(
                result.performance.maximumDrawdown));
    }

    TEST(
        ResearchEngineTest,
        WarmupPeriodProducesFlatSignals)
    {
        const auto observations =
            createObservations(30);

        ResearchConfig config;

        config.featureWindow = 10;

        const auto result =
            ResearchEngine::run(
                observations,
                config);

        for (std::size_t i = 0;
             i < config.featureWindow - 1;
             ++i)
        {
            EXPECT_DOUBLE_EQ(
                result.signals[i],
                0.0);

            EXPECT_DOUBLE_EQ(
                result.strategySignals[i],
                0.0);
        }
    }

    TEST(
        ResearchEngineTest,
        GeneratedSignalsAreBounded)
    {
        const auto observations =
            createObservations(40);

        ResearchConfig config;

        config.featureWindow = 20;

        const auto result =
            ResearchEngine::run(
                observations,
                config);

        for (const double signal :
             result.signals)
        {
            EXPECT_GE(signal, -1.0);

            EXPECT_LE(signal, 1.0);
        }
    }

    TEST(
        ResearchEngineTest,
        StrategySignalsAreBinary)
    {
        const auto observations =
            createObservations(40);

        ResearchConfig config;

        config.featureWindow = 20;

        const auto result =
            ResearchEngine::run(
                observations,
                config);

        for (const double signal :
             result.strategySignals)
        {
            EXPECT_TRUE(
                signal == 0.0 ||
                signal == 1.0);
        }
    }

    TEST(
        ResearchEngineTest,
        RejectsInsufficientObservations)
    {
        const auto observations =
            createObservations(10);

        ResearchConfig config;

        config.featureWindow = 20;

        EXPECT_THROW(
            ResearchEngine::run(
                observations,
                config),
            std::invalid_argument);
    }

    TEST(
        ResearchEngineTest,
        RejectsFeatureWindowSmallerThanTwo)
    {
        const auto observations =
            createObservations(20);

        ResearchConfig config;

        config.featureWindow = 1;

        EXPECT_THROW(
            ResearchEngine::run(
                observations,
                config),
            std::invalid_argument);
    }

    TEST(
        ResearchEngineTest,
        RejectsInvalidEntryThreshold)
    {
        const auto observations =
            createObservations(30);

        ResearchConfig config;

        config.entryThreshold =
            std::numeric_limits<double>::quiet_NaN();

        EXPECT_THROW(
            ResearchEngine::run(
                observations,
                config),
            std::invalid_argument);
    }

    TEST(
        ResearchEngineTest,
        RejectsInvalidExitThreshold)
    {
        const auto observations =
            createObservations(30);

        ResearchConfig config;

        config.exitThreshold =
            std::numeric_limits<double>::infinity();

        EXPECT_THROW(
            ResearchEngine::run(
                observations,
                config),
            std::invalid_argument);
    }

    TEST(
        ResearchEngineTest,
        RejectsExitThresholdGreaterThanEntryThreshold)
    {
        const auto observations =
            createObservations(30);

        ResearchConfig config;

        config.entryThreshold = 0.2;
        config.exitThreshold = 0.3;

        EXPECT_THROW(
            ResearchEngine::run(
                observations,
                config),
            std::invalid_argument);
    }

    TEST(
        ResearchEngineTest,
        RejectsInvalidInitialCapital)
    {
        const auto observations =
            createObservations(30);

        ResearchConfig config;

        config.initialCapital = 0.0;

        EXPECT_THROW(
            ResearchEngine::run(
                observations,
                config),
            std::invalid_argument);
    }

    TEST(
        ResearchEngineTest,
        RejectsNegativeTransactionCost)
    {
        const auto observations =
            createObservations(30);

        ResearchConfig config;

        config.transactionCostRate = -0.001;

        EXPECT_THROW(
            ResearchEngine::run(
                observations,
                config),
            std::invalid_argument);
    }

    TEST(
        ResearchEngineTest,
        RejectsInvalidPeriodsPerYear)
    {
        const auto observations =
            createObservations(30);

        ResearchConfig config;

        config.periodsPerYear = 0.0;

        EXPECT_THROW(
            ResearchEngine::run(
                observations,
                config),
            std::invalid_argument);
    }

    TEST(
        ResearchEngineTest,
        RejectsInvalidRiskFreeRate)
    {
        const auto observations =
            createObservations(30);

        ResearchConfig config;

        config.riskFreeRate =
            std::numeric_limits<double>::quiet_NaN();

        EXPECT_THROW(
            ResearchEngine::run(
                observations,
                config),
            std::invalid_argument);
    }

    TEST(
        ResearchEngineTest,
        RejectsInvalidPrice)
    {
        auto observations =
            createObservations(30);

        observations[10].price = 0.0;

        EXPECT_THROW(
            ResearchEngine::run(
                observations),
            std::invalid_argument);
    }

    TEST(
        ResearchEngineTest,
        RejectsNegativeVolume)
    {
        auto observations =
            createObservations(30);

        observations[10].volume = -1.0;

        EXPECT_THROW(
            ResearchEngine::run(
                observations),
            std::invalid_argument);
    }

    TEST(
        ResearchEngineTest,
        RejectsAskBelowBid)
    {
        auto observations =
            createObservations(30);

        observations[10].bidPrice =
            101.0;

        observations[10].askPrice =
            100.0;

        EXPECT_THROW(
            ResearchEngine::run(
                observations),
            std::invalid_argument);
    }

    TEST(
        ResearchEngineTest,
        RejectsNegativeBidVolume)
    {
        auto observations =
            createObservations(30);

        observations[10].bidVolume =
            -1.0;

        EXPECT_THROW(
            ResearchEngine::run(
                observations),
            std::invalid_argument);
    }

    TEST(
        ResearchEngineTest,
        RejectsNonFiniteTradeVolume)
    {
        auto observations =
            createObservations(30);

        observations[10].tradeBuyVolume =
            std::numeric_limits<double>::infinity();

        EXPECT_THROW(
            ResearchEngine::run(
                observations),
            std::invalid_argument);
    }

} // namespace quantpulse::domain::research