#pragma once

#include <vector>

namespace quantpulse::domain::risk
{

    class RiskEngine
    {
    public:
        /**
         * @brief Calculate the Sharpe ratio of a return series.
         *
         * @param returns Return observations.
         * @param riskFreeRate Risk-free return per observation period.
         *
         * @return Sharpe ratio.
         *
         * @throw std::invalid_argument if the return series is invalid
         *        or has zero standard deviation.
         */
        [[nodiscard]]
        static double sharpeRatio(
            const std::vector<double> &returns,
            double riskFreeRate);

        /**
         * @brief Calculate the maximum drawdown of a return series.
         *
         * @param returns Return observations.
         *
         * @return Maximum drawdown expressed as a negative decimal value.
         *
         * @throw std::invalid_argument if the return series is empty
         *        or contains invalid returns.
         */
        [[nodiscard]]
        static double maximumDrawdown(
            const std::vector<double> &returns);

        /**
         * @brief Calculate downside deviation relative to a target return.
         *
         * Only returns below the target contribute to downside deviation.
         *
         * @param returns Return observations.
         * @param targetReturn Target return per observation period.
         *
         * @return Downside deviation.
         *
         * @throw std::invalid_argument if the return series is empty
         *        or contains invalid values.
         */
        [[nodiscard]]
        static double downsideDeviation(
            const std::vector<double> &returns,
            double targetReturn);

        /**
         * @brief Calculate the Sortino ratio of a return series.
         *
         * The Sortino ratio measures excess return relative to downside deviation,
         * considering only returns below the specified target return.
         *
         * @param returns Return observations.
         * @param targetReturn Target return per observation period.
         *
         * @return Sortino ratio.
         *
         * @throw std::invalid_argument if the return series is invalid or
         *        if downside deviation is zero.
         */
        [[nodiscard]]
        static double sortinoRatio(
            const std::vector<double> &returns,
            double targetReturn);

        /**
         * @brief Calculate the beta of an asset relative to a benchmark.
         *
         * Beta measures the sensitivity of asset returns to movements
         * in benchmark returns.
         *
         * @param assetReturns Asset return observations.
         * @param benchmarkReturns Benchmark return observations.
         *
         * @return Beta coefficient.
         *
         * @throw std::invalid_argument if the return series are invalid,
         *        have different sizes, contain fewer than two observations,
         *        or the benchmark has zero variance.
         */
        [[nodiscard]]
        static double beta(
            const std::vector<double> &assetReturns,
            const std::vector<double> &benchmarkReturns);

        /**
         * @brief Calculate the CAPM-style alpha of an asset.
         *
         * Alpha measures the asset return that remains after accounting
         * for the risk-free rate and the asset's beta relative to a benchmark.
         *
         * @param assetReturns Asset return observations.
         * @param benchmarkReturns Benchmark return observations.
         * @param riskFreeRate Risk-free return per observation period.
         *
         * @return CAPM-style alpha.
         *
         * @throw std::invalid_argument if the return series are invalid,
         *        have different sizes, contain fewer than two observations,
         *        or the benchmark has zero variance.
         */
        [[nodiscard]]
        static double alpha(
            const std::vector<double> &assetReturns,
            const std::vector<double> &benchmarkReturns,
            double riskFreeRate);

        /**
         * @brief Calculate historical Value at Risk (VaR).
         *
         * Historical VaR estimates the loss threshold at a specified
         * confidence level using the empirical distribution of returns.
         *
         * @param returns Historical return observations.
         * @param confidenceLevel Confidence level in the interval (0, 1).
         *
         * @return VaR expressed as a positive loss magnitude.
         *
         * @throw std::invalid_argument if the return series is empty,
         *        contains non-finite values, or the confidence level
         *        is not strictly between zero and one.
         */
        [[nodiscard]]
        static double historicalVaR(
            const std::vector<double> &returns,
            double confidenceLevel);

        /**
         * @brief Calculate historical Conditional Value at Risk (CVaR).
         *
         * CVaR, also known as Expected Shortfall, measures the average
         * loss in the tail beyond the specified VaR confidence level.
         *
         * @param returns Return observations.
         * @param confidenceLevel Confidence level in the range (0, 1).
         *
         * @return Historical CVaR expressed as a non-negative loss magnitude.
         *
         * @throw std::invalid_argument if the return series is empty,
         *        contains invalid values, or the confidence level is invalid.
         */
        [[nodiscard]]
        static double historicalCVaR(
            const std::vector<double> &returns,
            double confidenceLevel);
    };
} // namespace quantpulse::domain::risk