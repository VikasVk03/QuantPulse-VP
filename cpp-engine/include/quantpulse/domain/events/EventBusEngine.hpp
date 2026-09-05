#pragma once

#include <cstddef>
#include <functional>
#include <string>
#include <unordered_map>
#include <vector>

namespace quantpulse::domain::events
{
    using EventHandler =
        std::function<void(const std::string &)>;

    class EventBusEngine
    {
    public:
        EventBusEngine() = default;

        void subscribe(
            const std::string &eventType,
            EventHandler handler);

        void publish(
            const std::string &eventType,
            const std::string &payload) const;

        [[nodiscard]]
        std::size_t subscriberCount(
            const std::string &eventType) const noexcept;

        [[nodiscard]]
        std::size_t eventTypeCount() const noexcept;

        void clear() noexcept;

    private:
        std::unordered_map<
            std::string,
            std::vector<EventHandler>>
            handlers_;
    };
}