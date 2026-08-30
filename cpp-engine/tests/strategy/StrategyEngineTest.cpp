#include "quantpulse/domain/strategy/StrategyEngine.hpp"

#include <gtest/gtest.h>

#include <limits>
#include <stdexcept>

namespace quantpulse::domain::strategy
{

    TEST(StrategyEngineTest, EntersLongWhenSignalExceedsEntryThreshold)
    {
        const auto decision =
            StrategyEngine::evaluate(
                0.8,
                Position::Flat,
                0.7,
                0.3);

        EXPECT_EQ(
            decision.action,
            StrategyAction::EnterLong);

        EXPECT_EQ(
            decision.nextPosition,
            Position::Long);
    }

    TEST(StrategyEngineTest, HoldsFlatWhenSignalIsBelowEntryThreshold)
    {
        const auto decision =
            StrategyEngine::evaluate(
                0.5,
                Position::Flat,
                0.7,
                0.3);

        EXPECT_EQ(
            decision.action,
            StrategyAction::Hold);

        EXPECT_EQ(
            decision.nextPosition,
            Position::Flat);
    }

    TEST(StrategyEngineTest, ExitsLongWhenSignalFallsBelowExitThreshold)
    {
        const auto decision =
            StrategyEngine::evaluate(
                0.2,
                Position::Long,
                0.7,
                0.3);

        EXPECT_EQ(
            decision.action,
            StrategyAction::ExitLong);

        EXPECT_EQ(
            decision.nextPosition,
            Position::Flat);
    }

    TEST(StrategyEngineTest, HoldsLongWhenSignalRemainsAboveExitThreshold)
    {
        const auto decision =
            StrategyEngine::evaluate(
                0.5,
                Position::Long,
                0.7,
                0.3);

        EXPECT_EQ(
            decision.action,
            StrategyAction::Hold);

        EXPECT_EQ(
            decision.nextPosition,
            Position::Long);
    }

    TEST(StrategyEngineTest, DoesNotEnterAtExactEntryThreshold)
    {
        const auto decision =
            StrategyEngine::evaluate(
                0.7,
                Position::Flat,
                0.7,
                0.3);

        EXPECT_EQ(
            decision.action,
            StrategyAction::Hold);

        EXPECT_EQ(
            decision.nextPosition,
            Position::Flat);
    }

    TEST(StrategyEngineTest, DoesNotExitAtExactExitThreshold)
    {
        const auto decision =
            StrategyEngine::evaluate(
                0.3,
                Position::Long,
                0.7,
                0.3);

        EXPECT_EQ(
            decision.action,
            StrategyAction::Hold);

        EXPECT_EQ(
            decision.nextPosition,
            Position::Long);
    }

    TEST(StrategyEngineTest, UsesHysteresisCorrectly)
    {
        /*
         * Entry threshold = 0.7
         * Exit threshold  = 0.3
         *
         * A signal of 0.5 should:
         *
         * Flat -> remain Flat
         * Long -> remain Long
         */

        const auto flatDecision =
            StrategyEngine::evaluate(
                0.5,
                Position::Flat,
                0.7,
                0.3);

        const auto longDecision =
            StrategyEngine::evaluate(
                0.5,
                Position::Long,
                0.7,
                0.3);

        EXPECT_EQ(
            flatDecision.action,
            StrategyAction::Hold);

        EXPECT_EQ(
            flatDecision.nextPosition,
            Position::Flat);

        EXPECT_EQ(
            longDecision.action,
            StrategyAction::Hold);

        EXPECT_EQ(
            longDecision.nextPosition,
            Position::Long);
    }

    TEST(StrategyEngineTest, ThrowsForNaNSignal)
    {
        EXPECT_THROW(
            StrategyEngine::evaluate(
                std::numeric_limits<double>::quiet_NaN(),
                Position::Flat,
                0.7,
                0.3),
            std::invalid_argument);
    }

    TEST(StrategyEngineTest, ThrowsForInfiniteSignal)
    {
        EXPECT_THROW(
            StrategyEngine::evaluate(
                std::numeric_limits<double>::infinity(),
                Position::Flat,
                0.7,
                0.3),
            std::invalid_argument);
    }

    TEST(StrategyEngineTest, ThrowsForNaNEntryThreshold)
    {
        EXPECT_THROW(
            StrategyEngine::evaluate(
                0.8,
                Position::Flat,
                std::numeric_limits<double>::quiet_NaN(),
                0.3),
            std::invalid_argument);
    }

    TEST(StrategyEngineTest, ThrowsForNaNExitThreshold)
    {
        EXPECT_THROW(
            StrategyEngine::evaluate(
                0.8,
                Position::Flat,
                0.7,
                std::numeric_limits<double>::quiet_NaN()),
            std::invalid_argument);
    }

    TEST(StrategyEngineTest, ThrowsWhenExitThresholdExceedsEntryThreshold)
    {
        EXPECT_THROW(
            StrategyEngine::evaluate(
                0.5,
                Position::Flat,
                0.3,
                0.7),
            std::invalid_argument);
    }

} // namespace quantpulse::domain::strategy