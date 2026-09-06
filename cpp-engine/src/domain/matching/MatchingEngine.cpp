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

            /*
             * OrderBookEngine intentionally exposes best-price
             * information but not its complete level arrays.
             *
             * Therefore this first matching implementation uses
             * the public depth interface only for determining
             * available top-level liquidity.
             *
             * A complete multi-level matching implementation will
             * require an explicit read-only level-access API.
             */

            const double bestAsk =
                book.bestAsk();

            const double availableQuantity =
                book.askDepth(1);

            const double fillQuantity =
                std::min(
                    requestedQuantity,
                    availableQuantity);

            if (fillQuantity > 0.0)
            {
                result.fills.push_back(
                    Fill{
                        bestAsk,
                        fillQuantity});

                result.filledQuantity =
                    fillQuantity;

                result.remainingQuantity =
                    requestedQuantity -
                    fillQuantity;

                result.averageFillPrice =
                    bestAsk;
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

            const double bestBid =
                book.bestBid();

            const double availableQuantity =
                book.bidDepth(1);

            const double fillQuantity =
                std::min(
                    requestedQuantity,
                    availableQuantity);

            if (fillQuantity > 0.0)
            {
                result.fills.push_back(
                    Fill{
                        bestBid,
                        fillQuantity});

                result.filledQuantity =
                    fillQuantity;

                result.remainingQuantity =
                    requestedQuantity -
                    fillQuantity;

                result.averageFillPrice =
                    bestBid;
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
            return matchBuy(
                book,
                request.quantity);
        }

        return matchSell(
            book,
            request.quantity);
    }
}