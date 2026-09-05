#pragma once

#include <cstddef>
#include <vector>

namespace quantpulse::domain::rolling_window
{
    class RollingWindowEngine
    {
    public:
        explicit RollingWindowEngine(
            std::size_t capacity);

        void push(double value);

        [[nodiscard]]
        double latest() const;

        [[nodiscard]]
        double at(std::size_t index) const;

        [[nodiscard]]
        std::size_t size() const noexcept;

        [[nodiscard]]
        std::size_t capacity() const noexcept;

        [[nodiscard]]
        bool empty() const noexcept;

        [[nodiscard]]
        bool full() const noexcept;

        [[nodiscard]]
        const std::vector<double> &data() const noexcept;

        void clear() noexcept;

    private:
        std::size_t capacity_;
        std::vector<double> values_;
    };
}