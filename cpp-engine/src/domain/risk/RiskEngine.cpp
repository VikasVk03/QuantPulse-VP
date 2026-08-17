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
            static_cast<double>(n);

        const std::size_t lowerIndex =
            static_cast<std::size_t>(
                std::floor(position));

        if (position >= static_cast<double>(n))
        {
            return -sortedReturns.back();
        }

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
         * QuantPulse historical CVaR convention:
         *
         * Include the observations contained in the lower tail,
         * plus the boundary observation when the tail size is an
         * exact integer.
         *
         * Examples:
         *
         * tailSize = 1.0 -> tailCount = 2
         * tailSize = 1.5 -> tailCount = 2
         * tailSize = 2.0 -> tailCount = 3
         */
        const std::size_t tailCount =
            static_cast<std::size_t>(
                std::floor(tailSize)) +
            1;

        double lossSum = 0.0;
        std::size_t lossCount = 0;

        for (std::size_t i = 0;
             i < tailCount && i < n;
             ++i)
        {
            const double loss =
                -sortedReturns[i];

            if (loss > 0.0)
            {
                lossSum += loss;
                ++lossCount;
            }
        }

        if (lossCount == 0)
        {
            return 0.0;
        }

        return lossSum /
               static_cast<double>(lossCount);
    }

} // namespace quantpulse::domain::risk