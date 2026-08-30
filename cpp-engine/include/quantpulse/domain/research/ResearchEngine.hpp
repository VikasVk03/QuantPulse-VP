#pragma once

#include "quantpulse/domain/performance/PerformanceEngine.hpp"

#include <cstddef>
#include <vector>

namespace quantpulse::domain::research
{

    struct ResearchObservation
    {
        double price;
        double volume;

        double bidPrice;
        double askPrice;

        double bidVolume;
        double askVolume;

        double tradeBuyVolume;
        double tradeSellVolume;
    };

    struct ResearchConfig
    {
        std::size_t featureWindow = 20;

        double entryThreshold = 0.25;
        double exitThreshold = -0.25;

        double initialCapital = 100000.0;
        double transactionCostRate = 0.001;

        double periodsPerYear = 252.0;
        double riskFreeRate = 0.0;
    };

    struct ResearchResult
    {
        std::vector<double> signals;

        std::vector<double> strategySignals;

        performance::PerformanceReport performance;
    };

    class ResearchEngine
    {
    public:
        /**
         * @brief Run the complete quantitative research pipeline.
         *
         * The pipeline:
         *
         * Market data
         *     ->
         * Feature generation
         *     ->
         * Signal generation
         *     ->
         * Strategy decisions
         *     ->
         * Backtesting
         *     ->
         * Performance evaluation
         *
         * @param observations Historical market observations.
         * @param config Research and strategy configuration.
         *
         * @return Complete quantitative research result.
         *
         * @throw std::invalid_argument if observations or
         * configuration are invalid.
         */
        [[nodiscard]]
        static ResearchResult run(
            const std::vector<ResearchObservation> &observations,
            const ResearchConfig &config = {});
    };

} // namespace quantpulse::domain::research