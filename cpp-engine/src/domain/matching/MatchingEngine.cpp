#include "quantpulse/domain/matching/MatchingEngine.hpp"

#include <algorithm>
#include <cmath>
#include <stdexcept>

namespace quantpulse::domain::matching
{
    namespace
    {
        void validateRequest(
            const MatchRequest &request)
        {
            if (!std::isfinite(request.quantity) ||
                request.quantity <= 0.0)
            {
                throw std::invalid_argument(
                    "Match quantity must be finite and positive.");
            }
        }

        MatchResult matchBuy(
            const order_book::OrderBookEngine &book,
            double requestedQuantity)
        {
            MatchResult result{};

            result.requestedQuantity =
                requestedQuantity;

            result.remainingQuantity =
                requestedQuantity;

            double weightedPrice = 0.0;

            const std::size_t levelCount =
                book.askLevelCount();

            for (std::size_t levelIndex = 0;
                 levelIndex < levelCount &&
                 result.remainingQuantity > 0.0;
                 ++levelIndex)
            {
                const auto level =
                    book.askLevel(levelIndex);

                const double fillQuantity =
                    std::min(
                        result.remainingQuantity,
                        level.quantity);

                if (fillQuantity <= 0.0)
                {
                    continue;
                }

                result.fills.push_back(
                    Fill{
                        level.price,
                        fillQuantity});

                result.filledQuantity +=
                    fillQuantity;

                result.remainingQuantity -=
                    fillQuantity;

                weightedPrice +=
                    level.price * fillQuantity;
            }

            if (result.filledQuantity > 0.0)
            {
                result.averageFillPrice =
                    weightedPrice /
                    result.filledQuantity;
            }

            return result;
        }

        MatchResult matchSell(
            const order_book::OrderBookEngine &book,
            double requestedQuantity)
        {
            MatchResult result{};

            result.requestedQuantity =
                requestedQuantity;

            result.remainingQuantity =
                requestedQuantity;

            double weightedPrice = 0.0;

            const std::size_t levelCount =
                book.bidLevelCount();

            for (std::size_t levelIndex = 0;
                 levelIndex < levelCount &&
                 result.remainingQuantity > 0.0;
                 ++levelIndex)
            {
                const auto level =
                    book.bidLevel(levelIndex);

                const double fillQuantity =
                    std::min(
                        result.remainingQuantity,
                        level.quantity);

                if (fillQuantity <= 0.0)
                {
                    continue;
                }

                result.fills.push_back(
                    Fill{
                        level.price,
                        fillQuantity});

                result.filledQuantity +=
                    fillQuantity;

                result.remainingQuantity -=
                    fillQuantity;

                weightedPrice +=
                    level.price * fillQuantity;
            }

            if (result.filledQuantity > 0.0)
            {
                result.averageFillPrice =
                    weightedPrice /
                    result.filledQuantity;
            }

            return result;
        }
    }

    MatchResult MatchingEngine::match(
        const order_book::OrderBookEngine &book,
        const MatchRequest &request) const
    {
        validateRequest(request);

        if (request.side == OrderSide::Buy)
        {
            if (book.askLevelCount() == 0)
            {
                throw std::out_of_range(
                    "Order book has no ask levels.");
            }

            return matchBuy(
                book,
                request.quantity);
        }

        if (book.bidLevelCount() == 0)
        {
            throw std::out_of_range(
                "Order book has no bid levels.");
        }

        return matchSell(
            book,
            request.quantity);
    }
}