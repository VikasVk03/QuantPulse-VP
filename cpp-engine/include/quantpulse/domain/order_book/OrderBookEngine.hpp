#pragma once

#include <cstddef>
#include <vector>

namespace quantpulse::domain::order_book
{
    struct PriceLevel
    {
        double price = 0.0;
        double quantity = 0.0;
    };

    class OrderBookEngine
    {
    public:
        OrderBookEngine() = default;

        void updateBid(
            double price,
            double quantity);

        void updateAsk(
            double price,
            double quantity);

        void removeBid(double price);

        void removeAsk(double price);

        [[nodiscard]]
        double bestBid() const;

        [[nodiscard]]
        double bestAsk() const;

        [[nodiscard]]
        double spread() const;

        [[nodiscard]]
        double midPrice() const;

        [[nodiscard]]
        double bidDepth(std::size_t levels) const;

        [[nodiscard]]
        double askDepth(std::size_t levels) const;

        [[nodiscard]]
        std::size_t bidLevelCount() const noexcept;

        [[nodiscard]]
        std::size_t askLevelCount() const noexcept;

        void clear() noexcept;

    private:
        std::vector<PriceLevel> bids_;
        std::vector<PriceLevel> asks_;
    };
}