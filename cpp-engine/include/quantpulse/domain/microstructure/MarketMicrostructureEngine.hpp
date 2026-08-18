#pragma once

#include <vector>

namespace quantpulse::domain::microstructure
{

    class MarketMicrostructureEngine
    {
    public:
        /**
         * @brief Calculate the Volume-Weighted Average Price.
         *
         * VWAP weights each observed price by its corresponding
         * traded volume.
         *
         * @param prices Price observations.
         * @param volumes Corresponding traded volumes.
         *
         * @return Volume-Weighted Average Price.
         *
         * @throw std::invalid_argument if:
         *        - either input is empty,
         *        - the input sizes differ,
         *        - a price is non-finite,
         *        - a volume is non-finite,
         *        - a volume is negative,
         *        - total volume is zero.
         */
        [[nodiscard]]
        static double vwap(
            const std::vector<double> &prices,
            const std::vector<double> &volumes);

        /**
         * @brief Calculate the Time-Weighted Average Price.
         *
         * For equally sampled price observations, TWAP is the
         * arithmetic mean of the observed prices.
         *
         * @param prices Price observations.
         *
         * @return Time-Weighted Average Price.
         *
         * @throw std::invalid_argument if prices is empty or
         *        contains non-finite values.
         */
        [[nodiscard]]
        static double twap(
            const std::vector<double> &prices);

        /**
         * @brief Calculate the midpoint between the best bid and best ask.
         *
         * The mid price represents the midpoint of the quoted market.
         *
         * Formula:
         *
         *     MidPrice = (Bid + Ask) / 2
         *
         * @param bid Best bid price.
         * @param ask Best ask price.
         *
         * @return Midpoint price.
         *
         * @throw std::invalid_argument if prices are invalid or ask < bid.
         */
        [[nodiscard]]
        static double midPrice(
            double bid,
            double ask);

        /**
         * @brief Calculate the absolute bid-ask spread.
         *
         * Formula:
         *
         *     Spread = Ask - Bid
         *
         * @param bid Best bid price.
         * @param ask Best ask price.
         *
         * @return Absolute bid-ask spread.
         *
         * @throw std::invalid_argument if prices are invalid or ask < bid.
         */
        [[nodiscard]]
        static double bidAskSpread(
            double bid,
            double ask);

        /**
         * @brief Calculate the relative bid-ask spread.
         *
         * Formula:
         *
         *     RelativeSpread =
         *         (Ask - Bid) / MidPrice
         *
         * @param bid Best bid price.
         * @param ask Best ask price.
         *
         * @return Relative bid-ask spread as a decimal.
         *
         * @throw std::invalid_argument if prices are invalid,
         *        ask < bid, or midpoint is zero.
         */
        [[nodiscard]]
        static double relativeSpread(
            double bid,
            double ask);

        /**
         * @brief Calculate order-book imbalance between bid and ask volumes.
         *
         * Positive values indicate greater bid-side volume, while negative
         * values indicate greater ask-side volume.
         *
         * @param bidVolume Volume available at the bid.
         * @param askVolume Volume available at the ask.
         *
         * @return Order imbalance in the range [-1, 1].
         *
         * @throw std::invalid_argument if either volume is negative,
         *        non-finite, or their total is zero.
         */
        [[nodiscard]]
        static double orderImbalance(
            double bidVolume,
            double askVolume);

        /**
         * @brief Calculate trade imbalance between buy-side and sell-side volume.
         *
         * Positive values indicate greater buy-side trading activity,
         * while negative values indicate greater sell-side trading activity.
         *
         * @param buyVolume Volume of trades classified as buyer-initiated.
         * @param sellVolume Volume of trades classified as seller-initiated.
         *
         * @return Trade imbalance in the range [-1, 1].
         *
         * @throw std::invalid_argument if either volume is negative,
         *        non-finite, or their total is zero.
         */
        [[nodiscard]]
        static double tradeImbalance(
            double buyVolume,
            double sellVolume);

        [[nodiscard]]
        static double priceImpact(
            double priceBefore,
            double priceAfter);
    };

} // namespace quantpulse::domain::microstructure