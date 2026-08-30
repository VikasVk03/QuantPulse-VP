#include "quantpulse/domain/market_data_buffer/MarketDataBufferEngine.hpp"

#include <cmath>
#include <stdexcept>
#include <string>

namespace quantpulse::domain::market_data_buffer
{

    namespace
    {

        void validateFinite(
            double value,
            const char *name)
        {
            if (!std::isfinite(
                    value))
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
            const market_data::MarketObservation &
                observation)
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
                    "Ask price must not be "
                    "below bid price.");
            }
        }

    } // namespace

    MarketDataBufferEngine::
        MarketDataBufferEngine(
            std::size_t capacity)
        : capacity_(capacity)
    {
        if (capacity_ == 0)
        {
            throw std::invalid_argument(
                "Buffer capacity must be "
                "greater than zero.");
        }
    }

    void MarketDataBufferEngine::push(
        const market_data::MarketObservation &
            observation)
    {
        validateObservation(
            observation);

        if (!observations_.empty() &&
            observation.timestamp <=
                observations_.back().timestamp)
        {
            throw std::invalid_argument(
                "Market observation timestamp "
                "must be strictly increasing.");
        }

        if (observations_.size() ==
            capacity_)
        {
            observations_.pop_front();
        }

        observations_.push_back(
            observation);
    }

    const market_data::MarketObservation &
    MarketDataBufferEngine::latest() const
    {
        if (observations_.empty())
        {
            throw std::runtime_error(
                "Market data buffer is empty.");
        }

        return observations_.back();
    }

    const market_data::MarketObservation &
    MarketDataBufferEngine::at(
        std::size_t index) const
    {
        if (index >=
            observations_.size())
        {
            throw std::out_of_range(
                "Market data buffer index "
                "is out of range.");
        }

        return observations_.at(
            index);
    }

    std::size_t
    MarketDataBufferEngine::size() const noexcept
    {
        return observations_.size();
    }

    std::size_t
    MarketDataBufferEngine::capacity() const noexcept
    {
        return capacity_;
    }

    bool
    MarketDataBufferEngine::empty() const noexcept
    {
        return observations_.empty();
    }

    void
    MarketDataBufferEngine::clear() noexcept
    {
        observations_.clear();
    }

} // namespace quantpulse::domain::market_data_buffer