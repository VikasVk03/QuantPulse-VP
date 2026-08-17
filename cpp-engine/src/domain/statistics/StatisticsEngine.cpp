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

    double StatisticsEngine::sampleVariance(
        const std::vector<double> &values)
    {
        if (values.size() < 2)
        {
            throw std::invalid_argument(
                "At least two observations are required to calculate sample variance.");
        }

        const double average = mean(values);

        double squaredDifferenceSum = 0.0;

        for (const double value : values)
        {
            const double difference = value - average;
            squaredDifferenceSum += difference * difference;
        }

        return squaredDifferenceSum /
               static_cast<double>(values.size() - 1);
    }

    double StatisticsEngine::sampleStandardDeviation(
        const std::vector<double> &values)
    {
        return std::sqrt(sampleVariance(values));
    }

    double StatisticsEngine::covariance(
        const std::vector<double> &x,
        const std::vector<double> &y)
    {
        if (x.size() < 2 || y.size() < 2)
        {
            throw std::invalid_argument(
                "At least two observations are required.");
        }

        if (x.size() != y.size())
        {
            throw std::invalid_argument(
                "Datasets must have the same size.");
        }

        const double meanX = mean(x);
        const double meanY = mean(y);

        double covarianceSum = 0.0;

        for (std::size_t i = 0; i < x.size(); ++i)
        {
            covarianceSum +=
                (x[i] - meanX) *
                (y[i] - meanY);
        }

        return covarianceSum /
               static_cast<double>(x.size() - 1);
    }

    double StatisticsEngine::correlation(
        const std::vector<double> &x,
        const std::vector<double> &y)
    {

        if (x.size() != y.size())
        {
            throw std::invalid_argument(
                "Datasets must have the same size.");
        }

        if (x.size() < 2)
        {
            throw std::invalid_argument(
                "At least two observations are required to calculate correlation.");
        }

        const double standardDeviationX =
            sampleStandardDeviation(x);

        const double standardDeviationY =
            sampleStandardDeviation(y);

        if (standardDeviationX == 0.0 ||
            standardDeviationY == 0.0)
        {
            throw std::invalid_argument(
                "Correlation is undefined for zero-variance data.");
        }

        return covariance(x, y) /
               (standardDeviationX * standardDeviationY);
    }
}
