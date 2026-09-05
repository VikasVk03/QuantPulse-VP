#include "quantpulse/domain/time_series/TimeSeriesEngine.hpp"

#include <gtest/gtest.h>

#include <cmath>
#include <limits>
#include <stdexcept>

using quantpulse::domain::time_series::TimeSeriesEngine;

TEST(TimeSeriesEngineTest, InitiallyEmpty)
{
    TimeSeriesEngine series;

    EXPECT_TRUE(series.empty());
    EXPECT_EQ(series.size(), 0U);
}

TEST(TimeSeriesEngineTest, AppendAddsPoint)
{
    TimeSeriesEngine series;

    series.append(1000, 100.5);

    EXPECT_FALSE(series.empty());
    EXPECT_EQ(series.size(), 1U);
}

TEST(TimeSeriesEngineTest, LatestReturnsMostRecentPoint)
{
    TimeSeriesEngine series;

    series.append(1000, 100.0);
    series.append(2000, 105.0);

    const auto &point = series.latest();

    EXPECT_EQ(point.timestamp, 2000);
    EXPECT_DOUBLE_EQ(point.value, 105.0);
}

TEST(TimeSeriesEngineTest, AtReturnsPointByIndex)
{
    TimeSeriesEngine series;

    series.append(1000, 100.0);
    series.append(2000, 105.0);
    series.append(3000, 110.0);

    const auto &point = series.at(1);

    EXPECT_EQ(point.timestamp, 2000);
    EXPECT_DOUBLE_EQ(point.value, 105.0);
}

TEST(TimeSeriesEngineTest, DataReturnsAllPoints)
{
    TimeSeriesEngine series;

    series.append(1000, 100.0);
    series.append(2000, 105.0);

    const auto &data = series.data();

    ASSERT_EQ(data.size(), 2U);

    EXPECT_EQ(data[0].timestamp, 1000);
    EXPECT_DOUBLE_EQ(data[0].value, 100.0);

    EXPECT_EQ(data[1].timestamp, 2000);
    EXPECT_DOUBLE_EQ(data[1].value, 105.0);
}

TEST(TimeSeriesEngineTest, AllowsZeroTimestamp)
{
    TimeSeriesEngine series;

    series.append(0, 100.0);

    EXPECT_EQ(series.size(), 1U);
    EXPECT_EQ(series.latest().timestamp, 0);
}

TEST(TimeSeriesEngineTest, AllowsNegativeValue)
{
    TimeSeriesEngine series;

    series.append(1000, -25.5);

    EXPECT_DOUBLE_EQ(
        series.latest().value,
        -25.5);
}

TEST(TimeSeriesEngineTest, RejectsNegativeTimestamp)
{
    TimeSeriesEngine series;

    EXPECT_THROW(
        series.append(-1, 100.0),
        std::invalid_argument);
}

TEST(TimeSeriesEngineTest, RejectsNonFiniteValue)
{
    TimeSeriesEngine series;

    EXPECT_THROW(
        series.append(
            1000,
            std::numeric_limits<double>::quiet_NaN()),
        std::invalid_argument);
}

TEST(TimeSeriesEngineTest, RejectsPositiveInfinity)
{
    TimeSeriesEngine series;

    EXPECT_THROW(
        series.append(
            1000,
            std::numeric_limits<double>::infinity()),
        std::invalid_argument);
}

TEST(TimeSeriesEngineTest, RejectsNegativeInfinity)
{
    TimeSeriesEngine series;

    EXPECT_THROW(
        series.append(
            1000,
            -std::numeric_limits<double>::infinity()),
        std::invalid_argument);
}

TEST(TimeSeriesEngineTest, RejectsDuplicateTimestamp)
{
    TimeSeriesEngine series;

    series.append(1000, 100.0);

    EXPECT_THROW(
        series.append(1000, 105.0),
        std::invalid_argument);
}

TEST(TimeSeriesEngineTest, RejectsOutOfOrderTimestamp)
{
    TimeSeriesEngine series;

    series.append(2000, 100.0);

    EXPECT_THROW(
        series.append(1000, 105.0),
        std::invalid_argument);
}

TEST(TimeSeriesEngineTest, LatestOnEmptySeriesThrows)
{
    TimeSeriesEngine series;

    EXPECT_THROW(
        (void)series.latest(),
        std::out_of_range);
}

TEST(TimeSeriesEngineTest, AtOutOfRangeThrows)
{
    TimeSeriesEngine series;

    series.append(1000, 100.0);

    EXPECT_THROW(
        (void)series.at(1),
        std::out_of_range);
}

TEST(TimeSeriesEngineTest, ClearRemovesAllPoints)
{
    TimeSeriesEngine series;

    series.append(1000, 100.0);
    series.append(2000, 105.0);

    series.clear();

    EXPECT_TRUE(series.empty());
    EXPECT_EQ(series.size(), 0U);
}

TEST(TimeSeriesEngineTest, CanAppendAgainAfterClear)
{
    TimeSeriesEngine series;

    series.append(1000, 100.0);
    series.clear();

    series.append(5000, 200.0);

    EXPECT_EQ(series.size(), 1U);
    EXPECT_EQ(series.latest().timestamp, 5000);
    EXPECT_DOUBLE_EQ(
        series.latest().value,
        200.0);
}