#include "quantpulse/domain/rolling_window/RollingWindowEngine.hpp"

#include <gtest/gtest.h>

#include <limits>
#include <stdexcept>

using quantpulse::domain::rolling_window::RollingWindowEngine;

TEST(RollingWindowEngineTest, RejectsZeroCapacity)
{
    EXPECT_THROW(
        RollingWindowEngine(0),
        std::invalid_argument);
}

TEST(RollingWindowEngineTest, InitiallyEmpty)
{
    RollingWindowEngine window(3);

    EXPECT_TRUE(window.empty());
    EXPECT_FALSE(window.full());
    EXPECT_EQ(window.size(), 0U);
    EXPECT_EQ(window.capacity(), 3U);
}

TEST(RollingWindowEngineTest, PushAddsValue)
{
    RollingWindowEngine window(3);

    window.push(100.0);

    EXPECT_EQ(window.size(), 1U);
    EXPECT_DOUBLE_EQ(window.latest(), 100.0);
}

TEST(RollingWindowEngineTest, PreservesInsertionOrder)
{
    RollingWindowEngine window(3);

    window.push(10.0);
    window.push(20.0);
    window.push(30.0);

    EXPECT_DOUBLE_EQ(window.at(0), 10.0);
    EXPECT_DOUBLE_EQ(window.at(1), 20.0);
    EXPECT_DOUBLE_EQ(window.at(2), 30.0);
}

TEST(RollingWindowEngineTest, BecomesFullAtCapacity)
{
    RollingWindowEngine window(3);

    window.push(10.0);
    window.push(20.0);
    window.push(30.0);

    EXPECT_TRUE(window.full());
    EXPECT_EQ(window.size(), 3U);
}

TEST(RollingWindowEngineTest, EvictsOldestValueWhenFull)
{
    RollingWindowEngine window(3);

    window.push(10.0);
    window.push(20.0);
    window.push(30.0);
    window.push(40.0);

    EXPECT_EQ(window.size(), 3U);

    EXPECT_DOUBLE_EQ(window.at(0), 20.0);
    EXPECT_DOUBLE_EQ(window.at(1), 30.0);
    EXPECT_DOUBLE_EQ(window.at(2), 40.0);
}

TEST(RollingWindowEngineTest, LatestReturnsNewestValue)
{
    RollingWindowEngine window(3);

    window.push(10.0);
    window.push(20.0);
    window.push(30.0);

    EXPECT_DOUBLE_EQ(
        window.latest(),
        30.0);
}

TEST(RollingWindowEngineTest, CanUseCapacityOne)
{
    RollingWindowEngine window(1);

    window.push(10.0);
    window.push(20.0);

    EXPECT_EQ(window.size(), 1U);
    EXPECT_DOUBLE_EQ(window.latest(), 20.0);
}

TEST(RollingWindowEngineTest, AllowsNegativeValues)
{
    RollingWindowEngine window(3);

    window.push(-10.0);

    EXPECT_DOUBLE_EQ(
        window.latest(),
        -10.0);
}

TEST(RollingWindowEngineTest, RejectsNaN)
{
    RollingWindowEngine window(3);

    EXPECT_THROW(
        window.push(
            std::numeric_limits<double>::quiet_NaN()),
        std::invalid_argument);
}

TEST(RollingWindowEngineTest, RejectsPositiveInfinity)
{
    RollingWindowEngine window(3);

    EXPECT_THROW(
        window.push(
            std::numeric_limits<double>::infinity()),
        std::invalid_argument);
}

TEST(RollingWindowEngineTest, RejectsNegativeInfinity)
{
    RollingWindowEngine window(3);

    EXPECT_THROW(
        window.push(
            -std::numeric_limits<double>::infinity()),
        std::invalid_argument);
}

TEST(RollingWindowEngineTest, LatestOnEmptyWindowThrows)
{
    RollingWindowEngine window(3);

    EXPECT_THROW(
        (void)window.latest(),
        std::out_of_range);
}

TEST(RollingWindowEngineTest, AtOutOfRangeThrows)
{
    RollingWindowEngine window(3);

    window.push(100.0);

    EXPECT_THROW(
        (void)window.at(1),
        std::out_of_range);
}

TEST(RollingWindowEngineTest, DataReturnsCurrentWindow)
{
    RollingWindowEngine window(3);

    window.push(10.0);
    window.push(20.0);
    window.push(30.0);
    window.push(40.0);

    const auto &data = window.data();

    ASSERT_EQ(data.size(), 3U);

    EXPECT_DOUBLE_EQ(data[0], 20.0);
    EXPECT_DOUBLE_EQ(data[1], 30.0);
    EXPECT_DOUBLE_EQ(data[2], 40.0);
}

TEST(RollingWindowEngineTest, ClearRemovesAllValues)
{
    RollingWindowEngine window(3);

    window.push(10.0);
    window.push(20.0);

    window.clear();

    EXPECT_TRUE(window.empty());
    EXPECT_FALSE(window.full());
    EXPECT_EQ(window.size(), 0U);
}

TEST(RollingWindowEngineTest, CanPushAfterClear)
{
    RollingWindowEngine window(3);

    window.push(10.0);
    window.clear();
    window.push(50.0);

    EXPECT_EQ(window.size(), 1U);
    EXPECT_DOUBLE_EQ(window.latest(), 50.0);
}