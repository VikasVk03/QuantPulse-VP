#include "quantpulse/domain/returns/ReturnsEngine.hpp"

#include <cmath>
#include <stdexcept>

namespace quantpulse::domain::returns
{

    namespace
    {

        void validatePrice(double price)
        {
            if (!std::isfinite(price) || price <= 0.0)
            {
                throw std::invalid_argument(
                    "Price must be greater than zero.");
            }
        }

        void validatePriceSeriesSize(const std::vector<double> &prices)
        {
            if (prices.size() < 2)
            {
                throw std::invalid_argument(
                    "At least two prices are required to calculate returns.");
            }
        }

    } // namespace

    double ReturnsEngine::simpleReturn(
        double previousPrice,
        double currentPrice)
    {
        validatePrice(previousPrice);
        validatePrice(currentPrice);

        return (currentPrice / previousPrice) - 1.0;
    }

    double ReturnsEngine::logReturn(
        double previousPrice,
        double currentPrice)
    {
        validatePrice(previousPrice);
        validatePrice(currentPrice);

        return std::log(currentPrice / previousPrice);
    }

    std::vector<double> ReturnsEngine::simpleReturns(
        const std::vector<double> &prices)
    {
        validatePriceSeriesSize(prices);

        std::vector<double> returns;
        returns.reserve(prices.size() - 1);

        for (std::size_t i = 1; i < prices.size(); ++i)
        {
            returns.push_back(
                simpleReturn(prices[i - 1], prices[i]));
        }

        return returns;
    }

    std::vector<double> ReturnsEngine::logReturns(
        const std::vector<double> &prices)
    {
        validatePriceSeriesSize(prices);

        std::vector<double> returns;
        returns.reserve(prices.size() - 1);

        for (std::size_t i = 1; i < prices.size(); ++i)
        {
            returns.push_back(
                logReturn(prices[i - 1], prices[i]));
        }

        return returns;
    }

    double ReturnsEngine::cumulativeReturn(
        const std::vector<double> &returns)
    {
        if (returns.empty())
        {
            throw std::invalid_argument(
                "At least one return is required.");
        }

        double growthFactor = 1.0;

        for (const double value : returns)
        {
            if (!std::isfinite(value) || value < -1.0)
            {
                throw std::invalid_argument(
                    "Returns must be finite and greater than or equal to -1.");
            }

            growthFactor *= (1.0 + value);
        }

        return growthFactor - 1.0;
    }

} // namespace quantpulse::domain::returns