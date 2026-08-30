#pragma once

#include "quantpulse/domain/execution/ExecutionEngine.hpp"
#include "quantpulse/domain/risk_management/RiskManagementEngine.hpp"
#include "quantpulse/domain/sizing/PositionSizingEngine.hpp"
#include "quantpulse/domain/strategy/StrategyEngine.hpp"

namespace quantpulse::domain::trading
{

    struct TradingConfig
    {
        double entryThreshold = 0.25;
        double exitThreshold = -0.25;

        sizing::PositionSizingConfig sizingConfig{};

        risk_management::RiskManagementConfig
            riskManagementConfig{};
    };

    struct TradingRequest
    {
        double signal;

        strategy::Position currentPosition;

        double capital;

        double entryPrice;

        double stopPrice;

        double potentialLoss;

        double currentDrawdown;
    };

    struct TradingDecision
    {
        strategy::StrategyDecision
            strategyDecision;

        sizing::PositionSizingResult
            positionSizing;

        risk_management::RiskDecision
            riskDecision;

        execution::ExecutionDecision
            executionDecision;
    };

    class TradingEngine
    {
    public:
        /**
         * @brief Evaluate a complete trading decision.
         *
         * Pipeline:
         *
         * Signal
         *     ->
         * Strategy
         *     ->
         * Position sizing
         *     ->
         * Risk management
         *     ->
         * Execution
         *
         * A trade that fails risk management
         * will not be executed.
         *
         * @param request Current trading request.
         * @param config Trading configuration.
         *
         * @return Complete trading decision.
         *
         * @throw std::invalid_argument if the
         * request or configuration is invalid.
         */
        [[nodiscard]]
        static TradingDecision evaluate(
            const TradingRequest &request,
            const TradingConfig &config = {});
    };

} // namespace quantpulse::domain::trading