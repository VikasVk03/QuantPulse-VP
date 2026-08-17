#pragma once

#include <vector>

namespace quantpulse::domain::volatility
{

    /**
     * @class VolatilityEngine
     * @brief Provides financial volatility calculations.
     *
     * VolatilityEngine contains stateless calculations related to
     * historical and realized market volatility.
     */
    class VolatilityEngine
    {
    public:
        /**
         * @brief Calculate annualized historical volatility.
         *
         * Historical volatility is calculated as the sample standard
         * deviation of the supplied return observations, annualized
         * using the supplied number of observation periods per year.
         *
         * Formula:
         *
         *     σ_annualized = σ_sample * sqrt(periodsPerYear)
         *
         * @param returns Collection of return observations.
         * @param periodsPerYear Number of observation periods per year.
         *
         * @return Annualized historical volatility as a decimal.
         *
         * @throw std::invalid_argument if fewer than two returns are
         * provided or periodsPerYear is not positive.
         *
         * @note All return observations must be finite.
         */
        [[nodiscard]]
        static double historicalVolatility(
            const std::vector<double> &returns,
            double periodsPerYear);
    };

} // namespace quantpulse::domain::volatility