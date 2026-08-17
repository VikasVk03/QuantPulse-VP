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

} // namespace quantpulse::domain::risk