#pragma once

namespace quantpulse::domain::transaction_cost
{

    struct TransactionCostConfig
    {
        /*
         * Fixed commission charged per transaction.
         *
         * Example:
         *
         * fixedCommission = 10.0
         *
         * means every transaction costs 10 units
         * of currency.
         */
        double fixedCommission = 0.0;

        /*
         * Commission charged as a fraction of
         * transaction notional value.
         *
         * Example:
         *
         * commissionRate = 0.001
         *
         * means 0.1% commission.
         */
        double commissionRate = 0.0;

        /*
         * Estimated bid-ask spread as a fraction
         * of the execution price.
         *
         * Example:
         *
         * spreadFraction = 0.002
         *
         * means a 0.2% total spread.
         *
         * A trade crosses approximately half of
         * the spread, so the modeled spread cost
         * uses half of this value.
         */
        double spreadFraction = 0.0;

        /*
         * Estimated slippage as a fraction of
         * transaction notional value.
         *
         * Example:
         *
         * slippageFraction = 0.0005
         *
         * means 0.05% slippage.
         */
        double slippageFraction = 0.0;
    };

    struct TransactionCostResult
    {
        /*
         * quantity * executionPrice
         */
        double notionalValue;

        double fixedCommissionCost;

        double percentageCommissionCost;

        double spreadCost;

        double slippageCost;

        double totalCost;
    };

    class TransactionCostEngine
    {
    public:
        /**
         * @brief Calculate estimated transaction costs.
         *
         * The transaction cost model includes:
         *
         * fixed commission
         *
         * percentage commission
         *
         * bid-ask spread cost
         *
         * slippage cost
         *
         * @param quantity Executed trade quantity.
         *
         * @param executionPrice Execution price per unit.
         *
         * @param config Transaction cost configuration.
         *
         * @return Detailed transaction cost result.
         *
         * @throw std::invalid_argument if inputs
         *        or configuration are invalid.
         */
        [[nodiscard]]
        static TransactionCostResult calculate(
            double quantity,
            double executionPrice,
            const TransactionCostConfig &config = {});
    };

} // namespace quantpulse::domain::transaction_cost