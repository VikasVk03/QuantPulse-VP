#pragma once

#include <cmath>

namespace quantpulse::domain::risk
{

    enum class RiskLevel
    {
        Normal,
        Elevated,
        High,
        Critical
    };

    struct MarketMicrostructureRiskInputs
    {
        /*
         * Relative spread: (ask - bid) / midPrice
         */
        double spread = 0.0;

        /*
         * Multi-level or top-of-book depth imbalance in [-1, 1]
         */
        double depthImbalance = 0.0;

        /*
         * Relative microprice drift: (microprice - midPrice) / midPrice
         */
        double micropriceDrift = 0.0;
    };

    struct RiskIntelligenceInputs
    {
        MarketMicrostructureRiskInputs microstructure{};

        /*
         * Annualized historical volatility
         */
        double volatility = 0.0;

        /*
         * Current drawdown as a positive fraction (e.g., 0.05 = 5%)
         */
        double currentDrawdown = 0.0;

        /*
         * Portfolio exposure ratio: committed position value / total capital
         */
        double portfolioExposure = 0.0;
    };

    struct RiskIntelligenceConfig
    {
        // Spread thresholds (relative spread)
        double spreadElevated = 0.0020; // 20 bps
        double spreadHigh = 0.0050;     // 50 bps
        double spreadCritical = 0.0100; // 100 bps

        double micropriceDriftElevated = 0.0020;
        double micropriceDriftHigh = 0.0050;
        double micropriceDriftCritical = 0.0100;

        // Imbalance thresholds (|imbalance|)
        double imbalanceElevated = 0.50;
        double imbalanceHigh = 0.75;
        double imbalanceCritical = 0.90;

        // Volatility thresholds
        double volatilityElevated = 0.25; // 25%
        double volatilityHigh = 0.40;     // 40%
        double volatilityCritical = 0.60; // 60%

        // Drawdown thresholds
        double drawdownElevated = 0.08; // 8%
        double drawdownHigh = 0.12;     // 12%
        double drawdownCritical = 0.15; // 15%

        // Exposure thresholds
        double exposureElevated = 0.60; // 60%
        double exposureHigh = 0.80;     // 80%
        double exposureCritical = 0.95; // 95%

        // Component weights (must sum to 1.0)
        double weightMicrostructure = 0.35;
        double weightVolatility = 0.25;
        double weightDrawdown = 0.25;
        double weightExposure = 0.15;
    };

    struct RiskIntelligenceReport
    {
        RiskLevel level = RiskLevel::Normal;

        double compositeRiskScore = 0.0;  // 0 (safest) to 100 (critical)
        double microstructureScore = 0.0; // 0 to 100
        double volatilityScore = 0.0;     // 0 to 100
        double drawdownScore = 0.0;       // 0 to 100
        double exposureScore = 0.0;       // 0 to 100

        double sizingMultiplier = 1.0; // Dynamic sizing factor in [0.0, 1.0]
        bool allowTrading = true;      // False when RiskLevel::Critical
    };

    class RiskIntelligenceEngine
    {
    public:
        /**
         * @brief Synthesize market microstructure conditions, volatility,
         *        drawdown, and exposure into a deterministic risk intelligence report.
         *
         * @param inputs Current microstructure and portfolio risk inputs.
         * @param config Calibrated risk thresholds and component weights.
         *
         * @return Complete risk intelligence report with classification and sizing multiplier.
         *
         * @throw std::invalid_argument if inputs or configuration are invalid.
         */
        [[nodiscard]]
        static RiskIntelligenceReport evaluate(
            const RiskIntelligenceInputs &inputs,
            const RiskIntelligenceConfig &config = {});
    };

} // namespace quantpulse::domain::risk
