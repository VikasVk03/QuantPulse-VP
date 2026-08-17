#include "quantpulse/domain/volatility/VolatilityEngine.hpp"

#include "quantpulse/domain/statistics/StatisticsEngine.hpp"

#include <cmath>
#include <stdexcept>

namespace quantpulse::domain::volatility
{

    namespace
    {

        void validateReturns(
            const std::vector<double> &returns)
        {
            if (returns.size() < 2)
            {
                throw std::invalid_argument(
                    "At least two return observations are required "
                    "to calculate historical volatility.");
            }

            for (const double value : returns)
            {
                if (!std::isfinite(value))
                {
                    throw std::invalid_argument(
                        "Return observations must be finite.");
                }
            }
        }

        void validatePeriodsPerYear(
            double periodsPerYear)
        {
            if (!std::isfinite(periodsPerYear) ||
                periodsPerYear <= 0.0)
            {
                throw std::invalid_argument(
                    "Periods per year must be finite and greater than zero.");
            }
        }

    } // namespace

    double VolatilityEngine::historicalVolatility(
        const std::vector<double> &returns,
        double periodsPerYear)
    {
        validateReturns(returns);
        validatePeriodsPerYear(periodsPerYear);

        const double sampleStandardDeviation =
            quantpulse::domain::statistics::StatisticsEngine::
                sampleStandardDeviation(returns);

        return sampleStandardDeviation *
               std::sqrt(periodsPerYear);
    }

} // namespace quantpulse::domain::volatility