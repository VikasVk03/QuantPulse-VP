#pragma once

namespace quantpulse::domain::order_flow
{

    struct TopOfBook
    {
        double bidPrice = 0.0;
        double bidQuantity = 0.0;
        double askPrice = 0.0;
        double askQuantity = 0.0;
    };

    struct OrderFlowResult
    {
        double bidContribution = 0.0;
        double askContribution = 0.0;
        double ofi = 0.0;
    };

    class OrderFlowEngine
    {
    public:
        static OrderFlowResult calculate(
            const TopOfBook &previous,
            const TopOfBook &current);
    };

} // namespace quantpulse::domain::order_flow