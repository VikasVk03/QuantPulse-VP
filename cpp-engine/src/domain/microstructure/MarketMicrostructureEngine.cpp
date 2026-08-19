#include "quantpulse/domain/microstructure/MarketMicrostructureEngine.hpp"

#include <cmath>
#include <stdexcept>

namespace quantpulse::domain::microstructure
{

    namespace
    {
        void validateQuote(
            double bid,
            double ask)
        {
            if (!std::isfinite(bid) ||
                !std::isfinite(ask))
            {
                throw std::invalid_argument(
                    "Bid and ask prices must be finite.");
            }

            if (bid < 0.0 ||
                ask < 0.0)
            {
                throw std::invalid_argument(
                    "Bid and ask prices must be non-negative.");
            }

            if (ask < bid)
            {
                throw std::invalid_argument(
                    "Ask price cannot be less than bid price.");
            }
        }
    }

    double MarketMicrostructureEngine::vwap(
        const std::vector<double> &prices,
        const std::vector<double> &volumes)
    {
        if (prices.empty() || volumes.empty())
        {
            throw std::invalid_argument(
                "Prices and volumes must not be empty.");
        }

        if (prices.size() != volumes.size())
        {
            throw std::invalid_argument(
                "Prices and volumes must have the same size.");
        }

        double priceVolumeSum = 0.0;
        double totalVolume = 0.0;

        for (std::size_t i = 0;
             i < prices.size();
             ++i)
        {
            const double price = prices[i];
            const double volume = volumes[i];

            if (!std::isfinite(price))
            {
                throw std::invalid_argument(
                    "Prices must be finite.");
            }

            if (!std::isfinite(volume))
            {
                throw std::invalid_argument(
                    "Volumes must be finite.");
            }

            if (volume < 0.0)
            {
                throw std::invalid_argument(
                    "Volumes must be non-negative.");
            }

            priceVolumeSum += price * volume;
            totalVolume += volume;
        }

        if (totalVolume == 0.0)
        {
            throw std::invalid_argument(
                "Total volume must be greater than zero.");
        }

        return priceVolumeSum / totalVolume;
    }

    double MarketMicrostructureEngine::twap(
        const std::vector<double> &prices)
    {
        if (prices.empty())
        {
            throw std::invalid_argument(
                "Prices must not be empty.");
        }

        double priceSum = 0.0;

        for (const double price : prices)
        {
            if (!std::isfinite(price))
            {
                throw std::invalid_argument(
                    "Prices must be finite.");
            }

            priceSum += price;
        }

        return priceSum /
               static_cast<double>(prices.size());
    }

    double MarketMicrostructureEngine::midPrice(
        double bid,
        double ask)
    {
        validateQuote(bid, ask);

        return (bid + ask) / 2.0;
    }

    double MarketMicrostructureEngine::bidAskSpread(
        double bid,
        double ask)
    {
        validateQuote(bid, ask);

        return ask - bid;
    }

    double MarketMicrostructureEngine::relativeSpread(
        double bid,
        double ask)
    {
        validateQuote(bid, ask);

        const double midpoint =
            (bid + ask) / 2.0;

        if (midpoint == 0.0)
        {
            throw std::invalid_argument(
                "Relative spread is undefined when midpoint is zero.");
        }

        return (ask - bid) / midpoint;
    }

    double MarketMicrostructureEngine::orderImbalance(
        double bidVolume,
        double askVolume)
    {
        if (!std::isfinite(bidVolume) ||
            !std::isfinite(askVolume))
        {
            throw std::invalid_argument(
                "Bid and ask volumes must be finite.");
        }

        if (bidVolume < 0.0 ||
            askVolume < 0.0)
        {
            throw std::invalid_argument(
                "Bid and ask volumes cannot be negative.");
        }

        const double totalVolume =
            bidVolume + askVolume;

        if (totalVolume == 0.0)
        {
            throw std::invalid_argument(
                "Bid and ask volume cannot both be zero.");
        }

        return (bidVolume - askVolume) /
               totalVolume;
    }

    double MarketMicrostructureEngine::tradeImbalance(
        double buyVolume,
        double sellVolume)
    {
        if (!std::isfinite(buyVolume) ||
            !std::isfinite(sellVolume))
        {
            throw std::invalid_argument(
                "Buy and sell volumes must be finite.");
        }

        if (buyVolume < 0.0 ||
            sellVolume < 0.0)
        {
            throw std::invalid_argument(
                "Buy and sell volumes cannot be negative.");
        }

        const double totalVolume =
            buyVolume + sellVolume;

        if (totalVolume == 0.0)
        {
            throw std::invalid_argument(
                "Buy and sell volume cannot both be zero.");
        }

        return (buyVolume - sellVolume) /
               totalVolume;
    }

    double MarketMicrostructureEngine::priceImpact(
        double priceBefore,
        double priceAfter)
    {
        if (!std::isfinite(priceBefore) ||
            !std::isfinite(priceAfter))
        {
            throw std::invalid_argument(
                "Prices must be finite.");
        }

        if (priceBefore <= 0.0 ||
            priceAfter <= 0.0)
        {
            throw std::invalid_argument(
                "Prices must be greater than zero.");
        }

        return (priceAfter - priceBefore) /
               priceBefore;
    }

} // namespace quantpulse::domain::microstructure
