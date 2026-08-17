#pragma once

#include <vector>

namespace quantpulse::domain::portfolio
{

    class PortfolioEngine
    {
    public:
        /**
         * @brief Calculate the weighted portfolio return.
         *
         * @param returns Asset returns.
         * @param weights Portfolio weights corresponding to each asset.
         *
         * @return Weighted portfolio return.
         *
         * @throw std::invalid_argument if inputs are invalid.
         */
        [[nodiscard]]
        static double portfolioReturn(
            const std::vector<double> &returns,
            const std::vector<double> &weights);

        /**
         * @brief Calculate portfolio variance using a covariance matrix.
         *
         * Portfolio variance is:
         *
         *     w^T * Sigma * w
         *
         * @param weights Portfolio weights.
         * @param covarianceMatrix Asset covariance matrix.
         *
         * @return Portfolio variance.
         *
         * @throw std::invalid_argument if dimensions are invalid.
         */
        [[nodiscard]]
        static double portfolioVariance(
            const std::vector<double> &weights,
            const std::vector<std::vector<double>> &covarianceMatrix);

        /**
         * @brief Calculate portfolio volatility.
         *
         * Portfolio volatility is the square root of portfolio variance.
         */
        [[nodiscard]]
        static double portfolioVolatility(
            const std::vector<double> &weights,
            const std::vector<std::vector<double>> &covarianceMatrix);
    };

} // namespace quantpulse::domain::portfolio