#include "quantpulse/domain/transaction_cost/TransactionCostEngine.hpp"

#include <cmath>
#include <stdexcept>
#include <string>

namespace quantpulse::domain::transaction_cost
{

    namespace
    {

        void validateFiniteNonNegative(
            double value,
            const char *name)
        {
            if (!std::isfinite(value) ||
                value < 0.0)
            {
                throw std::invalid_argument(
                    std::string(name) +
                    " must be finite and non-negative.");
            }
        }

        void validateFinitePositive(
            double value,
            const char *name)
        {
            if (!std::isfinite(value) ||
                value <= 0.0)
            {
                throw std::invalid_argument(
                    std::string(name) +
                    " must be finite and positive.");
            }
        }

        void validateConfig(
            const TransactionCostConfig &config)
        {
            validateFiniteNonNegative(
                config.fixedCommission,
                "Fixed commission");

            validateFiniteNonNegative(
                config.commissionRate,
                "Commission rate");

            validateFiniteNonNegative(
                config.spreadFraction,
                "Spread fraction");

            validateFiniteNonNegative(
                config.slippageFraction,
                "Slippage fraction");
        }

    } // namespace

    TransactionCostResult
    TransactionCostEngine::calculate(
        double quantity,
        double executionPrice,
        const TransactionCostConfig &config)
    {
        validateFinitePositive(
            quantity,
            "Quantity");

        validateFinitePositive(
            executionPrice,
            "Execution price");

        validateConfig(config);

        const double notionalValue =
            quantity *
            executionPrice;

        if (!std::isfinite(notionalValue))
        {
            throw std::invalid_argument(
                "Transaction notional value "
                "must be finite.");
        }

        const double fixedCommissionCost =
            config.fixedCommission;

        const double percentageCommissionCost =
            notionalValue *
            config.commissionRate;

        /*
         * A trade generally crosses half of
         * the quoted bid-ask spread.
         */
        const double spreadCost =
            notionalValue *
            config.spreadFraction *
            0.5;

        const double slippageCost =
            notionalValue *
            config.slippageFraction;

        const double totalCost =
            fixedCommissionCost +
            percentageCommissionCost +
            spreadCost +
            slippageCost;

        if (!std::isfinite(totalCost))
        {
            throw std::invalid_argument(
                "Total transaction cost "
                "must be finite.");
        }

        return TransactionCostResult{
            notionalValue,
            fixedCommissionCost,
            percentageCommissionCost,
            spreadCost,
            slippageCost,
            totalCost};
    }

} // namespace quantpulse::domain::transaction_cost