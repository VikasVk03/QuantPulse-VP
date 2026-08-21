#include "quantpulse/domain/features/FeatureEngine.hpp"

#include "quantpulse/domain/microstructure/MarketMicrostructureEngine.hpp"
#include "quantpulse/domain/returns/ReturnsEngine.hpp"
#include "quantpulse/domain/risk/RiskEngine.hpp"
#include "quantpulse/domain/volatility/VolatilityEngine.hpp"

#include <cmath>
#include <stdexcept>

namespace quantpulse::domain::features
{

    namespace
    {

        void validateInput(
            const std::vector<double> &prices,
            const std::vector<double> &volumes)
        {
            if (prices.empty())
            {
                throw std::invalid_argument(
                    "Price series must not be empty.");
            }

            if (prices.size() != volumes.size())
            {
                throw std::invalid_argument(
                    "Prices and volumes must have equal size.");
            }
        }

    }

    FeatureVector FeatureEngine::generate(
        const std::vector<double> &prices,
        const std::vector<double> &volumes,
        double bidPrice,
        double askPrice,
        double bidVolume,
        double askVolume,
        double tradeBuyVolume,
        double tradeSellVolume)
    {
        validateInput(prices, volumes);

        using quantpulse::domain::microstructure::
            MarketMicrostructureEngine;
        using quantpulse::domain::returns::ReturnsEngine;
        using quantpulse::domain::risk::RiskEngine;
        using quantpulse::domain::volatility::VolatilityEngine;

        const auto returns =
            ReturnsEngine::simpleReturns(prices);

        FeatureVector features{};

        features.cumulativeReturn =
            ReturnsEngine::cumulativeReturn(returns);

        features.volatility =
            VolatilityEngine::historicalVolatility(
                returns, 252.0);

        features.sharpeRatio =
            RiskEngine::sharpeRatio(
                returns,
                0.0);

        features.sortinoRatio =
            RiskEngine::sortinoRatio(
                returns,
                0.0);

        features.maximumDrawdown =
            RiskEngine::maximumDrawdown(
                returns);

        const double vwap =
            MarketMicrostructureEngine::vwap(
                prices,
                volumes);

        const double currentPrice =
            prices.back();

        features.vwapDeviation =
            (currentPrice - vwap) / vwap;

        features.relativeSpread =
            MarketMicrostructureEngine::relativeSpread(
                bidPrice,
                askPrice);

        features.orderImbalance =
            MarketMicrostructureEngine::orderImbalance(
                bidVolume,
                askVolume);

        features.tradeImbalance =
            MarketMicrostructureEngine::tradeImbalance(
                tradeBuyVolume,
                tradeSellVolume);

        features.priceImpact =
            MarketMicrostructureEngine::priceImpact(
                prices.front(),
                prices.back());

        return features;
    }

}