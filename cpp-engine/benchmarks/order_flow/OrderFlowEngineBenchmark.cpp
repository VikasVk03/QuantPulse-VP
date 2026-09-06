#include "quantpulse/domain/order_flow/OrderFlowEngine.hpp"

#include <benchmark/benchmark.h>

namespace quantpulse::domain::order_flow
{

    static void BM_ORDER_FLOW_CALCULATE(benchmark::State &state)
    {
        const TopOfBook previous{
            .bidPrice = 100.0,
            .bidQuantity = 10.0,
            .askPrice = 101.0,
            .askQuantity = 10.0};

        const TopOfBook current{
            .bidPrice = 100.0,
            .bidQuantity = 20.0,
            .askPrice = 101.0,
            .askQuantity = 5.0};

        for (auto _ : state)
        {
            const auto result =
                OrderFlowEngine::calculate(previous, current);

            benchmark::DoNotOptimize(result);
        }
    }

    BENCHMARK(BM_ORDER_FLOW_CALCULATE);

} // namespace quantpulse::domain::order_flow
