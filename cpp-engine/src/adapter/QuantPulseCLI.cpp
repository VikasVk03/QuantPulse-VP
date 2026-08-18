#include "quantpulse/domain/risk/RiskEngine.hpp"

#include <iostream>
#include <vector>

int main()
{
    using quantpulse::domain::risk::RiskEngine;

    std::vector<double> returns;

    double value;

    while (std::cin >> value)
    {
        returns.push_back(value);
    }

    if (returns.empty())
    {
        std::cerr << "No return observations provided.\n";
        return 1;
    }

    const double result =
        RiskEngine::sharpeRatio(
            returns,
            0.002);

    std::cout << result << '\n';

    return 0;
}