#pragma once

#include <cstdint>

namespace quantpulse::domain::market_data
{

    struct MarketObservation
    {
        std::int64_t timestamp;

        double price;

        double bid;

        double ask;

        double volume;
    };

    class MarketDataEngine
    {
    public:
        /**
         * @brief Create an empty market data engine.
         */
        MarketDataEngine() = default;

        /**
         * @brief Submit a market observation.
         *
         * The observation becomes the latest market state
         * if it passes validation.
         *
         * @param observation Incoming market observation.
         *
         * @throw std::invalid_argument if the observation
         *        contains invalid values.
         *
         * @throw std::invalid_argument if timestamps are
         *        not strictly increasing.
         */
        void update(
            const MarketObservation &observation);

        /**
         * @brief Check whether the engine has received
         *        at least one market observation.
         */
        [[nodiscard]]
        bool hasData() const noexcept;

        /**
         * @brief Return the latest market observation.
         *
         * @throw std::runtime_error if no market data
         *        has been received.
         */
        [[nodiscard]]
        const MarketObservation &
        latest() const;

    private:
        MarketObservation latestObservation_{};

        bool hasObservation_ = false;
    };

} // namespace quantpulse::domain::market_data