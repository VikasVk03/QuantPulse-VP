#include "quantpulse/domain/rolling_window/RollingWindowEngine.hpp"

#include <cmath>
#include <stdexcept>

namespace quantpulse::domain::rolling_window
{
    RollingWindowEngine::RollingWindowEngine(
        std::size_t capacity)
        : capacity_(capacity)
    {
        if (capacity == 0)
        {
            throw std::invalid_argument(
                "Rolling window capacity must be greater than zero.");
        }

        values_.reserve(capacity_);
    }

    void RollingWindowEngine::push(double value)
    {
        if (!std::isfinite(value))
        {
            throw std::invalid_argument(
                "Rolling window value must be finite.");
        }

        if (values_.size() == capacity_)
        {
            values_.erase(values_.begin());
        }

        values_.push_back(value);
    }

    double RollingWindowEngine::latest() const
    {
        if (values_.empty())
        {
            throw std::out_of_range(
                "Cannot access latest value of an empty rolling window.");
        }

        return values_.back();
    }

    double RollingWindowEngine::at(
        std::size_t index) const
    {
        if (index >= values_.size())
        {
            throw std::out_of_range(
                "Rolling window index is out of range.");
        }

        return values_[index];
    }

    std::size_t RollingWindowEngine::size() const noexcept
    {
        return values_.size();
    }

    std::size_t RollingWindowEngine::capacity() const noexcept
    {
        return capacity_;
    }

    bool RollingWindowEngine::empty() const noexcept
    {
        return values_.empty();
    }

    bool RollingWindowEngine::full() const noexcept
    {
        return values_.size() == capacity_;
    }

    const std::vector<double> &
    RollingWindowEngine::data() const noexcept
    {
        return values_;
    }

    void RollingWindowEngine::clear() noexcept
    {
        values_.clear();
    }
}