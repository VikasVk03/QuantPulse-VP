#include "quantpulse/domain/statistics/StatisticsEngine.hpp"

#include <algorithm>
#include <cmath>
#include <numeric>
#include <stdexcept>

namespace quantpulse::domain::statistics
{
    double StatisticsEngine::mean(const std::vector<double> &values)
    {
        if (values.empty())
        {
            throw std::invalid_argument("Cannot calculate mean of an empty dataset.");
        }

        const double sum = std::accumulate(
            values.begin(),
            values.end(),
            0.0);

        return sum / static_cast<double>(values.size());
    }

    double StatisticsEngine::median(std::vector<double> values)
    {
        if (values.empty())
        {
            throw std::invalid_argument("Cannot calculate median of an empty dataset");
        }

        std::sort(values.begin(), values.end());

        const std::size_t middle = values.size() / 2;

        if (values.size() % 2 == 0)
        {
            return (values[middle - 1] + values[middle]) / 2.0;
        }

        return values[middle];
    }

    double StatisticsEngine::variance(const std::vector<double> &values)
    {
        if (values.empty())
        {
            throw std::invalid_argument("Cannot calculate variance of an empty dataset");
        }

        const double average = mean(values);

        double squaredDifferenceSum = 0.0;

        for (const double value : values)
        {
            const double difference = value - average;
            squaredDifferenceSum += difference * difference;
        }

        return squaredDifferenceSum / static_cast<double>(values.size());
    }

    double StatisticsEngine::standardDeviation(const std::vector<double> &values)
    {
        return std::sqrt(variance(values));
    }
}
