#pragma once

#include <cstddef>
#include <cstdint>
#include <vector>

namespace quantpulse::domain::time_series
{
    struct TimeSeriesPoint
    {
        std::int64_t timestamp = 0;
        double value = 0.0;
    };

    class TimeSeriesEngine
    {
    public:
        TimeSeriesEngine() = default;

        void append(
            std::int64_t timestamp,
            double value);

        [[nodiscard]]
        const TimeSeriesPoint &latest() const;

        [[nodiscard]]
        const TimeSeriesPoint &at(
            std::size_t index) const;

        [[nodiscard]]
        std::size_t size() const noexcept;

        [[nodiscard]]
        bool empty() const noexcept;

        [[nodiscard]]
        const std::vector<TimeSeriesPoint> &data()
            const noexcept;

        void clear() noexcept;

    private:
        std::vector<TimeSeriesPoint> points_;
    };
}