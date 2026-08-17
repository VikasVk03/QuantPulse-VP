#include "quantpulse/domain/statistics/StatisticsEngine.hpp"

#include <gtest/gtest.h>
#include <stdexcept>
#include <vector>
#include <cmath>

using quantpulse::domain::statistics::StatisticsEngine;

TEST(StatisticsEngineTest, CalculateMean)
{
    const std::vector<double> values{
        100.0,
        102.0,
        101.0,
        105.0,
        103.0};

    EXPECT_DOUBLE_EQ(
        StatisticsEngine::mean(values),
        102.2);
}

TEST(StatisticsEngineTest, CalculatesMedianForOddDataset)
{
    const std::vector<double> values{
        5.0,
        1.0,
        3.0};

    EXPECT_DOUBLE_EQ(
        StatisticsEngine::median(values),
        3.0);
}

TEST(StatisticsEngineTest, CalculatesMedianForEvenDataset)
{
    const std::vector<double> values{
        4.0,
        1.0,
        3.0,
        2.0};

    EXPECT_DOUBLE_EQ(
        StatisticsEngine::median(values),
        2.5);
}

TEST(StatisticsEngineTest, CalculatesPopulationVariance)
{
    const std::vector<double> values{
        1.0,
        2.0,
        3.0,
        4.0,
        5.0};

    EXPECT_DOUBLE_EQ(
        StatisticsEngine::variance(values),
        2.0);
}

TEST(StatisticsEngineTest, CalculatesStandardDeviation)
{
    const std::vector<double> values{
        1.0,
        2.0,
        3.0,
        4.0,
        5.0};

    EXPECT_DOUBLE_EQ(
        StatisticsEngine::standardDeviation(values),
        std::sqrt(2.0));
}

TEST(StatisticsEngineTest, CalculatesMeanForNegativeValues)
{
    const std::vector<double> values{
        -10.0,
        -20.0,
        -30.0};

    EXPECT_DOUBLE_EQ(
        StatisticsEngine::mean(values),
        -20.0);
}

TEST(StatisticsEngineTest, CalculatesMeanForSingleValue)
{
    const std::vector<double> values{
        42.0};

    EXPECT_DOUBLE_EQ(
        StatisticsEngine::mean(values),
        42.0);
}

TEST(StatisticsEngineTest, ThrowsForEmptyMeanInput)
{
    const std::vector<double> values;

    EXPECT_THROW(
        static_cast<void>(StatisticsEngine::mean(values)),
        std::invalid_argument);
}

TEST(StatisticsEngineTest, ThrowsForEmptyMedianInput)
{
    const std::vector<double> values;

    EXPECT_THROW(
        static_cast<void>(StatisticsEngine::median(values)),
        std::invalid_argument);
}

TEST(StatisticsEngineTest, ThrowsForEmptyVarianceInput)
{
    const std::vector<double> values;

    EXPECT_THROW(
        static_cast<void>(StatisticsEngine::variance(values)),
        std::invalid_argument);
}

TEST(StatisticsEngineTest, CalculatesSampleVariance)
{
    const std::vector<double> values{
        1.0,
        2.0,
        3.0,
        4.0,
        5.0};

    EXPECT_NEAR(
        StatisticsEngine::sampleVariance(values),
        2.5,
        1e-12);
}

TEST(StatisticsEngineTest, CalculatesSampleStandardDeviation)
{
    const std::vector<double> values{
        1.0,
        2.0,
        3.0,
        4.0,
        5.0};

    EXPECT_NEAR(
        StatisticsEngine::sampleStandardDeviation(values),
        std::sqrt(2.5),
        1e-12);
}

TEST(StatisticsEngineTest, ThrowsForSingleValueSampleVariance)
{
    const std::vector<double> values{
        42.0};

    EXPECT_THROW(
        StatisticsEngine::sampleVariance(values),
        std::invalid_argument);
}

TEST(StatisticsEngineTest, ThrowsForSingleValueSampleStandardDeviation)
{
    const std::vector<double> values{
        42.0};

    EXPECT_THROW(
        StatisticsEngine::sampleStandardDeviation(values),
        std::invalid_argument);
}

TEST(StatisticsEngineTest, ThrowsForEmptySampleVariance)
{
    const std::vector<double> values;

    EXPECT_THROW(
        StatisticsEngine::sampleVariance(values),
        std::invalid_argument);
}

TEST(StatisticsEngineTest, ThrowsForEmptySampleStandardDeviation)
{
    const std::vector<double> values;

    EXPECT_THROW(
        StatisticsEngine::sampleStandardDeviation(values),
        std::invalid_argument);
}