#include "quantpulse/domain/latency/LatencyEngine.hpp"

#include <stdexcept>
#include <string>

namespace quantpulse::domain::latency
{
    namespace
    {
        void validateLatency(
            std::int64_t latency,
            const char *name)
        {
            if (latency < 0)
            {
                throw std::invalid_argument(
                    std::string(name) +
                    " must be non-negative.");
            }
        }

        void validateConfig(
            const LatencyConfig &config)
        {
            validateLatency(
                config.marketDataLatencyNs,
                "Market data latency");

            validateLatency(
                config.signalLatencyNs,
                "Signal latency");

            validateLatency(
                config.orderLatencyNs,
                "Order latency");

            validateLatency(
                config.executionLatencyNs,
                "Execution latency");
        }
    }

    LatencyEngine::LatencyEngine(
        const LatencyConfig &config)
    {
        configure(config);
    }

    void LatencyEngine::configure(
        const LatencyConfig &config)
    {
        validateConfig(config);

        config_ = config;
    }

    const LatencyConfig &
    LatencyEngine::config() const noexcept
    {
        return config_;
    }

    LatencyBreakdown
    LatencyEngine::calculate() const noexcept
    {
        const std::int64_t total =
            config_.marketDataLatencyNs +
            config_.signalLatencyNs +
            config_.orderLatencyNs +
            config_.executionLatencyNs;

        return LatencyBreakdown{
            config_.marketDataLatencyNs,
            config_.signalLatencyNs,
            config_.orderLatencyNs,
            config_.executionLatencyNs,
            total};
    }

    std::int64_t
    LatencyEngine::totalLatencyNs() const noexcept
    {
        return config_.marketDataLatencyNs +
               config_.signalLatencyNs +
               config_.orderLatencyNs +
               config_.executionLatencyNs;
    }

    void LatencyEngine::reset() noexcept
    {
        config_ = LatencyConfig{};
    }
}