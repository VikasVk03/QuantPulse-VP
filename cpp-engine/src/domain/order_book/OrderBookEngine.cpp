#include "quantpulse/domain/order_book/OrderBookEngine.hpp"

#include <algorithm>
#include <cmath>
#include <stdexcept>

namespace quantpulse::domain::order_book
{
    namespace
    {
        void validatePrice(double price)
        {
            if (!std::isfinite(price) || price <= 0.0)
            {
                throw std::invalid_argument(
                    "Price must be finite and positive.");
            }
        }

        void validateQuantity(double quantity)
        {
            if (!std::isfinite(quantity) || quantity < 0.0)
            {
                throw std::invalid_argument(
                    "Quantity must be finite and non-negative.");
            }
        }

        auto findLevel(
            std::vector<PriceLevel> &levels,
            double price)
        {
            return std::find_if(
                levels.begin(),
                levels.end(),
                [price](const PriceLevel &level)
                {
                    return level.price == price;
                });
        }

        void sortBids(
            std::vector<PriceLevel> &bids)
        {
            std::sort(
                bids.begin(),
                bids.end(),
                [](const PriceLevel &lhs,
                   const PriceLevel &rhs)
                {
                    return lhs.price > rhs.price;
                });
        }

        void sortAsks(
            std::vector<PriceLevel> &asks)
        {
            std::sort(
                asks.begin(),
                asks.end(),
                [](const PriceLevel &lhs,
                   const PriceLevel &rhs)
                {
                    return lhs.price < rhs.price;
                });
        }

        double calculateDepth(
            const std::vector<PriceLevel> &levels,
            std::size_t requestedLevels)
        {
            const std::size_t count =
                std::min(
                    requestedLevels,
                    levels.size());

            double depth = 0.0;

            for (std::size_t i = 0; i < count; ++i)
            {
                depth += levels[i].quantity;
            }

            return depth;
        }
    }

    void OrderBookEngine::updateBid(
        double price,
        double quantity)
    {
        validatePrice(price);
        validateQuantity(quantity);

        auto iterator =
            findLevel(bids_, price);

        if (quantity == 0.0)
        {
            if (iterator != bids_.end())
            {
                bids_.erase(iterator);
            }

            return;
        }

        if (iterator != bids_.end())
        {
            iterator->quantity = quantity;
        }
        else
        {
            bids_.push_back(
                PriceLevel{
                    price,
                    quantity});

            sortBids(bids_);
        }
    }

    void OrderBookEngine::updateAsk(
        double price,
        double quantity)
    {
        validatePrice(price);
        validateQuantity(quantity);

        auto iterator =
            findLevel(asks_, price);

        if (quantity == 0.0)
        {
            if (iterator != asks_.end())
            {
                asks_.erase(iterator);
            }

            return;
        }

        if (iterator != asks_.end())
        {
            iterator->quantity = quantity;
        }
        else
        {
            asks_.push_back(
                PriceLevel{
                    price,
                    quantity});

            sortAsks(asks_);
        }
    }

    void OrderBookEngine::removeBid(
        double price)
    {
        validatePrice(price);

        auto iterator =
            findLevel(bids_, price);

        if (iterator != bids_.end())
        {
            bids_.erase(iterator);
        }
    }

    void OrderBookEngine::removeAsk(
        double price)
    {
        validatePrice(price);

        auto iterator =
            findLevel(asks_, price);

        if (iterator != asks_.end())
        {
            asks_.erase(iterator);
        }
    }

    double OrderBookEngine::bestBid() const
    {
        if (bids_.empty())
        {
            throw std::out_of_range(
                "Order book has no bid levels.");
        }

        return bids_.front().price;
    }

    double OrderBookEngine::bestAsk() const
    {
        if (asks_.empty())
        {
            throw std::out_of_range(
                "Order book has no ask levels.");
        }

        return asks_.front().price;
    }

    double OrderBookEngine::spread() const
    {
        return bestAsk() - bestBid();
    }

    double OrderBookEngine::midPrice() const
    {
        return (bestBid() + bestAsk()) / 2.0;
    }

    double OrderBookEngine::bidDepth(
        std::size_t levels) const
    {
        return calculateDepth(
            bids_,
            levels);
    }

    double OrderBookEngine::askDepth(
        std::size_t levels) const
    {
        return calculateDepth(
            asks_,
            levels);
    }

    std::size_t OrderBookEngine::bidLevelCount()
        const noexcept
    {
        return bids_.size();
    }

    std::size_t OrderBookEngine::askLevelCount()
        const noexcept
    {
        return asks_.size();
    }

    void OrderBookEngine::clear() noexcept
    {
        bids_.clear();
        asks_.clear();
    }
}