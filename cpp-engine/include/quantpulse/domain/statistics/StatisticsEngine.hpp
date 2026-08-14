#pragma once

#include <vector>

namespace quantpulse::domain::statistics
{

    class StatisticsEngine
    {
    public:
        [[nodiscard]]
        static double mean(const std::vector<double> &values);

        [[nodiscard]]
        static double median(std::vector<double> values);

        [[nodiscard]]
        static double variance(const std::vector<double> &values);

        [[nodiscard]]
        static double standardDeviation(const std::vector<double> &values);
    };
} // namespace quantpulse::domain::statistics
