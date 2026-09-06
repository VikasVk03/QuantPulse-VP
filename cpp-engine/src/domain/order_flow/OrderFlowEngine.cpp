#include "quantpulse/domain/order_flow/OrderFlowEngine.hpp"

#include <cmath>
#include <stdexcept>

namespace quantpulse::domain::order_flow
{

    namespace
    {

        void validateTopOfBook(const TopOfBook &book)
        {
            if (!std::isfinite(book.bidPrice) ||
                !std::isfinite(book.askPrice) ||
                !std::isfinite(book.bidQuantity) ||
                !std::isfinite(book.askQuantity))
            {
                throw std::invalid_argument("Top-of-book values must be finite");
            }

            if (book.bidPrice <= 0.0 || book.askPrice <= 0.0)
            {
                throw std::invalid_argument("Top-of-book prices must be positive");
            }

            if (book.bidQuantity < 0.0 || book.askQuantity < 0.0)
            {
                throw std::invalid_argument(
                    "Top-of-book quantities must be non-negative");
            }

            if (book.askPrice < book.bidPrice)
            {
                throw std::invalid_argument(
                    "Ask price must be greater than or equal to bid price");
            }
        }

        double calculateBidContribution(
            const TopOfBook &previous,
            const TopOfBook &current)
        {
            if (current.bidPrice > previous.bidPrice)
            {
                return current.bidQuantity;
            }

            if (current.bidPrice == previous.bidPrice)
            {
                return current.bidQuantity - previous.bidQuantity;
            }

            return -previous.bidQuantity;
        }

        double calculateAskContribution(
            const TopOfBook &previous,
            const TopOfBook &current)
        {
            if (current.askPrice < previous.askPrice)
            {
                return -current.askQuantity;
            }

            if (current.askPrice == previous.askPrice)
            {
                return -(current.askQuantity - previous.askQuantity);
            }

            return previous.askQuantity;
        }

    } // namespace

    OrderFlowResult OrderFlowEngine::calculate(
        const TopOfBook &previous,
        const TopOfBook &current)
    {
        validateTopOfBook(previous);
        validateTopOfBook(current);

        const double bidContribution =
            calculateBidContribution(previous, current);

        const double askContribution =
            calculateAskContribution(previous, current);

        return OrderFlowResult{
            .bidContribution = bidContribution,
            .askContribution = askContribution,
            .ofi = bidContribution + askContribution};
    }

} // namespace quantpulse::domain::order_flow