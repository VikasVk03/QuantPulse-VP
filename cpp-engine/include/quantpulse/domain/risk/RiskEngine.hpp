#pragma once

#include <vector>

namespace quantpulse::domain::risk
{

    class RiskEngine
    {
    public:
        /**
         * @brief Calculate the Sharpe ratio of a return series.
         *
         * @param returns Return observations.
         * @param riskFreeRate Risk-free return per observation period.
         *
         * @return Sharpe ratio.
         *
         * @throw std::invalid_argument if the return series is invalid
         *        or has zero standard deviation.
         */
        [[nodiscard]]
        static double sharpeRatio(
            const std::vector<double> &returns,
            double riskFreeRate);

        /**
         * @brief Calculate the maximum drawdown of a return series.
         *
         * @param returns Return observations.
         *
         * @return Maximum drawdown expressed as a negative decimal value.
         *
         * @throw std::invalid_argument if the return series is empty
         *        or contains invalid returns.
         */
        [[nodiscard]]
        static double maximumDrawdown(
            const std::vector<double> &returns);

        /**
         * @brief Calculate downside deviation relative to a target return.
         *
         * Only returns below the target contribute to downside deviation.
         *
         * @param returns Return observations.
         * @param targetReturn Target return per observation period.
         *
         * @return Downside deviation.
         *
         * @throw std::invalid_argument if the return series is empty
         *        or contains invalid values.
         */
        [[nodiscard]]
        static double downsideDeviation(
            const std::vector<double> &returns,
            double targetReturn);
    };

} // namespace quantpulse::domain::risk