#pragma once

#include <cstdint>

namespace quantpulse::domain::latency
{
    struct LatencyConfig
    {
        std::int64_t marketDataLatencyNs = 0;
        std::int64_t signalLatencyNs = 0;
        std::int64_t orderLatencyNs = 0;
        std::int64_t executionLatencyNs = 0;
    };

    struct LatencyBreakdown
    {
        std::int64_t marketDataLatencyNs = 0;
        std::int64_t signalLatencyNs = 0;
        std::int64_t orderLatencyNs = 0;
        std::int64_t executionLatencyNs = 0;
        std::int64_t totalLatencyNs = 0;
    };

    class LatencyEngine
    {
    public:
        LatencyEngine() = default;

        explicit LatencyEngine(
            const LatencyConfig &config);

        void configure(
            const LatencyConfig &config);

        [[nodiscard]]
        const LatencyConfig &config() const noexcept;

        [[nodiscard]]
        LatencyBreakdown calculate() const noexcept;

        [[nodiscard]]
        std::int64_t totalLatencyNs() const noexcept;

        void reset() noexcept;

    private:
        LatencyConfig config_{};
    };
}