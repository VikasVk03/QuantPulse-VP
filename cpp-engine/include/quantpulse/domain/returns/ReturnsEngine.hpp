#pragma once

#include <vector>

namespace quantpulse::domain::returns
{

    class ReturnsEngine
    {
    public:
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
