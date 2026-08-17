#pragma once

#include <vector>

namespace quantpulse::domain::returns
{

    class ReturnsEngine
    {
    public:
        /**
         * @brief Calculate the simple return between two prices.
         *
         * @param previousPrice Price at the beginning of the period.
         * @param currentPrice Price at the end of the period.
         *
         * @return Simple return:
         *         (currentPrice / previousPrice) - 1.
         *
         * @throws std::invalid_argument if either price is non-positive
         *         or non-finite.
         */

        [[nodiscard]]
        static double simpleReturn(
            double previousPrice,
            double currentPrice);

        [[nodiscard]]
        static double logReturn(
            double previousPrice,
            double currentPrice);

        [[nodiscard]]
        static std::vector<double> simpleReturns(
            const std::vector<double> &prices);

        [[nodiscard]]
        static std::vector<double> logReturns(
            const std::vector<double> &prices);

        [[nodiscard]]
        static double cumulativeReturn(
            const std::vector<double> &returns);
    };
} // namespace quantpulse::domain::returns
