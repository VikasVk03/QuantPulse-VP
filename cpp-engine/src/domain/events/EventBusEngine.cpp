#include "quantpulse/domain/events/EventBusEngine.hpp"

#include <stdexcept>
#include <utility>

namespace quantpulse::domain::events
{
    void EventBusEngine::subscribe(
        const std::string &eventType,
        EventHandler handler)
    {
        if (eventType.empty())
        {
            throw std::invalid_argument(
                "Event type must not be empty.");
        }

        if (!handler)
        {
            throw std::invalid_argument(
                "Event handler must be valid.");
        }

        handlers_[eventType].push_back(
            std::move(handler));
    }

    void EventBusEngine::publish(
        const std::string &eventType,
        const std::string &payload) const
    {
        if (eventType.empty())
        {
            throw std::invalid_argument(
                "Event type must not be empty.");
        }

        const auto iterator =
            handlers_.find(eventType);

        if (iterator == handlers_.end())
        {
            return;
        }

        for (const auto &handler : iterator->second)
        {
            handler(payload);
        }
    }

    std::size_t EventBusEngine::subscriberCount(
        const std::string &eventType) const noexcept
    {
        const auto iterator =
            handlers_.find(eventType);

        if (iterator == handlers_.end())
        {
            return 0;
        }

        return iterator->second.size();
    }

    std::size_t EventBusEngine::eventTypeCount() const noexcept
    {
        return handlers_.size();
    }

    void EventBusEngine::clear() noexcept
    {
        handlers_.clear();
    }
}