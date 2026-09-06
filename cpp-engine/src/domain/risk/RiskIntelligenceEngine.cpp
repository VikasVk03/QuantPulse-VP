#include "quantpulse/domain/risk/RiskIntelligenceEngine.hpp"

#include <algorithm>
#include <cmath>
#include <stdexcept>

namespace quantpulse::domain::risk
{

    namespace
    {

        void validateInputs(const RiskIntelligenceInputs &inputs)
        {
            if (!std::isfinite(inputs.microstructure.spread) || inputs.microstructure.spread < 0.0)
            {
                throw std::invalid_argument("Microstructure spread must be finite and non-negative.");
            }

            if (!std::isfinite(inputs.microstructure.depthImbalance) ||
                inputs.microstructure.depthImbalance < -1.0 ||
                inputs.microstructure.depthImbalance > 1.0)
            {
                throw std::invalid_argument("Depth imbalance must be finite and within [-1, 1].");
            }

            if (!std::isfinite(inputs.microstructure.micropriceDrift))
            {
                throw std::invalid_argument("Microprice drift must be finite.");
            }

            if (!std::isfinite(inputs.volatility) || inputs.volatility < 0.0)
            {
                throw std::invalid_argument("Volatility must be finite and non-negative.");
            }

            if (!std::isfinite(inputs.currentDrawdown) || inputs.currentDrawdown < 0.0)
            {
                throw std::invalid_argument("Drawdown must be finite and non-negative.");
            }

            if (!std::isfinite(inputs.portfolioExposure) || inputs.portfolioExposure < 0.0)
            {
                throw std::invalid_argument("Portfolio exposure must be finite and non-negative.");
            }
        }

        void validateConfig(const RiskIntelligenceConfig &config)
        {
            if (!std::isfinite(config.spreadElevated) || config.spreadElevated <= 0.0 ||
                !std::isfinite(config.spreadHigh) || config.spreadHigh <= config.spreadElevated ||
                !std::isfinite(config.spreadCritical) || config.spreadCritical <= config.spreadHigh)
            {
                throw std::invalid_argument("Spread thresholds must be positive, finite, and strictly ascending.");
            }

            if (!std::isfinite(config.micropriceDriftElevated) ||
                config.micropriceDriftElevated <= 0.0 ||
                !std::isfinite(config.micropriceDriftHigh) ||
                config.micropriceDriftHigh <= config.micropriceDriftElevated ||
                !std::isfinite(config.micropriceDriftCritical) ||
                config.micropriceDriftCritical <= config.micropriceDriftHigh)
            {
                throw std::invalid_argument(
                    "Microprice drift thresholds must be positive, finite, and strictly ascending.");
            }

            if (!std::isfinite(config.imbalanceElevated) || config.imbalanceElevated <= 0.0 ||
                !std::isfinite(config.imbalanceHigh) || config.imbalanceHigh <= config.imbalanceElevated ||
                !std::isfinite(config.imbalanceCritical) || config.imbalanceCritical <= config.imbalanceHigh)
            {
                throw std::invalid_argument("Imbalance thresholds must be positive, finite, and strictly ascending.");
            }

            if (!std::isfinite(config.volatilityElevated) || config.volatilityElevated <= 0.0 ||
                !std::isfinite(config.volatilityHigh) || config.volatilityHigh <= config.volatilityElevated ||
                !std::isfinite(config.volatilityCritical) || config.volatilityCritical <= config.volatilityHigh)
            {
                throw std::invalid_argument("Volatility thresholds must be positive, finite, and strictly ascending.");
            }

            if (!std::isfinite(config.drawdownElevated) || config.drawdownElevated <= 0.0 ||
                !std::isfinite(config.drawdownHigh) || config.drawdownHigh <= config.drawdownElevated ||
                !std::isfinite(config.drawdownCritical) || config.drawdownCritical <= config.drawdownHigh)
            {
                throw std::invalid_argument("Drawdown thresholds must be positive, finite, and strictly ascending.");
            }

            if (!std::isfinite(config.exposureElevated) || config.exposureElevated <= 0.0 ||
                !std::isfinite(config.exposureHigh) || config.exposureHigh <= config.exposureElevated ||
                !std::isfinite(config.exposureCritical) || config.exposureCritical <= config.exposureHigh)
            {
                throw std::invalid_argument("Exposure thresholds must be positive, finite, and strictly ascending.");
            }

            const double totalWeight = config.weightMicrostructure +
                                       config.weightVolatility +
                                       config.weightDrawdown +
                                       config.weightExposure;

            if (std::abs(totalWeight - 1.0) > 1e-5)
            {
                throw std::invalid_argument("Component weights must sum to 1.0.");
            }
        }

        double computeScore(double value, double criticalThreshold)
        {
            if (criticalThreshold <= 0.0)
            {
                return 100.0;
            }
            return std::min(100.0, std::max(0.0, (value / criticalThreshold) * 100.0));
        }

    } // namespace

    RiskIntelligenceReport RiskIntelligenceEngine::evaluate(
        const RiskIntelligenceInputs &inputs,
        const RiskIntelligenceConfig &config)
    {
        validateInputs(inputs);
        validateConfig(config);

        RiskIntelligenceReport report{};

        // 1. Microstructure sub-scores
        const double spreadScore = computeScore(
            inputs.microstructure.spread,
            config.spreadCritical);

        const double imbalanceScore = computeScore(
            std::abs(inputs.microstructure.depthImbalance),
            config.imbalanceCritical);

        const double driftScore = computeScore(
            std::abs(inputs.microstructure.micropriceDrift),
            config.micropriceDriftCritical);

        report.microstructureScore = (0.50 * spreadScore) +
                                     (0.35 * imbalanceScore) +
                                     (0.15 * driftScore);

        // 2. Volatility score
        report.volatilityScore = computeScore(
            inputs.volatility,
            config.volatilityCritical);

        // 3. Drawdown score
        report.drawdownScore = computeScore(
            inputs.currentDrawdown,
            config.drawdownCritical);

        // 4. Exposure score
        report.exposureScore = computeScore(
            inputs.portfolioExposure,
            config.exposureCritical);

        // 5. Composite Risk Score
        report.compositeRiskScore = (config.weightMicrostructure * report.microstructureScore) +
                                    (config.weightVolatility * report.volatilityScore) +
                                    (config.weightDrawdown * report.drawdownScore) +
                                    (config.weightExposure * report.exposureScore);

        // 6. Classification & Sizing Multipliers
        const bool isCritical =
            (inputs.currentDrawdown >= config.drawdownCritical) ||
            (inputs.microstructure.spread >= config.spreadCritical) ||
            (inputs.volatility >= config.volatilityCritical) ||
            (inputs.portfolioExposure >= config.exposureCritical) ||
            (std::abs(inputs.microstructure.depthImbalance) >=
             config.imbalanceCritical) ||
            (std::abs(inputs.microstructure.micropriceDrift) >=
             config.micropriceDriftCritical) ||
            (report.compositeRiskScore >= 75.0);

        const bool isHigh =
            (inputs.currentDrawdown >= config.drawdownHigh) ||
            (inputs.microstructure.spread >= config.spreadHigh) ||
            (inputs.volatility >= config.volatilityHigh) ||
            (inputs.portfolioExposure >= config.exposureHigh) ||
            (std::abs(inputs.microstructure.depthImbalance) >=
             config.imbalanceHigh) ||
            (std::abs(inputs.microstructure.micropriceDrift) >=
             config.micropriceDriftHigh) ||
            (report.compositeRiskScore >= 50.0);

        const bool isElevated =
            (inputs.currentDrawdown >= config.drawdownElevated) ||
            (inputs.microstructure.spread >= config.spreadElevated) ||
            (inputs.volatility >= config.volatilityElevated) ||
            (inputs.portfolioExposure >= config.exposureElevated) ||
            (std::abs(inputs.microstructure.depthImbalance) >=
             config.imbalanceElevated) ||
            (std::abs(inputs.microstructure.micropriceDrift) >=
             config.micropriceDriftElevated) ||
            (report.compositeRiskScore >= 25.0);

        if (isCritical)
        {
            report.level = RiskLevel::Critical;
            report.sizingMultiplier = 0.0;
            report.allowTrading = false;
        }
        else if (isHigh)
        {
            report.level = RiskLevel::High;
            report.sizingMultiplier = 0.25;
            report.allowTrading = true;
        }
        else if (isElevated)
        {
            report.level = RiskLevel::Elevated;
            report.sizingMultiplier = 0.60;
            report.allowTrading = true;
        }
        else
        {
            report.level = RiskLevel::Normal;
            report.sizingMultiplier = 1.0;
            report.allowTrading = true;
        }

        return report;
    }

} // namespace quantpulse::domain::risk
