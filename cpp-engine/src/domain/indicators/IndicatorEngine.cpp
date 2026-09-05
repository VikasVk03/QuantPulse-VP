#include "quantpulse/domain/indicators/IndicatorEngine.hpp"

#include <cmath>
#include <stdexcept>
#include <string>

namespace quantpulse::domain::indicators
{
    namespace
    {
        void validatePrices(
            const std::vector<double> &prices,
            std::size_t period)
        {
            if (prices.empty())
            {
                throw std::invalid_argument(
                    "Price data must not be empty.");
            }

            if (period == 0)
            {
                throw std::invalid_argument(
                    "Period must be greater than zero.");
            }

            if (prices.size() < period)
            {
                throw std::invalid_argument(
                    "Insufficient price data for requested period.");
            }

            for (const double price : prices)
            {
                if (!std::isfinite(price))
                {
                    throw std::invalid_argument(
                        "Price data must contain only finite values.");
                }
            }
        }
    }

    double IndicatorEngine::simpleMovingAverage(
        const std::vector<double> &prices,
        std::size_t period)
    {
        validatePrices(prices, period);

        double sum = 0.0;

        const std::size_t start =
            prices.size() - period;

        for (std::size_t i = start; i < prices.size(); ++i)
        {
            sum += prices[i];
        }

        return sum / static_cast<double>(period);
    }

    double IndicatorEngine::exponentialMovingAverage(
        const std::vector<double> &prices,
        std::size_t period)
    {
        validatePrices(prices, period);

        const double smoothing =
            2.0 / static_cast<double>(period + 1);

        double ema = prices[0];

        for (std::size_t i = 1; i < prices.size(); ++i)
        {
            ema =
                (prices[i] * smoothing) +
                (ema * (1.0 - smoothing));
        }

        return ema;
    }

    double IndicatorEngine::relativeStrengthIndex(
        const std::vector<double> &prices,
        std::size_t period)
    {
        validatePrices(prices, period);

        if (prices.size() <= period)
        {
            throw std::invalid_argument(
                "RSI requires more observations than the period.");
        }

        double gains = 0.0;
        double losses = 0.0;

        for (std::size_t i = 1; i <= period; ++i)
        {
            const double change =
                prices[i] - prices[i - 1];

            if (change > 0.0)
            {
                gains += change;
            }
            else
            {
                losses -= change;
            }
        }

        double averageGain =
            gains / static_cast<double>(period);

        double averageLoss =
            losses / static_cast<double>(period);

        for (std::size_t i = period + 1;
             i < prices.size();
             ++i)
        {
            const double change =
                prices[i] - prices[i - 1];

            const double gain =
                change > 0.0 ? change : 0.0;

            const double loss =
                change < 0.0 ? -change : 0.0;

            averageGain =
                ((averageGain *
                  static_cast<double>(period - 1)) +
                 gain) /
                static_cast<double>(period);

            averageLoss =
                ((averageLoss *
                  static_cast<double>(period - 1)) +
                 loss) /
                static_cast<double>(period);
        }

        if (averageLoss == 0.0)
        {
            return 100.0;
        }

        if (averageGain == 0.0)
        {
            return 0.0;
        }

        const double relativeStrength =
            averageGain / averageLoss;

        return 100.0 -
               (100.0 /
                (1.0 + relativeStrength));
    }

    double IndicatorEngine::momentum(
        const std::vector<double> &prices,
        std::size_t period)
    {
        validatePrices(prices, period);

        if (prices.size() <= period)
        {
            throw std::invalid_argument(
                "Momentum requires more observations than the period.");
        }

        const double currentPrice =
            prices.back();

        const double previousPrice =
            prices[prices.size() - period - 1];

        return currentPrice - previousPrice;
    }
}