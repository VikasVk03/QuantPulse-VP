#include "quantpulse/domain/statistics/StatisticsEngine.hpp"

#include <iostream>
#include <vector>

int main()
{
    const std::vector<double> prices{
        100.00,
        102.0,
        101.0,
        105.0,
        103.0};

    using quantpulse::domain::statistics::StatisticsEngine;

    std::cout << "Mean: "
              << StatisticsEngine::mean(prices) << "\n";

    std::cout << "Median: "
              << StatisticsEngine::median(prices) << "\n";

    std::cout << "Variance: "
              << StatisticsEngine::variance(prices) << "\n";

    std::cout << "Std Deviation: "
              << StatisticsEngine::standardDeviation(prices) << "\n";

    return 0;
}