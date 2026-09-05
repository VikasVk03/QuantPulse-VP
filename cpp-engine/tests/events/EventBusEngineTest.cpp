#include "quantpulse/domain/events/EventBusEngine.hpp"

#include <gtest/gtest.h>

#include <stdexcept>
#include <string>

using quantpulse::domain::events::EventBusEngine;

TEST(EventBusEngineTest, InitiallyHasNoSubscribers)
{
    EventBusEngine bus;

    EXPECT_EQ(
        bus.subscriberCount("ORDER_FILLED"),
        0U);

    EXPECT_EQ(
        bus.eventTypeCount(),
        0U);
}

TEST(EventBusEngineTest, SubscribeRegistersHandler)
{
    EventBusEngine bus;

    bus.subscribe(
        "ORDER_FILLED",
        [](const std::string &) {});

    EXPECT_EQ(
        bus.subscriberCount("ORDER_FILLED"),
        1U);

    EXPECT_EQ(
        bus.eventTypeCount(),
        1U);
}

TEST(EventBusEngineTest, MultipleSubscribersCanBeRegistered)
{
    EventBusEngine bus;

    bus.subscribe(
        "ORDER_FILLED",
        [](const std::string &) {});

    bus.subscribe(
        "ORDER_FILLED",
        [](const std::string &) {});

    EXPECT_EQ(
        bus.subscriberCount("ORDER_FILLED"),
        2U);
}

TEST(EventBusEngineTest, DifferentEventTypesAreTrackedSeparately)
{
    EventBusEngine bus;

    bus.subscribe(
        "ORDER_FILLED",
        [](const std::string &) {});

    bus.subscribe(
        "ORDER_CANCELLED",
        [](const std::string &) {});

    EXPECT_EQ(
        bus.subscriberCount("ORDER_FILLED"),
        1U);

    EXPECT_EQ(
        bus.subscriberCount("ORDER_CANCELLED"),
        1U);

    EXPECT_EQ(
        bus.eventTypeCount(),
        2U);
}

TEST(EventBusEngineTest, PublishInvokesSubscriber)
{
    EventBusEngine bus;

    bool called = false;

    bus.subscribe(
        "ORDER_FILLED",
        [&called](const std::string &)
        {
            called = true;
        });

    bus.publish(
        "ORDER_FILLED",
        "order-123");

    EXPECT_TRUE(called);
}

TEST(EventBusEngineTest, PublishPassesPayloadToSubscriber)
{
    EventBusEngine bus;

    std::string receivedPayload;

    bus.subscribe(
        "ORDER_FILLED",
        [&receivedPayload](const std::string &payload)
        {
            receivedPayload = payload;
        });

    bus.publish(
        "ORDER_FILLED",
        "order-123");

    EXPECT_EQ(
        receivedPayload,
        "order-123");
}

TEST(EventBusEngineTest, PublishInvokesAllSubscribers)
{
    EventBusEngine bus;

    int invocationCount = 0;

    bus.subscribe(
        "MARKET_UPDATE",
        [&invocationCount](const std::string &)
        {
            ++invocationCount;
        });

    bus.subscribe(
        "MARKET_UPDATE",
        [&invocationCount](const std::string &)
        {
            ++invocationCount;
        });

    bus.subscribe(
        "MARKET_UPDATE",
        [&invocationCount](const std::string &)
        {
            ++invocationCount;
        });

    bus.publish(
        "MARKET_UPDATE",
        "price=100.0");

    EXPECT_EQ(
        invocationCount,
        3);
}

TEST(EventBusEngineTest, PublishingUnknownEventDoesNothing)
{
    EventBusEngine bus;

    bool called = false;

    bus.subscribe(
        "ORDER_FILLED",
        [&called](const std::string &)
        {
            called = true;
        });

    bus.publish(
        "UNKNOWN_EVENT",
        "payload");

    EXPECT_FALSE(called);
}

TEST(EventBusEngineTest, EmptyEventTypeIsRejectedOnSubscribe)
{
    EventBusEngine bus;

    EXPECT_THROW(
        bus.subscribe(
            "",
            [](const std::string &) {}),
        std::invalid_argument);
}

TEST(EventBusEngineTest, EmptyEventTypeIsRejectedOnPublish)
{
    EventBusEngine bus;

    EXPECT_THROW(
        bus.publish(
            "",
            "payload"),
        std::invalid_argument);
}

TEST(EventBusEngineTest, EmptyHandlerIsRejected)
{
    EventBusEngine bus;

    EXPECT_THROW(
        bus.subscribe(
            "ORDER_FILLED",
            {}),
        std::invalid_argument);
}

TEST(EventBusEngineTest, SubscriberCountForUnknownEventIsZero)
{
    EventBusEngine bus;

    EXPECT_EQ(
        bus.subscriberCount("DOES_NOT_EXIST"),
        0U);
}

TEST(EventBusEngineTest, ClearRemovesAllSubscribers)
{
    EventBusEngine bus;

    bus.subscribe(
        "ORDER_FILLED",
        [](const std::string &) {});

    bus.subscribe(
        "MARKET_UPDATE",
        [](const std::string &) {});

    bus.clear();

    EXPECT_EQ(
        bus.eventTypeCount(),
        0U);

    EXPECT_EQ(
        bus.subscriberCount("ORDER_FILLED"),
        0U);

    EXPECT_EQ(
        bus.subscriberCount("MARKET_UPDATE"),
        0U);
}

TEST(EventBusEngineTest, ClearPreventsFutureInvocation)
{
    EventBusEngine bus;

    bool called = false;

    bus.subscribe(
        "ORDER_FILLED",
        [&called](const std::string &)
        {
            called = true;
        });

    bus.clear();

    bus.publish(
        "ORDER_FILLED",
        "payload");

    EXPECT_FALSE(called);
}

TEST(EventBusEngineTest, SubscribersReceiveEventsInRegistrationOrder)
{
    EventBusEngine bus;

    std::string sequence;

    bus.subscribe(
        "TEST",
        [&sequence](const std::string &)
        {
            sequence += "A";
        });

    bus.subscribe(
        "TEST",
        [&sequence](const std::string &)
        {
            sequence += "B";
        });

    bus.subscribe(
        "TEST",
        [&sequence](const std::string &)
        {
            sequence += "C";
        });

    bus.publish(
        "TEST",
        "payload");

    EXPECT_EQ(
        sequence,
        "ABC");
}