#pragma once

#include "quantpulse/domain/order_book/OrderBookEngine.hpp"

#include <cstddef>
#include <vector>

namespace quantpulse::domain::matching
{
    enum class OrderSide
    {
        Buy,
        Sell
    };

    struct MatchRequest
    {
        OrderSide side;
        double quantity;
    };

    struct Fill
    {
        double price;
        double quantity;
    };

    struct MatchResult
    {
        double requestedQuantity = 0.0;
        double filledQuantity = 0.0;
        double remainingQuantity = 0.0;
        double averageFillPrice = 0.0;
        std::vector<Fill> fills;
    };

    class MatchingEngine
    {
    public:
        MatchingEngine() = default;

        [[nodiscard]]
        MatchResult match(
            const order_book::OrderBookEngine &book,
            const MatchRequest &request) const;
    };
}