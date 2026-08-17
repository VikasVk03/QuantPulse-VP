#include "quantpulse/domain/portfolio/PortfolioEngine.hpp"

#include <gtest/gtest.h>

#include <limits>
#include <stdexcept>
#include <vector>
#include <cmath>

using quantpulse::domain::portfolio::PortfolioEngine;

// ============================================================
// * Portfolio Return
// ============================================================

TEST(PortfolioEngineTest, CalculatesWeightedPortfolioReturn)
{
    const std::vector<double> returns{
        0.10,
        0.05};

    const std::vector<double> weights{
        0.60,
        0.40};

    EXPECT_NEAR(
        PortfolioEngine::portfolioReturn(
            returns,
            weights),
        0.08,
        1e-12);
}

TEST(PortfolioEngineTest, CalculatesNegativePortfolioReturn)
{
    const std::vector<double> returns{
        -0.10,
        -0.05};

    const std::vector<double> weights{
        0.60,
        0.40};

    EXPECT_NEAR(
        PortfolioEngine::portfolioReturn(
            returns,
            weights),
        -0.08,
        1e-12);
}

TEST(PortfolioEngineTest, CalculatesSingleAssetPortfolioReturn)
{
    const std::vector<double> returns{
        0.12};

    const std::vector<double> weights{
        1.0};

    EXPECT_NEAR(
        PortfolioEngine::portfolioReturn(
            returns,
            weights),
        0.12,
        1e-12);
}

// ============================================================
// * Portfolio Variance
// ============================================================

TEST(PortfolioEngineTest, CalculatesSingleAssetPortfolioVariance)
{
    const std::vector<double> weights{
        1.0};

    const std::vector<std::vector<double>> covarianceMatrix{
        {0.04}};

    EXPECT_NEAR(
        PortfolioEngine::portfolioVariance(
            weights,
            covarianceMatrix),
        0.04,
        1e-12);
}

TEST(PortfolioEngineTest, CalculatesTwoAssetPortfolioVariance)
{
    const std::vector<double> weights{
        0.60,
        0.40};

    const std::vector<std::vector<double>> covarianceMatrix{
        {0.04, 0.01},
        {0.01, 0.09}};

    const double expected =
        (0.60 * 0.60 * 0.04) +
        (0.40 * 0.40 * 0.09) +
        (2.0 * 0.60 * 0.40 * 0.01);

    EXPECT_NEAR(
        PortfolioEngine::portfolioVariance(
            weights,
            covarianceMatrix),
        expected,
        1e-12);
}

TEST(PortfolioEngineTest, CalculatesPortfolioVarianceWithZeroCovariance)
{
    const std::vector<double> weights{
        0.50,
        0.50};

    const std::vector<std::vector<double>> covarianceMatrix{
        {0.04, 0.0},
        {0.0, 0.09}};

    const double expected =
        (0.50 * 0.50 * 0.04) +
        (0.50 * 0.50 * 0.09);

    EXPECT_NEAR(
        PortfolioEngine::portfolioVariance(
            weights,
            covarianceMatrix),
        expected,
        1e-12);
}

// ============================================================
// * Portfolio Volatility
// ============================================================

TEST(PortfolioEngineTest, CalculatesPortfolioVolatility)
{
    const std::vector<double> weights{
        0.60,
        0.40};

    const std::vector<std::vector<double>> covarianceMatrix{
        {0.04, 0.01},
        {0.01, 0.09}};

    const double variance =
        (0.60 * 0.60 * 0.04) +
        (0.40 * 0.40 * 0.09) +
        (2.0 * 0.60 * 0.40 * 0.01);

    EXPECT_NEAR(
        PortfolioEngine::portfolioVolatility(
            weights,
            covarianceMatrix),
        std::sqrt(variance),
        1e-12);
}

TEST(PortfolioEngineTest, CalculatesZeroPortfolioVolatility)
{
    const std::vector<double> weights{
        1.0,
        0.0};

    const std::vector<std::vector<double>> covarianceMatrix{
        {0.0, 0.0},
        {0.0, 0.04}};

    EXPECT_DOUBLE_EQ(
        PortfolioEngine::portfolioVolatility(
            weights,
            covarianceMatrix),
        0.0);
}

// ============================================================
// * Validation
// ============================================================

TEST(PortfolioEngineTest, ThrowsForEmptyReturns)
{
    const std::vector<double> returns;
    const std::vector<double> weights;

    EXPECT_THROW(
        PortfolioEngine::portfolioReturn(
            returns,
            weights),
        std::invalid_argument);
}

TEST(PortfolioEngineTest, ThrowsForEmptyWeights)
{
    const std::vector<double> returns{
        0.10,
        0.05};

    const std::vector<double> weights;

    EXPECT_THROW(
        PortfolioEngine::portfolioReturn(
            returns,
            weights),
        std::invalid_argument);
}

TEST(PortfolioEngineTest, ThrowsForDifferentReturnAndWeightSizes)
{
    const std::vector<double> returns{
        0.10,
        0.05};

    const std::vector<double> weights{
        1.0};

    EXPECT_THROW(
        PortfolioEngine::portfolioReturn(
            returns,
            weights),
        std::invalid_argument);
}

TEST(PortfolioEngineTest, ThrowsForNaNReturn)
{
    const std::vector<double> returns{
        0.10,
        std::numeric_limits<double>::quiet_NaN()};

    const std::vector<double> weights{
        0.50,
        0.50};

    EXPECT_THROW(
        PortfolioEngine::portfolioReturn(
            returns,
            weights),
        std::invalid_argument);
}

TEST(PortfolioEngineTest, ThrowsForInfiniteWeight)
{
    const std::vector<double> returns{
        0.10,
        0.05};

    const std::vector<double> weights{
        0.50,
        std::numeric_limits<double>::infinity()};

    EXPECT_THROW(
        PortfolioEngine::portfolioReturn(
            returns,
            weights),
        std::invalid_argument);
}

TEST(PortfolioEngineTest, ThrowsForEmptyCovarianceMatrix)
{
    const std::vector<double> weights{
        0.50,
        0.50};

    const std::vector<std::vector<double>> covarianceMatrix;

    EXPECT_THROW(
        PortfolioEngine::portfolioVariance(
            weights,
            covarianceMatrix),
        std::invalid_argument);
}

TEST(PortfolioEngineTest, ThrowsForNonSquareCovarianceMatrix)
{
    const std::vector<double> weights{
        0.50,
        0.50};

    const std::vector<std::vector<double>> covarianceMatrix{
        {0.04, 0.01},
        {0.01}};

    EXPECT_THROW(
        PortfolioEngine::portfolioVariance(
            weights,
            covarianceMatrix),
        std::invalid_argument);
}

TEST(PortfolioEngineTest, ThrowsForCovarianceMatrixDimensionMismatch)
{
    const std::vector<double> weights{
        0.50,
        0.50};

    const std::vector<std::vector<double>> covarianceMatrix{
        {0.04, 0.01, 0.00},
        {0.01, 0.09, 0.00},
        {0.00, 0.00, 0.01}};

    EXPECT_THROW(
        PortfolioEngine::portfolioVariance(
            weights,
            covarianceMatrix),
        std::invalid_argument);
}

TEST(PortfolioEngineTest, ThrowsForNaNCovariance)
{
    const std::vector<double> weights{
        0.50,
        0.50};

    const std::vector<std::vector<double>> covarianceMatrix{
        {0.04, 0.01},
        {0.01, std::numeric_limits<double>::quiet_NaN()}};

    EXPECT_THROW(
        PortfolioEngine::portfolioVariance(
            weights,
            covarianceMatrix),
        std::invalid_argument);
}