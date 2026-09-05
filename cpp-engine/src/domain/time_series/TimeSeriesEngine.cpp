#include "quantpulse/domain/time_series/TimeSeriesEngine.hpp"

#include <cmath>
#include <stdexcept>

namespace quantpulse::domain::time_series
{
    void TimeSeriesEngine::append(
        std::int64_t timestamp,
        double value)
    {
        if (timestamp < 0)
        {
            throw std::invalid_argument(
                "Timestamp must be non-negative.");
        }

        if (!std::isfinite(value))
        {
            throw std::invalid_argument(
                "Value must be finite.");
        }

        if (!points_.empty() &&
            timestamp <= points_.back().timestamp)
        {
            throw std::invalid_argument(
                "Timestamp must be strictly increasing.");
        }

        points_.push_back(
            TimeSeriesPoint{
                timestamp,
                value});
    }

    const TimeSeriesPoint &
    TimeSeriesEngine::latest() const
    {
        if (points_.empty())
        {
            throw std::out_of_range(
                "Cannot access latest point of an empty time series.");
        }

        return points_.back();
    }

    const TimeSeriesPoint &
    TimeSeriesEngine::at(
        std::size_t index) const
    {
        if (index >= points_.size())
        {
            throw std::out_of_range(
                "Time series index is out of range.");
        }

        return points_[index];
    }

    std::size_t TimeSeriesEngine::size() const noexcept
    {
        return points_.size();
    }

    bool TimeSeriesEngine::empty() const noexcept
    {
        return points_.empty();
    }

    const std::vector<TimeSeriesPoint> &
    TimeSeriesEngine::data() const noexcept
    {
        return points_;
    }

    void TimeSeriesEngine::clear() noexcept
    {
        points_.clear();
    }
}