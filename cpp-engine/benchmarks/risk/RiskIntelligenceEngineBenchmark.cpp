#include "quantpulse/domain/risk/RiskIntelligenceEngine.hpp"

#include <benchmark/benchmark.h>

using quantpulse::domain::risk::RiskIntelligenceConfig;
using quantpulse::domain::risk::RiskIntelligenceEngine;
using quantpulse::domain::risk::RiskIntelligenceInputs;

namespace
{

    static void BM_RISK_INTELLIGENCE_EVALUATE(benchmark::State &state)
    {
        RiskIntelligenceInputs inputs{};
        inputs.microstructure.spread = 0.0015;
        inputs.microstructure.depthImbalance = -0.30;
        inputs.microstructure.micropriceDrift = 0.0002;
        inputs.volatility = 0.20;
        inputs.currentDrawdown = 0.04;
        inputs.portfolioExposure = 0.40;

        const RiskIntelligenceConfig config{};

        for (auto _ : state)
        {
            auto report = RiskIntelligenceEngine::evaluate(inputs, config);
            benchmark::DoNotOptimize(report.compositeRiskScore);
            benchmark::DoNotOptimize(report.sizingMultiplier);
        }
    }

} // namespace

BENCHMARK(BM_RISK_INTELLIGENCE_EVALUATE);