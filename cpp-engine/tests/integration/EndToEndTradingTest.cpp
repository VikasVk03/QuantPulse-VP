#include <gtest/gtest.h>

#include "quantpulse/domain/execution/ExecutionEngine.hpp"
#include "quantpulse/domain/latency/LatencyEngine.hpp"
#include "quantpulse/domain/matching/MatchingEngine.hpp"
#include "quantpulse/domain/microstructure/MarketMicrostructureEngine.hpp"
#include "quantpulse/domain/order_book/OrderBookEngine.hpp"
#include "quantpulse/domain/orders/OrderManagementEngine.hpp"
#include "quantpulse/domain/portfolio_state/PortfolioStateEngine.hpp"
#include "quantpulse/domain/position/PositionEngine.hpp"
#include "quantpulse/domain/risk/RiskIntelligenceEngine.hpp"
#include "quantpulse/domain/risk_management/RiskManagementEngine.hpp"
#include "quantpulse/domain/sizing/PositionSizingEngine.hpp"
#include "quantpulse/domain/strategy/StrategyEngine.hpp"
#include "quantpulse/domain/trading/TradingEngine.hpp"
#include "quantpulse/domain/transaction_cost/TransactionCostEngine.hpp"

namespace
{

    TEST(EndToEndTradingTest, LongEntryFlowsThroughTradingPipeline)
    {
        using quantpulse::domain::execution::ExecutionEngine;
        using quantpulse::domain::execution::ExecutionStatus;
        using quantpulse::domain::latency::LatencyConfig;
        using quantpulse::domain::latency::LatencyEngine;
        using quantpulse::domain::matching::MatchingEngine;
        using quantpulse::domain::matching::MatchRequest;
        using MatchSide = quantpulse::domain::matching::OrderSide;
        using quantpulse::domain::order_book::OrderBookEngine;
        using quantpulse::domain::orders::OrderManagementEngine;
        using OrderSide = quantpulse::domain::orders::OrderSide;
        using quantpulse::domain::orders::OrderStatus;
        using quantpulse::domain::portfolio_state::PortfolioStateEngine;
        using quantpulse::domain::position::PositionEngine;
        using StrategyPosition = quantpulse::domain::strategy::Position;
        using quantpulse::domain::strategy::StrategyAction;
        using quantpulse::domain::trading::TradingConfig;
        using quantpulse::domain::trading::TradingEngine;
        using quantpulse::domain::trading::TradingRequest;
        using quantpulse::domain::transaction_cost::TransactionCostConfig;
        using quantpulse::domain::transaction_cost::TransactionCostEngine;

        // ------------------------------------------------------------
        // 1. Market / Order Book Initialization
        // ------------------------------------------------------------
        OrderBookEngine book;

        book.updateBid(99.0, 10.0);
        book.updateBid(98.5, 20.0);
        book.updateAsk(100.0, 10.0);
        book.updateAsk(101.0, 20.0);

        ASSERT_GT(book.askLevelCount(), 0U);
        ASSERT_GT(book.bidLevelCount(), 0U);
        EXPECT_DOUBLE_EQ(book.bestBid(), 99.0);
        EXPECT_DOUBLE_EQ(book.bestAsk(), 100.0);
        EXPECT_DOUBLE_EQ(book.spread(), 1.0);
        EXPECT_DOUBLE_EQ(book.midPrice(), 99.5);

        // ------------------------------------------------------------
        // 2. Trading Decision (Signal -> Strategy -> Sizing -> Risk -> Execution)
        // ------------------------------------------------------------
        TradingRequest request{
            0.50,                   // Strong positive signal > entryThreshold (0.25)
            StrategyPosition::Flat, // Currently Flat
            100000.0,               // Portfolio capital: $100,000
            100.0,                  // Expected entry price
            95.0,                   // Stop price
            500.0,                  // Potential loss
            0.02                    // Current drawdown: 2%
        };

        TradingConfig config{};
        config.entryThreshold = 0.25;
        config.exitThreshold = -0.25;
        config.sizingConfig.allocationFraction = 0.025; // 2.5% of $100,000 = $2,500
        config.riskManagementConfig.maximumPositionFraction = 0.20;
        config.riskManagementConfig.maximumDrawdownFraction = 0.15;

        const auto decision = TradingEngine::evaluate(request, config);

        // Verify Strategy Decision
        EXPECT_EQ(decision.strategyDecision.action, StrategyAction::EnterLong);
        EXPECT_EQ(decision.strategyDecision.nextPosition, StrategyPosition::Long);

        // Verify Position Sizing: allocatedCapital = 100000 * 0.025 = 2500, quantity = 2500 / 100 = 25
        EXPECT_DOUBLE_EQ(decision.positionSizing.allocatedCapital, 2500.0);
        EXPECT_DOUBLE_EQ(decision.positionSizing.quantity, 25.0);
        EXPECT_DOUBLE_EQ(decision.positionSizing.positionValue, 2500.0);

        // Verify Risk Decision
        EXPECT_TRUE(decision.riskDecision.allowed);
        EXPECT_FALSE(decision.riskDecision.positionLimitExceeded);
        EXPECT_FALSE(decision.riskDecision.drawdownLimitExceeded);

        // Verify Execution Decision
        EXPECT_TRUE(decision.executionDecision.shouldExecute);
        EXPECT_EQ(decision.executionDecision.orderSide, quantpulse::domain::execution::OrderSide::Buy);

        // ------------------------------------------------------------
        // 3. Order Management Lifecycle
        // ------------------------------------------------------------
        const std::size_t orderId = 1001;
        auto order = OrderManagementEngine::create(
            orderId,
            OrderSide::Buy,
            decision.positionSizing.quantity,
            request.entryPrice);

        EXPECT_EQ(order.id, orderId);
        EXPECT_EQ(order.side, OrderSide::Buy);
        EXPECT_DOUBLE_EQ(order.quantity, 25.0);
        EXPECT_DOUBLE_EQ(order.filledQuantity, 0.0);
        EXPECT_EQ(order.status, OrderStatus::Created);

        order = OrderManagementEngine::submit(order);
        EXPECT_EQ(order.status, OrderStatus::Submitted);

        order = OrderManagementEngine::accept(order);
        EXPECT_EQ(order.status, OrderStatus::Accepted);

        // ------------------------------------------------------------
        // 4. Order Book Matching (Multi-Level)
        // ------------------------------------------------------------
        MatchingEngine matcher;
        const MatchRequest matchRequest{
            MatchSide::Buy,
            order.quantity};

        const auto matchResult = matcher.match(book, matchRequest);

        EXPECT_DOUBLE_EQ(matchResult.requestedQuantity, 25.0);
        EXPECT_DOUBLE_EQ(matchResult.filledQuantity, 25.0);
        EXPECT_DOUBLE_EQ(matchResult.remainingQuantity, 0.0);
        ASSERT_EQ(matchResult.fills.size(), 2U);

        // Level 1: 10 units @ 100.0
        EXPECT_DOUBLE_EQ(matchResult.fills[0].price, 100.0);
        EXPECT_DOUBLE_EQ(matchResult.fills[0].quantity, 10.0);

        // Level 2: 15 units @ 101.0
        EXPECT_DOUBLE_EQ(matchResult.fills[1].price, 101.0);
        EXPECT_DOUBLE_EQ(matchResult.fills[1].quantity, 15.0);

        // Weighted Average Fill Price: (10 * 100.0 + 15 * 101.0) / 25 = 2515 / 25 = 100.6
        EXPECT_NEAR(matchResult.averageFillPrice, 100.6, 1e-9);

        // ------------------------------------------------------------
        // 5. Execution Engine Processing
        // ------------------------------------------------------------
        const auto executionReport = ExecutionEngine::process(matchResult);

        EXPECT_DOUBLE_EQ(executionReport.requestedQuantity, 25.0);
        EXPECT_DOUBLE_EQ(executionReport.executedQuantity, 25.0);
        EXPECT_DOUBLE_EQ(executionReport.remainingQuantity, 0.0);
        EXPECT_NEAR(executionReport.averageExecutionPrice, 100.6, 1e-9);
        EXPECT_EQ(executionReport.status, ExecutionStatus::Filled);

        // Update Order with fill
        order = OrderManagementEngine::fill(order, executionReport.executedQuantity);
        EXPECT_EQ(order.status, OrderStatus::Filled);
        EXPECT_DOUBLE_EQ(order.filledQuantity, 25.0);

        // ------------------------------------------------------------
        // 6. Realistic Execution Frictions: Costs & Latency
        // ------------------------------------------------------------
        TransactionCostConfig costConfig{};
        costConfig.fixedCommission = 2.0;     // $2 per trade
        costConfig.commissionRate = 0.0005;   // 0.05%
        costConfig.spreadFraction = 0.001;    // 0.1% spread
        costConfig.slippageFraction = 0.0004; // 0.04% slippage

        const auto costResult = TransactionCostEngine::calculate(
            executionReport.executedQuantity,
            executionReport.averageExecutionPrice,
            costConfig);

        const double expectedNotional = 25.0 * 100.6; // 2515.0
        EXPECT_DOUBLE_EQ(costResult.notionalValue, expectedNotional);
        EXPECT_DOUBLE_EQ(costResult.fixedCommissionCost, 2.0);
        EXPECT_NEAR(costResult.percentageCommissionCost, expectedNotional * 0.0005, 1e-9);
        EXPECT_GT(costResult.totalCost, 0.0);

        // Latency simulation
        LatencyConfig latencyConfig{};
        latencyConfig.marketDataLatencyNs = 50'000; // 50 us
        latencyConfig.signalLatencyNs = 10'000;     // 10 us
        latencyConfig.orderLatencyNs = 150'000;     // 150 us
        latencyConfig.executionLatencyNs = 200'000; // 200 us

        const LatencyEngine latencyEngine(latencyConfig);
        const auto latency = latencyEngine.calculate();
        EXPECT_EQ(latency.totalLatencyNs, 410'000);

        // ------------------------------------------------------------
        // 7. Position Tracking
        // ------------------------------------------------------------
        PositionEngine position;
        position.buy(
            executionReport.executedQuantity,
            executionReport.averageExecutionPrice);

        EXPECT_FALSE(position.isFlat());
        EXPECT_DOUBLE_EQ(position.state().quantity, 25.0);
        EXPECT_NEAR(position.state().averageEntryPrice, 100.6, 1e-9);
        EXPECT_DOUBLE_EQ(position.state().realizedPnL, 0.0);

        // Mark to market snapshot at 102.0
        const auto positionSnap = position.snapshot(102.0);
        EXPECT_DOUBLE_EQ(positionSnap.quantity, 25.0);
        EXPECT_NEAR(positionSnap.averageEntryPrice, 100.6, 1e-9);
        EXPECT_DOUBLE_EQ(positionSnap.marketPrice, 102.0);
        EXPECT_DOUBLE_EQ(positionSnap.marketValue, 25.0 * 102.0);
        EXPECT_NEAR(positionSnap.unrealizedPnL, 25.0 * (102.0 - 100.6), 1e-9);
        EXPECT_NEAR(positionSnap.totalPnL, positionSnap.unrealizedPnL, 1e-9);

        // ------------------------------------------------------------
        // 8. Portfolio State Tracking
        // ------------------------------------------------------------
        auto portfolioState = PortfolioStateEngine::initialize(100000.0);
        EXPECT_DOUBLE_EQ(portfolioState.cash, 100000.0);

        portfolioState = PortfolioStateEngine::buy(
            portfolioState,
            executionReport.executedQuantity,
            executionReport.averageExecutionPrice);

        EXPECT_NEAR(portfolioState.cash, 100000.0 - expectedNotional, 1e-9);
        EXPECT_DOUBLE_EQ(portfolioState.quantity, 25.0);
        EXPECT_NEAR(portfolioState.averageEntryPrice, 100.6, 1e-9);

        const auto portfolioSnap = PortfolioStateEngine::snapshot(portfolioState, 102.0);
        EXPECT_NEAR(portfolioSnap.totalEquity, portfolioState.cash + (25.0 * 102.0), 1e-9);
        EXPECT_NEAR(portfolioSnap.unrealizedPnL, 25.0 * (102.0 - 100.6), 1e-9);
    }

    TEST(EndToEndTradingTest, LongExitRealizesProfitAndUpdatesPortfolio)
    {
        using quantpulse::domain::execution::ExecutionEngine;
        using quantpulse::domain::execution::ExecutionStatus;
        using quantpulse::domain::matching::MatchingEngine;
        using quantpulse::domain::matching::MatchRequest;
        using MatchSide = quantpulse::domain::matching::OrderSide;
        using quantpulse::domain::order_book::OrderBookEngine;
        using quantpulse::domain::orders::OrderManagementEngine;
        using OrderSide = quantpulse::domain::orders::OrderSide;
        using quantpulse::domain::orders::OrderStatus;
        using quantpulse::domain::portfolio_state::PortfolioStateEngine;
        using quantpulse::domain::position::PositionEngine;
        using StrategyPosition = quantpulse::domain::strategy::Position;
        using quantpulse::domain::strategy::StrategyAction;
        using quantpulse::domain::trading::TradingConfig;
        using quantpulse::domain::trading::TradingEngine;
        using quantpulse::domain::trading::TradingRequest;

        // Existing position: Long 25 units @ 100.6 entry price
        PositionEngine position;
        position.buy(25.0, 100.6);

        auto portfolioState = PortfolioStateEngine::initialize(100000.0);
        portfolioState = PortfolioStateEngine::buy(portfolioState, 25.0, 100.6);

        // Order Book has bid depth at 105.0
        OrderBookEngine book;
        book.updateBid(105.0, 30.0);
        book.updateAsk(106.0, 20.0);

        // Negative signal triggers Long Exit
        TradingRequest exitRequest{
            -0.40,                  // Signal < exitThreshold (-0.25)
            StrategyPosition::Long, // Currently Long
            portfolioState.cash,
            105.0,
            100.0,
            200.0,
            0.0};

        TradingConfig config{};
        config.entryThreshold = 0.25;
        config.exitThreshold = -0.25;

        const auto decision = TradingEngine::evaluate(exitRequest, config);

        EXPECT_EQ(decision.strategyDecision.action, StrategyAction::ExitLong);
        EXPECT_EQ(decision.strategyDecision.nextPosition, StrategyPosition::Flat);
        EXPECT_TRUE(decision.executionDecision.shouldExecute);
        EXPECT_EQ(decision.executionDecision.orderSide, quantpulse::domain::execution::OrderSide::Sell);

        // Create, submit, accept sell order
        const std::size_t sellOrderId = 1002;
        auto sellOrder = OrderManagementEngine::create(
            sellOrderId,
            OrderSide::Sell,
            position.state().quantity,
            105.0);

        sellOrder = OrderManagementEngine::submit(sellOrder);
        sellOrder = OrderManagementEngine::accept(sellOrder);

        // Match against bid book
        MatchingEngine matcher;
        const MatchRequest matchRequest{
            MatchSide::Sell,
            sellOrder.quantity};

        const auto matchResult = matcher.match(book, matchRequest);
        EXPECT_DOUBLE_EQ(matchResult.filledQuantity, 25.0);
        EXPECT_DOUBLE_EQ(matchResult.remainingQuantity, 0.0);
        EXPECT_DOUBLE_EQ(matchResult.averageFillPrice, 105.0);

        // Process Execution
        const auto executionReport = ExecutionEngine::process(matchResult);
        EXPECT_EQ(executionReport.status, ExecutionStatus::Filled);

        sellOrder = OrderManagementEngine::fill(sellOrder, executionReport.executedQuantity);
        EXPECT_EQ(sellOrder.status, OrderStatus::Filled);

        // Apply Sell to Position
        position.sell(
            executionReport.executedQuantity,
            executionReport.averageExecutionPrice);

        EXPECT_TRUE(position.isFlat());
        EXPECT_DOUBLE_EQ(position.state().quantity, 0.0);
        const double expectedRealizedPnL = 25.0 * (105.0 - 100.6); // 110.0
        EXPECT_NEAR(position.state().realizedPnL, expectedRealizedPnL, 1e-9);

        // Apply Sell to Portfolio
        portfolioState = PortfolioStateEngine::sell(
            portfolioState,
            executionReport.executedQuantity,
            executionReport.averageExecutionPrice);

        EXPECT_DOUBLE_EQ(portfolioState.quantity, 0.0);
        EXPECT_NEAR(portfolioState.realizedPnL, expectedRealizedPnL, 1e-9);
        EXPECT_NEAR(portfolioState.cash, 100000.0 + expectedRealizedPnL, 1e-9);
    }

    TEST(EndToEndTradingTest, RiskLimitsRejectAdverseTrade)
    {
        using quantpulse::domain::orders::OrderManagementEngine;
        using OrderSide = quantpulse::domain::orders::OrderSide;
        using quantpulse::domain::orders::OrderStatus;
        using StrategyPosition = quantpulse::domain::strategy::Position;
        using quantpulse::domain::strategy::StrategyAction;
        using quantpulse::domain::trading::TradingConfig;
        using quantpulse::domain::trading::TradingEngine;
        using quantpulse::domain::trading::TradingRequest;

        // Portfolio is in severe drawdown (20% > max allowed 15%)
        TradingRequest request{
            0.60,                   // Strong buy signal
            StrategyPosition::Flat, // Flat
            100000.0,
            100.0,
            95.0,
            500.0,
            0.20 // 20% drawdown breaches 15% limit!
        };

        TradingConfig config{};
        config.riskManagementConfig.maximumDrawdownFraction = 0.15;

        const auto decision = TradingEngine::evaluate(request, config);

        // Strategy wants to enter, but Risk blocks it
        EXPECT_EQ(decision.strategyDecision.action, StrategyAction::EnterLong);
        EXPECT_FALSE(decision.riskDecision.allowed);
        EXPECT_TRUE(decision.riskDecision.drawdownLimitExceeded);
        EXPECT_FALSE(decision.executionDecision.shouldExecute);

        // Order is created and submitted, but rejected due to risk check
        const std::size_t orderId = 1003;
        auto order = OrderManagementEngine::create(
            orderId,
            OrderSide::Buy,
            decision.positionSizing.quantity,
            request.entryPrice);

        order = OrderManagementEngine::submit(order);
        order = OrderManagementEngine::reject(order);

        EXPECT_EQ(order.status, OrderStatus::Rejected);
        EXPECT_DOUBLE_EQ(order.filledQuantity, 0.0);
    }

    TEST(EndToEndTradingTest, PartialFillHandlesInsufficientLiquidity)
    {
        using quantpulse::domain::execution::ExecutionEngine;
        using quantpulse::domain::execution::ExecutionStatus;
        using quantpulse::domain::matching::MatchingEngine;
        using quantpulse::domain::matching::MatchRequest;
        using MatchSide = quantpulse::domain::matching::OrderSide;
        using quantpulse::domain::order_book::OrderBookEngine;
        using quantpulse::domain::orders::OrderManagementEngine;
        using OrderSide = quantpulse::domain::orders::OrderSide;
        using quantpulse::domain::orders::OrderStatus;
        using quantpulse::domain::position::PositionEngine;

        // Order book has only 10 units at ask 100.0
        OrderBookEngine book;
        book.updateAsk(100.0, 10.0);

        // Trader wants 25 units
        const std::size_t orderId = 1004;
        auto order = OrderManagementEngine::create(
            orderId,
            OrderSide::Buy,
            25.0,
            100.0);

        order = OrderManagementEngine::submit(order);
        order = OrderManagementEngine::accept(order);

        MatchingEngine matcher;
        const MatchRequest matchRequest{
            MatchSide::Buy,
            order.quantity};

        const auto matchResult = matcher.match(book, matchRequest);

        EXPECT_DOUBLE_EQ(matchResult.requestedQuantity, 25.0);
        EXPECT_DOUBLE_EQ(matchResult.filledQuantity, 10.0);
        EXPECT_DOUBLE_EQ(matchResult.remainingQuantity, 15.0);
        EXPECT_DOUBLE_EQ(matchResult.averageFillPrice, 100.0);

        // Process execution
        const auto executionReport = ExecutionEngine::process(matchResult);
        EXPECT_EQ(executionReport.status, ExecutionStatus::PartiallyFilled);
        EXPECT_DOUBLE_EQ(executionReport.executedQuantity, 10.0);
        EXPECT_DOUBLE_EQ(executionReport.remainingQuantity, 15.0);

        // Order is partially filled
        order = OrderManagementEngine::fill(order, executionReport.executedQuantity);
        EXPECT_EQ(order.status, OrderStatus::PartiallyFilled);
        EXPECT_DOUBLE_EQ(order.filledQuantity, 10.0);

        // Position accurately accounts for partial fill
        PositionEngine position;
        position.buy(
            executionReport.executedQuantity,
            executionReport.averageExecutionPrice);

        EXPECT_DOUBLE_EQ(position.state().quantity, 10.0);
        EXPECT_DOUBLE_EQ(position.state().averageEntryPrice, 100.0);
    }

    TEST(EndToEndTradingTest, MicrostructureRiskIntelligenceAdaptsPositionSizing)
    {
        using quantpulse::domain::execution::ExecutionEngine;
        using quantpulse::domain::execution::ExecutionStatus;
        using quantpulse::domain::matching::MatchingEngine;
        using quantpulse::domain::matching::MatchRequest;
        using MatchSide = quantpulse::domain::matching::OrderSide;
        using quantpulse::domain::microstructure::MarketMicrostructureEngine;
        using quantpulse::domain::order_book::OrderBookEngine;
        using quantpulse::domain::orders::OrderManagementEngine;
        using OrderSide = quantpulse::domain::orders::OrderSide;
        using quantpulse::domain::orders::OrderStatus;
        using quantpulse::domain::portfolio_state::PortfolioStateEngine;
        using quantpulse::domain::position::PositionEngine;
        using quantpulse::domain::risk::RiskIntelligenceEngine;
        using quantpulse::domain::risk::RiskIntelligenceInputs;
        using quantpulse::domain::risk::RiskLevel;
        using StrategyPosition = quantpulse::domain::strategy::Position;
        using quantpulse::domain::strategy::StrategyAction;
        using quantpulse::domain::trading::TradingConfig;
        using quantpulse::domain::trading::TradingEngine;
        using quantpulse::domain::trading::TradingRequest;

        // ------------------------------------------------------------
        // 1. Order Book with Hostile Microstructure: Wide Spread & Heavy Ask Depth
        // ------------------------------------------------------------
        OrderBookEngine book;
        book.updateBid(99.65, 10.0);
        book.updateBid(99.50, 15.0);
        book.updateAsk(100.00, 35.0);
        book.updateAsk(100.20, 50.0);

        const double bid = book.bestBid();
        const double ask = book.bestAsk();
        const double mid = book.midPrice();
        const double relSpread = MarketMicrostructureEngine::relativeSpread(bid, ask); // (100 - 99.65) / 99.825 = ~0.0035 (35 bps)

        const std::vector<double> bidVolumes{10.0, 15.0};
        const std::vector<double> askVolumes{35.0, 50.0};
        const double depthImbalance = MarketMicrostructureEngine::multiLevelDepthImbalance(bidVolumes, askVolumes); // (25 - 85) / 110 = -0.545

        const double microprice = MarketMicrostructureEngine::microprice(bid, ask, 10.0, 35.0);
        const double micropriceDrift = (microprice - mid) / mid;

        EXPECT_GT(relSpread, 0.0020);     // Spread > 20 bps (Elevated threshold)
        EXPECT_LT(depthImbalance, -0.50); // Severe sell pressure

        // ------------------------------------------------------------
        // 2. Risk Intelligence Evaluation
        // ------------------------------------------------------------
        RiskIntelligenceInputs riskInputs{};
        riskInputs.microstructure.spread = relSpread;
        riskInputs.microstructure.depthImbalance = depthImbalance;
        riskInputs.microstructure.micropriceDrift = micropriceDrift;
        riskInputs.volatility = 0.22;        // 22%
        riskInputs.currentDrawdown = 0.03;   // 3%
        riskInputs.portfolioExposure = 0.30; // 30%

        const auto riskReport = RiskIntelligenceEngine::evaluate(riskInputs);

        // Microstructure conditions trigger Elevated Risk!
        EXPECT_EQ(riskReport.level, RiskLevel::Elevated);
        EXPECT_DOUBLE_EQ(riskReport.sizingMultiplier, 0.60); // 60% sizing multiplier
        EXPECT_TRUE(riskReport.allowTrading);

        // ------------------------------------------------------------
        // 3. Strategy & Trading Decision
        // ------------------------------------------------------------
        TradingRequest request{
            0.40, // Signal > entryThreshold
            StrategyPosition::Flat,
            100000.0,
            ask,
            95.0,
            500.0,
            0.03};

        TradingConfig config{};
        config.sizingConfig.allocationFraction = 0.025; // Nominal: $2,500 / $100 = 25 units

        const auto decision = TradingEngine::evaluate(request, config);
        EXPECT_EQ(decision.strategyDecision.action, StrategyAction::EnterLong);
        EXPECT_DOUBLE_EQ(decision.positionSizing.quantity, 25.0);

        // ------------------------------------------------------------
        // 4. Adapt Position Sizing with Risk Intelligence Multiplier
        // ------------------------------------------------------------
        const double adaptedQuantity = std::floor(decision.positionSizing.quantity * riskReport.sizingMultiplier);
        EXPECT_DOUBLE_EQ(adaptedQuantity, 15.0); // Scaled from 25 down to 15 units

        // ------------------------------------------------------------
        // 5. Order Management & Matching for Adapted Size
        // ------------------------------------------------------------
        const std::size_t orderId = 2001;
        auto order = OrderManagementEngine::create(
            orderId,
            OrderSide::Buy,
            adaptedQuantity,
            ask);

        order = OrderManagementEngine::submit(order);
        order = OrderManagementEngine::accept(order);

        MatchingEngine matcher;
        const MatchRequest matchRequest{
            MatchSide::Buy,
            order.quantity};

        const auto matchResult = matcher.match(book, matchRequest);
        EXPECT_DOUBLE_EQ(matchResult.filledQuantity, 15.0);
        EXPECT_DOUBLE_EQ(matchResult.remainingQuantity, 0.0);

        const auto execReport = ExecutionEngine::process(matchResult);
        EXPECT_EQ(execReport.status, ExecutionStatus::Filled);
        EXPECT_DOUBLE_EQ(execReport.executedQuantity, 15.0);

        order = OrderManagementEngine::fill(order, execReport.executedQuantity);
        EXPECT_EQ(order.status, OrderStatus::Filled);

        // ------------------------------------------------------------
        // 6. Verified Position & Portfolio Update
        // ------------------------------------------------------------
        PositionEngine position;
        position.buy(execReport.executedQuantity, execReport.averageExecutionPrice);
        EXPECT_DOUBLE_EQ(position.state().quantity, 15.0);

        auto portfolioState = PortfolioStateEngine::initialize(100000.0);
        portfolioState = PortfolioStateEngine::buy(
            portfolioState,
            execReport.executedQuantity,
            execReport.averageExecutionPrice);

        EXPECT_DOUBLE_EQ(portfolioState.quantity, 15.0);
        EXPECT_NEAR(portfolioState.cash, 100000.0 - (15.0 * execReport.averageExecutionPrice), 1e-9);
    }

} // namespace