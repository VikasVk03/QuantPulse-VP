#pragma once

namespace quantpulse::domain::portfolio_state
{

    struct PortfolioState
    {
        double cash;

        double quantity;

        double averageEntryPrice;

        double realizedPnL;
    };

    struct PortfolioSnapshot
    {
        double cash;

        double quantity;

        double averageEntryPrice;

        double realizedPnL;

        double unrealizedPnL;

        double marketValue;

        double totalEquity;
    };

    class PortfolioStateEngine
    {
    public:
        /**
         * @brief Create an initial empty portfolio state.
         *
         * @param initialCapital Starting portfolio cash.
         *
         * @return Initial portfolio state.
         *
         * @throw std::invalid_argument if initial capital
         *        is invalid.
         */
        [[nodiscard]]
        static PortfolioState initialize(
            double initialCapital);

        /**
         * @brief Apply a buy transaction to the portfolio.
         *
         * The transaction increases position quantity
         * and decreases available cash.
         *
         * The average entry price is updated using a
         * weighted average.
         *
         * @param state Current portfolio state.
         * @param quantity Quantity to buy.
         * @param price Execution price.
         *
         * @return Updated portfolio state.
         *
         * @throw std::invalid_argument if inputs are invalid
         *        or available cash is insufficient.
         */
        [[nodiscard]]
        static PortfolioState buy(
            const PortfolioState &state,
            double quantity,
            double price);

        /**
         * @brief Apply a sell transaction to the portfolio.
         *
         * The transaction decreases position quantity
         * and increases available cash.
         *
         * Realized profit and loss is updated.
         *
         * @param state Current portfolio state.
         * @param quantity Quantity to sell.
         * @param price Execution price.
         *
         * @return Updated portfolio state.
         *
         * @throw std::invalid_argument if inputs are invalid
         *        or the portfolio does not contain enough
         *        quantity.
         */
        [[nodiscard]]
        static PortfolioState sell(
            const PortfolioState &state,
            double quantity,
            double price);

        /**
         * @brief Calculate a current portfolio snapshot.
         *
         * @param state Current portfolio state.
         * @param marketPrice Current market price.
         *
         * @return Portfolio snapshot containing equity
         *        and profit/loss information.
         *
         * @throw std::invalid_argument if inputs are invalid.
         */
        [[nodiscard]]
        static PortfolioSnapshot snapshot(
            const PortfolioState &state,
            double marketPrice);
    };

} // namespace quantpulse::domain::portfolio_state