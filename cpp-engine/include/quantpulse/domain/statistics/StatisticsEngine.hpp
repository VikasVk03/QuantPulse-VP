#pragma once

#include <vector>

namespace quantpulse::domain::statistics
{

    /**
     * @class StatisticsEngine
     * @brief Provides Statistical calculations for numerical datasets.
     *
     * StatisticsEngine contains stateless utility function for calculating
     * common descriptive statistics such as mean, median, variance and standard deviation.
     *
     * All functions operate on a collection of double-precision values.
     */

    class StatisticsEngine
    {
    public:
        /**
         * @brief Calculate the arithmetic mean of a set of values.
         *
         * The arithmetic mean is calculated by summing all values and dividing the result by the numbers of values.
         *
         * @param values  Collection of numeric values used for the calculation.
         *
         * @return The arithmetic mean of the provided values
         *
         * @throw std::invalid_argument if values is empty.
         *
         * @note The input collection is not modified.
         */
        [[nodiscard]]
        static double mean(const std::vector<double> &values);

        /**
         * @brief Calculates the median value of a set of values
         *
         * The median is the middle value after the observations are ordered.
         * For an even number of observations, the median is calculated as the average of the two middle values
         *
         * @param values Collection of numeric values used for the calculation.
         * The collection may be reordered internally.
         *
         * @return The median value fo the provided dataset.
         *
         * @throw std::invalid_argument If the collection is empty.
         *
         * @note The values parameter is passed by value, allowing the function to sort the local copy without modifying the caller's data.
         */

        [[nodiscard]]
        static double median(std::vector<double> values);

        /**
         * @brief Calculation of statistical variance of a set of values.
         *
         * Variance measures how far the values are spread from their mean.
         * The implementation uses the population variance formula:
         *
         *         Variance = Σ(x - mean)² / N
         *
         * Where N is the number of observations
         *
         * @param values Collection of numeric values used for the calculation.
         * @return The population variance of the provided values.
         *
         * @throw std::invalid_argument If the collection is empty.
         *
         * @note The input collection is not modified.
         */

        [[nodiscard]]
        static double variance(const std::vector<double> &values);

        /**
         * @brief Calculates the population standard deviation of a set of values.
         *
         * Standard deviation is the square root of the population variance and represents the typical deviation of observations from their mean.
         *
         * @param values  Collection of numeric values used for the calculation.
         *
         * @return The population standard deviation of the provided values.
         *
         * @throw std::invalid_argument If the collection is empty.
         *
         * @note The input collection is not modified.
         */
        [[nodiscard]]
        static double standardDeviation(const std::vector<double> &values);

        /**
         * @brief Calculates the sample variance of a set of values.
         *
         * Sample variance estimates the variance of a population from
         * a sample of observations.
         *
         * The implementation uses the sample variance formula:
         *
         *         Variance = Σ(x - mean)² / (N - 1)
         *
         * Where N is the number of observations.
         *
         * @param values Collection of numeric values used for the calculation.
         *
         * @return The sample variance of the provided values.
         *
         * @throw std::invalid_argument If fewer than two observations
         * are provided.
         *
         * @note The input collection is not modified.
         */
        [[nodiscard]]
        static double sampleVariance(
            const std::vector<double> &values);

        /**
         * @brief Calculates the sample standard deviation of a set of values.
         *
         * Sample standard deviation is the square root of the sample variance.
         *
         * @param values Collection of numeric values used for the calculation.
         *
         * @return The sample standard deviation of the provided values.
         *
         * @throw std::invalid_argument If fewer than two observations
         * are provided.
         *
         * @note The input collection is not modified.
         */
        [[nodiscard]]
        static double sampleStandardDeviation(
            const std::vector<double> &values);
    };
} // namespace quantpulse::domain::statistics
