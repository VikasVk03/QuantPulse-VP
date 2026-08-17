#include "quantpulse/domain/risk/RiskEngine.hpp"

#include <gtest/gtest.h>

#include <cmath>
#include <limits>
#include <stdexcept>
#include <vector>

using quantpulse::domain::risk::RiskEngine;

// ============================================================
// Sharpe Ratio
// ============================================================

TEST(RiskEngineTest, CalculatesSharpeRatio)
{
    const std::vector<double> returns{
        0.02,
        0.04,
        0.03,
        0.05};

    const double riskFreeRate = 0.01;

    const double meanExcessReturn =
        (0.01 + 0.03 + 0.02 + 0.04) / 4.0;

    const double expectedStandardDeviation =
        std::sqrt(
            (
                std::pow(0.01 - meanExcessReturn, 2) +
                std::pow(0.03 - meanExcessReturn, 2) +
                std::pow(0.02 - meanExcessReturn, 2) +
                std::pow(0.04 - meanExcessReturn, 2)) /
            3.0);

    const double expected =
        meanExcessReturn / expectedStandardDeviation;

    EXPECT_NEAR(
        RiskEngine::sharpeRatio(
            returns,
            riskFreeRate),
        expected,
        1e-12);
}

TEST(RiskEngineTest, CalculatesNegativeSharpeRatio)
{
    const std::vector<double> returns{
        0.01,
        0.02,
        0.015,
        0.005};

    const double riskFreeRate = 0.02;

    EXPECT_LT(
        RiskEngine::sharpeRatio(
            returns,
            riskFreeRate),
        0.0);
}

TEST(RiskEngineTest, ThrowsForZeroSharpeStandardDeviation)
{
    const std::vector<double> returns{
        0.02,
        0.02,
        0.02,
        0.02};

    EXPECT_THROW(
        RiskEngine::sharpeRatio(
            returns,
            0.01),
        std::invalid_argument);
}

// ============================================================
// Maximum Drawdown
// ============================================================

TEST(RiskEngineTest, CalculatesMaximumDrawdown)
{
    const std::vector<double> returns{
        0.10,
        -0.05,
        -0.10,
        0.20};

    EXPECT_NEAR(
        RiskEngine::maximumDrawdown(returns),
        -0.145,
        1e-12);
}

TEST(RiskEngineTest, ReturnsZeroForMonotonicallyIncreasingReturns)
{
    const std::vector<double> returns{
        0.10,
        0.05,
        0.20};

    EXPECT_DOUBLE_EQ(
        RiskEngine::maximumDrawdown(returns),
        0.0);
}

TEST(RiskEngineTest, ThrowsForCompleteLoss)
{
    const std::vector<double> returns{
        0.10,
        -1.0};

    EXPECT_THROW(
        RiskEngine::maximumDrawdown(returns),
        std::invalid_argument);
}

// ============================================================
// Downside Deviation
// ============================================================

TEST(RiskEngineTest, CalculatesDownsideDeviation)
{
    const std::vector<double> returns{
        0.02,
        -0.01,
        -0.03,
        0.04};

    const double targetReturn = 0.0;

    const double expected =
        std::sqrt(
            (
                0.0 +
                0.0001 +
                0.0009 +
                0.0) /
            4.0);

    EXPECT_NEAR(
        RiskEngine::downsideDeviation(
            returns,
            targetReturn),
        expected,
        1e-12);
}

// ============================================================
// Sortino Ratio
// ============================================================

TEST(RiskEngineTest, CalculatesSortinoRatio)
{
    const std::vector<double> returns{
        0.10,
        0.05,
        -0.02,
        0.08};

    const double targetReturn = 0.0;

    const double averageReturn = 0.0525;

    const double downsideDeviation =
        std::sqrt(
            (0.02 * 0.02) / 4.0);

    const double expected =
        averageReturn / downsideDeviation;

    EXPECT_NEAR(
        RiskEngine::sortinoRatio(
            returns,
            targetReturn),
        expected,
        1e-12);
}

TEST(RiskEngineTest, CalculatesNegativeSortinoRatio)
{
    const std::vector<double> returns{
        -0.05,
        -0.02,
        0.01,
        -0.03};

    const double targetReturn = 0.02;

    EXPECT_LT(
        RiskEngine::sortinoRatio(
            returns,
            targetReturn),
        0.0);
}

TEST(RiskEngineTest, ThrowsForZeroDownsideDeviation)
{
    const std::vector<double> returns{
        0.05,
        0.06,
        0.07,
        0.08};

    EXPECT_THROW(
        RiskEngine::sortinoRatio(
            returns,
            0.0),
        std::invalid_argument);
}

TEST(RiskEngineTest, ThrowsForEmptySortinoInput)
{
    const std::vector<double> returns;

    EXPECT_THROW(
        RiskEngine::sortinoRatio(
            returns,
            0.0),
        std::invalid_argument);
}

TEST(RiskEngineTest, ThrowsForNaNSortinoTarget)
{
    const std::vector<double> returns{
        0.01,
        -0.02};

    EXPECT_THROW(
        RiskEngine::sortinoRatio(
            returns,
            std::numeric_limits<double>::quiet_NaN()),
        std::invalid_argument);
}

// ============================================================
// Beta
// ============================================================

TEST(RiskEngineTest, CalculatesBeta)
{
    const std::vector<double> assetReturns{
        0.02,
        0.04,
        0.06,
        0.08};

    const std::vector<double> benchmarkReturns{
        0.01,
        0.02,
        0.03,
        0.04};

    EXPECT_NEAR(
        RiskEngine::beta(
            assetReturns,
            benchmarkReturns),
        2.0,
        1e-12);
}

TEST(RiskEngineTest, CalculatesBetaOfBenchmarkAgainstItself)
{
    const std::vector<double> returns{
        0.01,
        0.02,
        0.03,
        0.04};

    EXPECT_NEAR(
        RiskEngine::beta(
            returns,
            returns),
        1.0,
        1e-12);
}

TEST(RiskEngineTest, CalculatesNegativeBeta)
{
    const std::vector<double> assetReturns{
        -0.02,
        -0.04,
        -0.06,
        -0.08};

    const std::vector<double> benchmarkReturns{
        0.01,
        0.02,
        0.03,
        0.04};

    EXPECT_NEAR(
        RiskEngine::beta(
            assetReturns,
            benchmarkReturns),
        -2.0,
        1e-12);
}

TEST(RiskEngineTest, ThrowsForDifferentSizedBetaInputs)
{
    const std::vector<double> assetReturns{
        0.01,
        0.02,
        0.03};

    const std::vector<double> benchmarkReturns{
        0.01,
        0.02};

    EXPECT_THROW(
        RiskEngine::beta(
            assetReturns,
            benchmarkReturns),
        std::invalid_argument);
}

TEST(RiskEngineTest, ThrowsForZeroBenchmarkVariance)
{
    const std::vector<double> assetReturns{
        0.01,
        0.02,
        0.03,
        0.04};

    const std::vector<double> benchmarkReturns{
        0.02,
        0.02,
        0.02,
        0.02};

    EXPECT_THROW(
        RiskEngine::beta(
            assetReturns,
            benchmarkReturns),
        std::invalid_argument);
}

TEST(RiskEngineTest, ThrowsForEmptyAssetReturnsInBeta)
{
    const std::vector<double> assetReturns;

    const std::vector<double> benchmarkReturns{
        0.01,
        0.02};

    EXPECT_THROW(
        RiskEngine::beta(
            assetReturns,
            benchmarkReturns),
        std::invalid_argument);
}

TEST(RiskEngineTest, ThrowsForEmptyBenchmarkReturnsInBeta)
{
    const std::vector<double> assetReturns{
        0.01,
        0.02};

    const std::vector<double> benchmarkReturns;

    EXPECT_THROW(
        RiskEngine::beta(
            assetReturns,
            benchmarkReturns),
        std::invalid_argument);
}

TEST(RiskEngineTest, ThrowsForNaNAssetReturnInBeta)
{
    const std::vector<double> assetReturns{
        0.01,
        std::numeric_limits<double>::quiet_NaN()};

    const std::vector<double> benchmarkReturns{
        0.01,
        0.02};

    EXPECT_THROW(
        RiskEngine::beta(
            assetReturns,
            benchmarkReturns),
        std::invalid_argument);
}

// ============================================================
// Alpha
// ============================================================

TEST(RiskEngineTest, CalculatesAlpha)
{
    const std::vector<double> assetReturns{
        0.03,
        0.07,
        0.05,
        0.09};

    const std::vector<double> benchmarkReturns{
        0.02,
        0.04,
        0.03,
        0.05};

    const double riskFreeRate = 0.01;

    /*
     * Asset returns are:
     *
     *     R_asset = 2 * R_benchmark - 0.01
     *
     * Therefore:
     *
     *     beta = 2
     *
     * Mean asset return:
     *
     *     (0.03 + 0.07 + 0.05 + 0.09) / 4
     *     = 0.06
     *
     * Mean benchmark return:
     *
     *     (0.02 + 0.04 + 0.03 + 0.05) / 4
     *     = 0.035
     *
     * CAPM expected return:
     *
     *     0.01 + 2 * (0.035 - 0.01)
     *     = 0.06
     *
     * Therefore alpha = 0.
     */

    EXPECT_NEAR(
        RiskEngine::alpha(
            assetReturns,
            benchmarkReturns,
            riskFreeRate),
        0.0,
        1e-12);
}

TEST(RiskEngineTest, CalculatesPositiveAlpha)
{
    const std::vector<double> assetReturns{
        0.05,
        0.09,
        0.07,
        0.11};

    const std::vector<double> benchmarkReturns{
        0.02,
        0.04,
        0.03,
        0.05};

    const double riskFreeRate = 0.01;

    /*
     * beta = 2
     *
     * Mean asset return:
     *     0.08
     *
     * Mean benchmark return:
     *     0.035
     *
     * CAPM expected return:
     *     0.01 + 2 * (0.035 - 0.01)
     *     = 0.06
     *
     * Alpha:
     *     0.08 - 0.06
     *     = 0.02
     */

    EXPECT_NEAR(
        RiskEngine::alpha(
            assetReturns,
            benchmarkReturns,
            riskFreeRate),
        0.02,
        1e-12);
}

TEST(RiskEngineTest, CalculatesNegativeAlpha)
{
    const std::vector<double> assetReturns{
        0.01,
        0.05,
        0.03,
        0.07};

    const std::vector<double> benchmarkReturns{
        0.02,
        0.04,
        0.03,
        0.05};

    const double riskFreeRate = 0.01;

    /*
     * beta = 2
     *
     * Mean asset return:
     *     0.04
     *
     * Mean benchmark return:
     *     0.035
     *
     * CAPM expected return:
     *     0.06
     *
     * Alpha:
     *     0.04 - 0.06
     *     = -0.02
     */

    EXPECT_NEAR(
        RiskEngine::alpha(
            assetReturns,
            benchmarkReturns,
            riskFreeRate),
        -0.02,
        1e-12);
}

TEST(RiskEngineTest, CalculatesAlphaWithZeroRiskFreeRate)
{
    const std::vector<double> assetReturns{
        0.02,
        0.06,
        0.04,
        0.08};

    const std::vector<double> benchmarkReturns{
        0.01,
        0.03,
        0.02,
        0.04};

    /*
     * beta = 2
     *
     * Mean asset return     = 0.05
     * Mean benchmark return = 0.025
     *
     * Expected return:
     *
     *     0 + 2 * 0.025
     *     = 0.05
     *
     * Alpha = 0.
     */

    EXPECT_NEAR(
        RiskEngine::alpha(
            assetReturns,
            benchmarkReturns,
            0.0),
        0.0,
        1e-12);
}

TEST(RiskEngineTest, ThrowsForDifferentSizedAlphaInputs)
{
    const std::vector<double> assetReturns{
        0.03,
        0.05,
        0.07};

    const std::vector<double> benchmarkReturns{
        0.02,
        0.04};

    EXPECT_THROW(
        RiskEngine::alpha(
            assetReturns,
            benchmarkReturns,
            0.01),
        std::invalid_argument);
}

TEST(RiskEngineTest, ThrowsForNaNRiskFreeRate)
{
    const std::vector<double> assetReturns{
        0.03,
        0.05,
        0.07};

    const std::vector<double> benchmarkReturns{
        0.02,
        0.04,
        0.03};

    EXPECT_THROW(
        RiskEngine::alpha(
            assetReturns,
            benchmarkReturns,
            std::numeric_limits<double>::quiet_NaN()),
        std::invalid_argument);
}

TEST(RiskEngineTest, ThrowsForInfiniteRiskFreeRate)
{
    const std::vector<double> assetReturns{
        0.03,
        0.05,
        0.07};

    const std::vector<double> benchmarkReturns{
        0.02,
        0.04,
        0.03};

    EXPECT_THROW(
        RiskEngine::alpha(
            assetReturns,
            benchmarkReturns,
            std::numeric_limits<double>::infinity()),
        std::invalid_argument);
}

TEST(RiskEngineTest, ThrowsForZeroVarianceAlphaBenchmark)
{
    const std::vector<double> assetReturns{
        0.03,
        0.05,
        0.07,
        0.09};

    const std::vector<double> benchmarkReturns{
        0.02,
        0.02,
        0.02,
        0.02};

    EXPECT_THROW(
        RiskEngine::alpha(
            assetReturns,
            benchmarkReturns,
            0.01),
        std::invalid_argument);
}

TEST(RiskEngineTest, ThrowsForNaNAlphaReturn)
{
    const std::vector<double> assetReturns{
        0.03,
        std::numeric_limits<double>::quiet_NaN(),
        0.07};

    const std::vector<double> benchmarkReturns{
        0.02,
        0.04,
        0.03};

    EXPECT_THROW(
        RiskEngine::alpha(
            assetReturns,
            benchmarkReturns,
            0.01),
        std::invalid_argument);
}

TEST(RiskEngineTest, ThrowsForInfiniteAlphaBenchmarkReturn)
{
    const std::vector<double> assetReturns{
        0.03,
        0.05,
        0.07};

    const std::vector<double> benchmarkReturns{
        0.02,
        std::numeric_limits<double>::infinity(),
        0.03};

    EXPECT_THROW(
        RiskEngine::alpha(
            assetReturns,
            benchmarkReturns,
            0.01),
        std::invalid_argument);
}

// ============================================================
// Historical Value at Risk
// ============================================================

TEST(RiskEngineTest, CalculatesHistoricalVaR)
{
    const std::vector<double> returns{
        -0.10,
        -0.05,
        -0.02,
        0.01,
        0.03};

    /*
     * At 80% confidence:
     *
     * tail probability = 1 - 0.80 = 0.20
     *
     * The 20th percentile is -0.05.
     *
     * VaR = -(-0.05) = 0.05.
     */

    EXPECT_NEAR(
        RiskEngine::historicalVaR(
            returns,
            0.80),
        0.06,
        1e-12);
}

TEST(RiskEngineTest, CalculatesInterpolatedHistoricalVaR)
{
    const std::vector<double> returns{
        -0.10,
        -0.04,
        0.00,
        0.02};

    /*
     * 75% confidence:
     *
     * tail probability = 0.25
     *
     * position = 0.25 * (4 - 1)
     *          = 0.75
     *
     * Interpolate between:
     *
     * x[0] = -0.10
     * x[1] = -0.04
     *
     * Q(0.25)
     * = -0.10 + 0.75 * (-0.04 + 0.10)
     * = -0.055
     *
     * VaR = 0.055.
     */

    EXPECT_NEAR(
        RiskEngine::historicalVaR(
            returns,
            0.75),
        0.055,
        1e-12);
}

TEST(RiskEngineTest, CalculatesZeroHistoricalVaR)
{
    const std::vector<double> returns{
        0.01,
        0.02,
        0.03,
        0.04};

    /*
     * Every historical return is positive.
     * Therefore the lower-tail quantile is positive,
     * producing a non-positive signed loss threshold.
     *
     * Our API represents VaR as a positive loss magnitude.
     * For this dataset, there is no historical loss.
     */

    EXPECT_LE(
        RiskEngine::historicalVaR(
            returns,
            0.95),
        0.0);
}

TEST(RiskEngineTest, HistoricalVaRIsNonNegativeForLossDistribution)
{
    const std::vector<double> returns{
        -0.20,
        -0.10,
        -0.05,
        0.01,
        0.03};

    EXPECT_GE(
        RiskEngine::historicalVaR(
            returns,
            0.80),
        0.0);
}

TEST(RiskEngineTest, ThrowsForEmptyHistoricalVaRInput)
{
    const std::vector<double> returns;

    EXPECT_THROW(
        RiskEngine::historicalVaR(
            returns,
            0.95),
        std::invalid_argument);
}

TEST(RiskEngineTest, ThrowsForZeroConfidenceLevel)
{
    const std::vector<double> returns{
        -0.05,
        0.01,
        0.03};

    EXPECT_THROW(
        RiskEngine::historicalVaR(
            returns,
            0.0),
        std::invalid_argument);
}

TEST(RiskEngineTest, ThrowsForOneConfidenceLevel)
{
    const std::vector<double> returns{
        -0.05,
        0.01,
        0.03};

    EXPECT_THROW(
        RiskEngine::historicalVaR(
            returns,
            1.0),
        std::invalid_argument);
}

TEST(RiskEngineTest, ThrowsForNegativeConfidenceLevel)
{
    const std::vector<double> returns{
        -0.05,
        0.01,
        0.03};

    EXPECT_THROW(
        RiskEngine::historicalVaR(
            returns,
            -0.95),
        std::invalid_argument);
}

TEST(RiskEngineTest, ThrowsForConfidenceLevelGreaterThanOne)
{
    const std::vector<double> returns{
        -0.05,
        0.01,
        0.03};

    EXPECT_THROW(
        RiskEngine::historicalVaR(
            returns,
            1.05),
        std::invalid_argument);
}

TEST(RiskEngineTest, ThrowsForNaNConfidenceLevel)
{
    const std::vector<double> returns{
        -0.05,
        0.01,
        0.03};

    EXPECT_THROW(
        RiskEngine::historicalVaR(
            returns,
            std::numeric_limits<double>::quiet_NaN()),
        std::invalid_argument);
}

TEST(RiskEngineTest, ThrowsForInfiniteConfidenceLevel)
{
    const std::vector<double> returns{
        -0.05,
        0.01,
        0.03};

    EXPECT_THROW(
        RiskEngine::historicalVaR(
            returns,
            std::numeric_limits<double>::infinity()),
        std::invalid_argument);
}

TEST(RiskEngineTest, ThrowsForNaNHistoricalVaRReturn)
{
    const std::vector<double> returns{
        -0.05,
        std::numeric_limits<double>::quiet_NaN(),
        0.03};

    EXPECT_THROW(
        RiskEngine::historicalVaR(
            returns,
            0.95),
        std::invalid_argument);
}

TEST(RiskEngineTest, ThrowsForInfiniteHistoricalVaRReturn)
{
    const std::vector<double> returns{
        -0.05,
        std::numeric_limits<double>::infinity(),
        0.03};

    EXPECT_THROW(
        RiskEngine::historicalVaR(
            returns,
            0.95),
        std::invalid_argument);
}

// ============================================================
// Validation
// ============================================================

TEST(RiskEngineTest, ThrowsForEmptySharpeInput)
{
    const std::vector<double> returns;

    EXPECT_THROW(
        RiskEngine::sharpeRatio(
            returns,
            0.01),
        std::invalid_argument);
}

TEST(RiskEngineTest, ThrowsForEmptyDrawdownInput)
{
    const std::vector<double> returns;

    EXPECT_THROW(
        RiskEngine::maximumDrawdown(returns),
        std::invalid_argument);
}

TEST(RiskEngineTest, ThrowsForEmptyDownsideDeviationInput)
{
    const std::vector<double> returns;

    EXPECT_THROW(
        RiskEngine::downsideDeviation(
            returns,
            0.0),
        std::invalid_argument);
}

TEST(RiskEngineTest, ThrowsForNaNReturn)
{
    const std::vector<double> returns{
        0.01,
        std::numeric_limits<double>::quiet_NaN()};

    EXPECT_THROW(
        RiskEngine::sharpeRatio(
            returns,
            0.0),
        std::invalid_argument);
}

TEST(RiskEngineTest, ThrowsForInfiniteReturn)
{
    const std::vector<double> returns{
        0.01,
        std::numeric_limits<double>::infinity()};

    EXPECT_THROW(
        RiskEngine::maximumDrawdown(returns),
        std::invalid_argument);
}

// ============================================================
// Conditional Value at Risk (CVaR)
// ============================================================

TEST(
    RiskEngineTest,
    CalculatesHistoricalCVaR)
{
    const std::vector<double> returns{
        -0.10,
        -0.05,
        -0.02,
        0.01,
        0.03};

    const double expected = 0.075;

    EXPECT_NEAR(
        RiskEngine::historicalCVaR(
            returns,
            0.80),
        expected,
        1e-12);
}

TEST(
    RiskEngineTest,
    CalculatesFractionalHistoricalCVaR)
{
    const std::vector<double> returns{
        -0.10,
        -0.08,
        -0.05,
        0.01,
        0.03,
        0.05};

    const double confidenceLevel = 0.75;

    const double expected = 0.09;

    EXPECT_NEAR(
        RiskEngine::historicalCVaR(
            returns,
            confidenceLevel),
        expected,
        1e-12);
}

/* TEST(
    RiskEngineTest,
    CalculatesZeroHistoricalCVaR)
{
    const std::vector<double> returns{
        0.01,
        0.02,
        0.03,
        0.04};

    EXPECT_NEAR(
        RiskEngine::historicalCVaR(
            returns,
            0.95),
        -0.01,
        1e-12);
} */

TEST(
    RiskEngineTest,
    ReturnsZeroHistoricalCVaRForNoLosses)
{
    const std::vector<double> returns{
        0.01,
        0.02,
        0.03,
        0.04};

    EXPECT_NEAR(
        RiskEngine::historicalCVaR(
            returns,
            0.95),
        0.0,
        1e-12);
}