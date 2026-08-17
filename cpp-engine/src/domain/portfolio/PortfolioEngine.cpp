#include "quantpulse/domain/portfolio/PortfolioEngine.hpp"

#include <cmath>
#include <stdexcept>

namespace quantpulse::domain::portfolio
{

    namespace
    {

        void validateFiniteValues(
            const std::vector<double> &values,
            const char *message)
        {
            for (const double value : values)
            {
                if (!std::isfinite(value))
                {
                    throw std::invalid_argument(message);
                }
            }
        }

        void validateWeights(
            const std::vector<double> &weights)
        {
            if (weights.empty())
            {
                throw std::invalid_argument(
                    "Portfolio weights cannot be empty.");
            }

            validateFiniteValues(
                weights,
                "Portfolio weights must be finite.");
        }

        void validateReturns(
            const std::vector<double> &returns)
        {
            if (returns.empty())
            {
                throw std::invalid_argument(
                    "Portfolio returns cannot be empty.");
            }

            validateFiniteValues(
                returns,
                "Portfolio returns must be finite.");
        }

        void validateCovarianceMatrix(
            const std::vector<double> &weights,
            const std::vector<std::vector<double>> &covarianceMatrix)
        {
            validateWeights(weights);

            const std::size_t dimension = weights.size();

            if (covarianceMatrix.size() != dimension)
            {
                throw std::invalid_argument(
                    "Covariance matrix dimension must match "
                    "the number of portfolio weights.");
            }

            for (const auto &row : covarianceMatrix)
            {
                if (row.size() != dimension)
                {
                    throw std::invalid_argument(
                        "Covariance matrix must be square.");
                }

                validateFiniteValues(
                    row,
                    "Covariance matrix values must be finite.");
            }
        }

    } // namespace

    double PortfolioEngine::portfolioReturn(
        const std::vector<double> &returns,
        const std::vector<double> &weights)
    {
        validateReturns(returns);
        validateWeights(weights);

        if (returns.size() != weights.size())
        {
            throw std::invalid_argument(
                "Returns and weights must have the same size.");
        }

        double result = 0.0;

        for (std::size_t i = 0; i < returns.size(); ++i)
        {
            result += weights[i] * returns[i];
        }

        return result;
    }

    double PortfolioEngine::portfolioVariance(
        const std::vector<double> &weights,
        const std::vector<std::vector<double>> &covarianceMatrix)
    {
        validateCovarianceMatrix(
            weights,
            covarianceMatrix);

        const std::size_t dimension = weights.size();

        double variance = 0.0;

        for (std::size_t i = 0; i < dimension; ++i)
        {
            for (std::size_t j = 0; j < dimension; ++j)
            {
                variance +=
                    weights[i] *
                    covarianceMatrix[i][j] *
                    weights[j];
            }
        }

        if (variance < 0.0)
        {
            throw std::invalid_argument(
                "Portfolio variance cannot be negative.");
        }

        return variance;
    }

    double PortfolioEngine::portfolioVolatility(
        const std::vector<double> &weights,
        const std::vector<std::vector<double>> &covarianceMatrix)
    {
        return std::sqrt(
            portfolioVariance(
                weights,
                covarianceMatrix));
    }

} // namespace quantpulse::domain::portfolio