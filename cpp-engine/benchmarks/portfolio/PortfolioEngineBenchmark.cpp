#include "quantpulse/domain/portfolio/PortfolioEngine.hpp"

#include <benchmark/benchmark.h>

#include <cstddef>
#include <cstdint>
#include <vector>

using quantpulse::domain::portfolio::PortfolioEngine;

namespace
{

    std::vector<double> generateReturns(
        std::size_t size)
    {
        std::vector<double> returns(size);

        for (std::size_t i = 0; i < size; ++i)
        {
            returns[i] =
                0.001 +
                static_cast<double>(i % 100) * 0.00001;
        }

        return returns;
    }

    std::vector<double> generateWeights(
        std::size_t size)
    {
        std::vector<double> weights(size);

        const double weight =
            1.0 / static_cast<double>(size);

        for (double &value : weights)
        {
            value = weight;
        }

        return weights;
    }

    std::vector<std::vector<double>> generateCovarianceMatrix(
        std::size_t size)
    {
        std::vector<std::vector<double>> matrix(
            size,
            std::vector<double>(size, 0.0));

        for (std::size_t i = 0; i < size; ++i)
        {
            matrix[i][i] = 0.04;
        }

        return matrix;
    }

} // namespace

static void BM_PORTFOLIO_RETURN(
    benchmark::State &state)
{
    const std::size_t size =
        static_cast<std::size_t>(state.range(0));

    const auto returns =
        generateReturns(size);

    const auto weights =
        generateWeights(size);

    for (auto _ : state)
    {
        const double result =
            PortfolioEngine::portfolioReturn(
                returns,
                weights);

        benchmark::DoNotOptimize(result);
    }

    state.SetItemsProcessed(
        static_cast<int64_t>(state.iterations()) *
        static_cast<int64_t>(size));
}

static void BM_PORTFOLIO_VARIANCE(
    benchmark::State &state)
{
    const std::size_t size =
        static_cast<std::size_t>(state.range(0));

    const auto weights =
        generateWeights(size);

    const auto covarianceMatrix =
        generateCovarianceMatrix(size);

    for (auto _ : state)
    {
        const double result =
            PortfolioEngine::portfolioVariance(
                weights,
                covarianceMatrix);

        benchmark::DoNotOptimize(result);
    }

    state.SetItemsProcessed(
        static_cast<int64_t>(state.iterations()) *
        static_cast<int64_t>(size));
}

static void BM_PORTFOLIO_VOLATILITY(
    benchmark::State &state)
{
    const std::size_t size =
        static_cast<std::size_t>(state.range(0));

    const auto weights =
        generateWeights(size);

    const auto covarianceMatrix =
        generateCovarianceMatrix(size);

    for (auto _ : state)
    {
        const double result =
            PortfolioEngine::portfolioVolatility(
                weights,
                covarianceMatrix);

        benchmark::DoNotOptimize(result);
    }

    state.SetItemsProcessed(
        static_cast<int64_t>(state.iterations()) *
        static_cast<int64_t>(size));
}

BENCHMARK(BM_PORTFOLIO_RETURN)
    ->RangeMultiplier(10)
    ->Range(1000, 1000000);

BENCHMARK(BM_PORTFOLIO_VARIANCE)
    ->RangeMultiplier(10)
    ->Range(10, 1000);

BENCHMARK(BM_PORTFOLIO_VOLATILITY)
    ->RangeMultiplier(10)
    ->Range(10, 1000);
