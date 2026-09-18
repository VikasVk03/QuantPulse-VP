#include "quantpulse/application/backtesting/BacktestingApplication.hpp"

#include <gtest/gtest.h>

#include <stdexcept>
#include <vector>

namespace quantpulse::application::backtesting
{

    TEST(BacktestingApplicationTest, RunsBacktest)
    {
        const BacktestingRequest request{
            .observations = {
                {.price = 100.0, .signal = 1.0},
                {.price = 110.0, .signal = 1.0},
                {.price = 110.0, .signal = 0.0},
            },
            .initialCapital = 10000.0,
            .signalThreshold = 0.5,
            .transactionCostRate = 0.0,
        };

        const auto report =
            BacktestingApplication::run(request);

        EXPECT_DOUBLE_EQ(
            report.initialCapital,
            10000.0);

        EXPECT_DOUBLE_EQ(
            report.finalCapital,
            11000.0);

        EXPECT_NEAR(
            report.totalReturn,
            0.10,
            1e-12);

        EXPECT_EQ(
            report.numberOfTrades,
            2);

        EXPECT_EQ(
            report.equityCurve.size(),
            3);

        ASSERT_EQ(
            report.tradeReturn.size(),
            1);

        EXPECT_NEAR(
            report.tradeReturn[0],
            0.10,
            1e-12);
    }

    TEST(BacktestingApplicationTest, PreservesDomainValidation)
    {
        const BacktestingRequest request{
            .observations = {},
            .initialCapital = 10000.0,
            .signalThreshold = 0.5,
            .transactionCostRate = 0.0,
        };

        EXPECT_THROW(
            BacktestingApplication::run(request),
            std::invalid_argument);
    }

} // namespace quantpulse::application::backtesting
