#pragma once

#include "quantpulse/domain/market_data/MarketDataEngine.hpp"

#include <cstddef>
#include <deque>

namespace quantpulse::domain::market_data_buffer
{

    class MarketDataBufferEngine
    {
    public:
        /**
         * @brief Create a market data buffer.
         *
         * @param capacity Maximum number of observations
         *        stored in the buffer.
         *
         * @throw std::invalid_argument if capacity is zero.
         */
        explicit MarketDataBufferEngine(
            std::size_t capacity);

        /**
         * @brief Add a market observation to the buffer.
         *
         * If the buffer is full, the oldest observation
         * is removed.
         *
         * @param observation Market observation to store.
         *
         * @throw std::invalid_argument if observation
         *        values are invalid.
         *
         * @throw std::invalid_argument if timestamps are
         *        not strictly increasing.
         */
        void push(
            const market_data::MarketObservation &
                observation);

        /**
         * @brief Return the latest observation.
         *
         * @throw std::runtime_error if the buffer is empty.
         */
        [[nodiscard]]
        const market_data::MarketObservation &
        latest() const;

        /**
         * @brief Return an observation by index.
         *
         * Index zero represents the oldest observation.
         *
         * @throw std::out_of_range if index is invalid.
         */
        [[nodiscard]]
        const market_data::MarketObservation &
        at(
            std::size_t index) const;

        /**
         * @brief Return the current number of observations.
         */
        [[nodiscard]]
        std::size_t size() const noexcept;

        /**
         * @brief Return the maximum buffer capacity.
         */
        [[nodiscard]]
        std::size_t capacity() const noexcept;

        /**
         * @brief Check whether the buffer is empty.
         */
        [[nodiscard]]
        bool empty() const noexcept;

        /**
         * @brief Remove all observations.
         */
        void clear() noexcept;

    private:
        std::size_t capacity_;

        std::deque<
            market_data::MarketObservation>
            observations_;
    };

} // namespace quantpulse::domain::market_data_buffer