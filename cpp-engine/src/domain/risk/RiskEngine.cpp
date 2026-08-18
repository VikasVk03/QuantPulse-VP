#include "quantpulse/domain/risk/RiskEngine.hpp"

#include "quantpulse/domain/statistics/StatisticsEngine.hpp"

#include <algorithm>
#include <cmath>
#include <stdexcept>
#include <string>

namespace quantpulse::domain::risk
{

    namespace
    {

        void validateReturns(
            const std::vector<double> &returns)
        {
            if (returns.empty())
            {
                throw std::invalid_argument(
                    "At least one return observation is required.");
            }

            for (const double value : returns)
            {
                if (!std::isfinite(value))
                {
                    throw std::invalid_argument(
                        "Return observations must be finite.");
                }

                if (value <= -1.0)
                {
                    throw std::invalid_argument(
                        "Return observations must be greater than -100%.");
                }
            }
        }

        void validateConfidenceLevel(
            double confidenceLevel)
        {
            if (!std::isfinite(confidenceLevel) ||
                confidenceLevel <= 0.0 ||
                confidenceLevel >= 1.0)
            {
                throw std::invalid_argument(
                    "Confidence level must be finite and strictly between zero and one.");
            }
        }

        void validateFinite(
            double value,
            const char *name)
        {
            if (!std::isfinite(value))
            {
                throw std::invalid_argument(
                    std::string(name) + " must be finite.");
            }
        }

    } // namespace

    double RiskEngine::sharpeRatio(
        const std::vector<double> &returns,
        double riskFreeRate)
    {
        validateReturns(returns);
        validateFinite(riskFreeRate, "Risk-free rate");

        if (returns.size() < 2)
        {
            throw std::invalid_argument(
                "At least two return observations are required "
                "to calculate the Sharpe ratio.");
        }

        const double excessMean =
            quantpulse::domain::statistics::StatisticsEngine::mean(
                returns) -
            riskFreeRate;

        const double standardDeviation =
            quantpulse::domain::statistics::StatisticsEngine::
                sampleStandardDeviation(returns);

        if (standardDeviation == 0.0)
        {
            throw std::invalid_argument(
                "Sharpe ratio is undefined for zero volatility.");
        }

        return excessMean / standardDeviation;
    }

    double RiskEngine::maximumDrawdown(
        const std::vector<double> &returns)
    {
        validateReturns(returns);

        double wealth = 1.0;
        double peak = 1.0;
        double maximumDrawdown = 0.0;

        for (const double value : returns)
        {
            wealth *= (1.0 + value);

            if (wealth > peak)
            {
                peak = wealth;
            }

            const double drawdown =
                (wealth / peak) - 1.0;

            if (drawdown < maximumDrawdown)
            {
                maximumDrawdown = drawdown;
            }
        }

        return maximumDrawdown;
    }

    double RiskEngine::downsideDeviation(
        const std::vector<double> &returns,
        double targetReturn)
    {
        validateReturns(returns);
        validateFinite(targetReturn, "Target return");

        double squaredDownsideSum = 0.0;

        for (const double value : returns)
        {
            const double downside =
                std::min(value - targetReturn, 0.0);

            squaredDownsideSum += downside * downside;
        }

        return std::sqrt(
            squaredDownsideSum /
            static_cast<double>(returns.size()));
    }

    double RiskEngine::sortinoRatio(
        const std::vector<double> &returns,
        double targetReturn)
    {
        validateReturns(returns);

        const double averageReturn =
            quantpulse::domain::statistics::StatisticsEngine::mean(
                returns);

        const double downside =
            downsideDeviation(
                returns,
                targetReturn);

        if (downside == 0.0)
        {
            throw std::invalid_argument(
                "Cannot calculate Sortino ratio with zero downside deviation.");
        }

        return (averageReturn - targetReturn) / downside;
    }

    double RiskEngine::beta(
        const std::vector<double> &assetReturns,
        const std::vector<double> &benchmarkReturns)
    {
        validateReturns(assetReturns);
        validateReturns(benchmarkReturns);

        if (assetReturns.size() != benchmarkReturns.size())
        {
            throw std::invalid_argument(
                "Asset and benchmark return series must have the same size.");
        }

        const double assetMean =
            quantpulse::domain::statistics::StatisticsEngine::
                mean(assetReturns);

        const double benchmarkMean =
            quantpulse::domain::statistics::StatisticsEngine::
                mean(benchmarkReturns);

        double covarianceNumerator = 0.0;
        double benchmarkVarianceNumerator = 0.0;

        for (std::size_t i = 0; i < assetReturns.size(); ++i)
        {
            const double assetDeviation =
                assetReturns[i] - assetMean;

            const double benchmarkDeviation =
                benchmarkReturns[i] - benchmarkMean;

            covarianceNumerator +=
                assetDeviation * benchmarkDeviation;

            benchmarkVarianceNumerator +=
                benchmarkDeviation * benchmarkDeviation;
        }

        if (benchmarkVarianceNumerator == 0.0)
        {
            throw std::invalid_argument(
                "Cannot calculate beta with zero benchmark variance.");
        }

        return covarianceNumerator /
               benchmarkVarianceNumerator;
    }

    double RiskEngine::alpha(
        const std::vector<double> &assetReturns,
        const std::vector<double> &benchmarkReturns,
        double riskFreeRate)
    {
        validateReturns(assetReturns);
        validateReturns(benchmarkReturns);

        if (assetReturns.size() != benchmarkReturns.size())
        {
            throw std::invalid_argument(
                "Asset and benchmark return series must have the same size.");
        }

        if (!std::isfinite(riskFreeRate))
        {
            throw std::invalid_argument(
                "Risk-free rate must be finite.");
        }

        const double assetMean =
            quantpulse::domain::statistics::StatisticsEngine::
                mean(assetReturns);

        const double benchmarkMean =
            quantpulse::domain::statistics::StatisticsEngine::
                mean(benchmarkReturns);

        const double assetBeta =
            beta(assetReturns, benchmarkReturns);

        return assetMean -
               (riskFreeRate +
                assetBeta *
                    (benchmarkMean - riskFreeRate));
    }

    double RiskEngine::historicalVaR(
        const std::vector<double> &returns,
        double confidenceLevel)
    {
        validateReturns(returns);
        validateConfidenceLevel(confidenceLevel);

        std::vector<double> sortedReturns = returns;

        std::sort(
            sortedReturns.begin(),
            sortedReturns.end());

        const std::size_t n =
            sortedReturns.size();

        const double tailProbability =
            1.0 - confidenceLevel;

        const double position =
            tailProbability *
            static_cast<double>(n - 1);

        const std::size_t lowerIndex =
            static_cast<std::size_t>(
                std::floor(position));

        const std::size_t upperIndex =
            static_cast<std::size_t>(
                std::ceil(position));

        const double lowerValue =
            sortedReturns[lowerIndex];

        const double upperValue =
            sortedReturns[upperIndex];

        const double quantile =
            lowerValue +
            (position -
             static_cast<double>(lowerIndex)) *
                (upperValue - lowerValue);

        return -quantile;
    }

    double RiskEngine::historicalCVaR(
        const std::vector<double> &returns,
        double confidenceLevel)
    {
        validateReturns(returns);
        validateConfidenceLevel(confidenceLevel);

        std::vector<double> sortedReturns = returns;

        std::sort(
            sortedReturns.begin(),
            sortedReturns.end());

        const std::size_t n =
            sortedReturns.size();

        const double tailSize =
            (1.0 - confidenceLevel) *
            static_cast<double>(n);

        if (tailSize <= 0.0)
        {
            throw std::invalid_argument(
                "Confidence level produces an empty tail.");
        }

        /*
         * Historical CVaR / Expected Shortfall:
         *
         * Calculate the average loss over the worst
         * (1 - confidenceLevel) fraction of observations.
         *
         * A fractional boundary observation is partially
         * included when the tail does not contain an integer
         * number of observations.
         *
         * Example:
         *
         * returns = {-0.10, -0.08, -0.05, ...}
         * confidence = 0.75
         * n = 6
         *
         * tailSize = 1.5
         *
         * Include:
         *   1.0 × 0.10
         *   0.5 × 0.08
         *
         * CVaR = (0.10 + 0.04) / 1.5
         *      = 0.093333...
         */

        double weightedLossSum = 0.0;
        double remainingTail = tailSize;

        for (std::size_t i = 0;
             i < n && remainingTail > 0.0;
             ++i)
        {
            const double weight =
                std::min(
                    1.0,
                    remainingTail);

            const double loss =
                -sortedReturns[i];

            if (loss > 0.0)
            {
                weightedLossSum +=
                    weight * loss;
            }

            remainingTail -= weight;
        }

        return weightedLossSum / tailSize;
    }

} // namespace quantpulse::domain::risk