#include "quantpulse/domain/market_data/MarketDataEngine.hpp"

#include <cmath>
#include <stdexcept>
#include <string>

namespace quantpulse::domain::market_data
{

    namespace
    {

        void validateFinite(
            double value,
            const char *name)
        {
            if (!std::isfinite(value))
            {
                throw std::invalid_argument(
                    std::string(name) +
                    " must be finite.");
            }
        }

        void validatePositive(
            double value,
            const char *name)
        {
            validateFinite(
                value,
                name);

            if (value <= 0.0)
            {
                throw std::invalid_argument(
                    std::string(name) +
                    " must be positive.");
            }
        }

        void validateNonNegative(
            double value,
            const char *name)
        {
            validateFinite(
                value,
                name);

            if (value < 0.0)
            {
                throw std::invalid_argument(
                    std::string(name) +
                    " must be non-negative.");
            }
        }

        void validateObservation(
            const MarketObservation &observation)
        {
            validatePositive(
                observation.price,
                "Price");

            validateNonNegative(
                observation.bid,
                "Bid");

            validateNonNegative(
                observation.ask,
                "Ask");

            validateNonNegative(
                observation.volume,
                "Volume");

            if (observation.ask <
                observation.bid)
            {
                throw std::invalid_argument(
                    "Ask price must not be below bid price.");
            }
        }

    } // namespace

    void MarketDataEngine::update(
        const MarketObservation &observation)
    {
        validateObservation(
            observation);

        if (hasObservation_ &&
            observation.timestamp <=
                latestObservation_.timestamp)
        {
            throw std::invalid_argument(
                "Market observation timestamp "
                "must be strictly increasing.");
        }

        latestObservation_ =
            observation;

        hasObservation_ =
            true;
    }

    bool MarketDataEngine::hasData() const noexcept
    {
        return hasObservation_;
    }

    const MarketObservation &
    MarketDataEngine::latest() const
    {
        if (!hasObservation_)
        {
            throw std::runtime_error(
                "No market data is available.");
        }

        return latestObservation_;
    }

} // namespace quantpulse::domain::market_data