# Quantitative Models

This document records the mathematical models implemented by **QuantPulse**.

Each model is documented using the following structure:

- **Purpose** — What the model calculates and why it is useful.
- **Input** — Required data and expected characteristics.
- **Output** — Value or values produced by the model.
- **Formula** — Mathematical definition of the model.
- **Assumptions** — Important assumptions and limitations.
- **Numerical Considerations** — Precision, stability, edge cases, and implementation concerns.
- **Computational Complexity** — Time and space complexity.
- **Implementation** — Corresponding QuantPulse implementation.
- **Tests** — Tests validating the implementation.
- **References** — Relevant mathematical or financial references.

---

## 1. Statistics

The statistics module provides fundamental descriptive statistics used as building blocks for QuantPulse's quantitative models.

---

### 1.1 Mean

#### Purpose

Calculate the arithmetic mean of a dataset.

The mean is used throughout quantitative analysis as a measure of the central tendency of a set of observations.

#### Input

A sequence of numerical observations:

```text
x₁, x₂, ..., xₙ
```

where `n` is the number of observations.

#### Output

A single numerical value representing the arithmetic mean.

#### Formula

```text
μ = (x₁ + x₂ + ... + xₙ) / n
```

or equivalently:

```text
μ = (1 / n) Σ xᵢ
```

#### Assumptions

- The input contains numerical observations.
- The number of observations is greater than zero.
- All observations are treated equally.

#### Numerical Considerations

The implementation should avoid unnecessary intermediate storage. For large datasets, floating-point accumulation can introduce rounding error.

Empty input must be handled explicitly according to the API's error-handling policy.

#### Computational Complexity

```text
Time:  O(n)
Space: O(1)
```

#### Implementation

```text
StatisticsEngine::mean()
```

#### Tests

Tests should cover:

- Normal datasets
- Positive and negative values
- Integer-valued observations
- Fractional values
- Single-element datasets
- Empty input
- Large-magnitude values

---

### 1.2 Median

#### Purpose

Calculate the median, or middle value, of a dataset.

The median is a measure of central tendency that is less sensitive to extreme observations than the arithmetic mean.

#### Input

A sequence of numerical observations:

```text
x₁, x₂, ..., xₙ
```

#### Output

A single numerical value representing the median.

#### Formula

After sorting the observations:

```text
x₁ ≤ x₂ ≤ ... ≤ xₙ
```

For an odd number of observations:

```text
median = x[(n + 1) / 2]
```

For an even number of observations:

```text
median = (x[n / 2] + x[n / 2 + 1]) / 2
```

#### Assumptions

- Input observations are numerical.
- The median is calculated from the ordered observations.
- The current implementation does not modify the caller's input vector.

#### Numerical Considerations

The current implementation copies the input vector before sorting it. This preserves the original dataset but requires additional memory.

For an even-sized dataset, the two central values are averaged, which may require a wider or floating-point representation.

#### Computational Complexity

```text
Time:  O(n log n)
Space: O(n)
```

The space complexity results from copying the input vector.

#### Implementation

The median implementation is part of the `StatisticsEngine`.

#### Tests

Tests should cover:

- Odd-sized datasets
- Even-sized datasets
- Already sorted data
- Reverse-sorted data
- Duplicate values
- Negative values
- Fractional values
- Single-element datasets
- Empty input

#### Future Optimization

The implementation may eventually use a selection algorithm such as `nth_element` to reduce the expected computational cost without fully sorting the dataset.

Any optimization should be benchmarked before replacing the current implementation.

---

### 1.3 Population Variance

#### Purpose

Measure the dispersion of observations around their population mean.

Variance quantifies how far observations tend to deviate from the mean.

#### Input

A sequence of numerical observations:

```text
x₁, x₂, ..., xₙ
```

#### Output

A non-negative numerical value representing population variance.

#### Formula

First calculate the population mean:

```text
μ = (1 / n) Σ xᵢ
```

Then calculate:

```text
σ² = Σ(xᵢ - μ)² / n
```

where:

- `xᵢ` = observation
- `μ` = population mean
- `n` = number of observations
- `σ²` = population variance

#### Assumptions

The current implementation calculates **population variance**.

It does not calculate sample variance using `n - 1`.

#### Numerical Considerations

Variance calculations can be affected by floating-point cancellation and loss of precision, particularly when observations are large and their deviations from the mean are relatively small.

For future implementations, numerically stable algorithms such as Welford's online algorithm should be considered where appropriate.

#### Computational Complexity

```text
Time:  O(n)
Space: O(1)
```

#### Implementation

```text
StatisticsEngine::variance()
```

#### Tests

Tests should cover:

- Constant datasets
- Normal datasets
- Positive and negative values
- Fractional values
- Known analytical results
- Single-element datasets
- Empty input
- Large and small magnitude values

#### Important Note

Population variance and sample variance are distinct statistical measures.

For population variance:

```text
σ² = Σ(xᵢ - μ)² / n
```

For sample variance:

```text
s² = Σ(xᵢ - x̄)² / (n - 1)
```

Sample variance is **not currently implemented**.

---

### 1.4 Standard Deviation

#### Purpose

Calculate the standard deviation of a population.

Standard deviation expresses dispersion in the same units as the original observations, making it easier to interpret than variance.

#### Input

A sequence of numerical observations.

#### Output

A non-negative numerical value representing population standard deviation.

#### Formula

```text
σ = √σ²
```

where `σ²` is the population variance.

Equivalently:

```text
σ = √(Σ(xᵢ - μ)² / n)
```

#### Assumptions

- The calculation uses population variance.
- The input contains at least one valid numerical observation.
- Standard deviation is calculated as the square root of variance.

#### Numerical Considerations

The square-root operation introduces another floating-point operation. Because variance should theoretically be non-negative, small negative values caused by floating-point error may require consideration in future numerical-stability improvements.

#### Computational Complexity

```text
Time:  O(n)
Space: O(1)
```

#### Implementation

```text
StatisticsEngine::standardDeviation()
```

#### Tests

Tests should cover:

- Constant datasets
- Known standard deviation values
- Positive and negative observations
- Fractional values
- Single-element datasets
- Empty input
- Numerical precision

---

# 2. Future Models

The following quantitative models are planned for future versions of QuantPulse.

The implementation and mathematical specification for each model will be added as it becomes part of the production codebase.

---

## 2.1 Simple Returns

Measure percentage change between consecutive prices.

```text
Rₜ = (Pₜ / Pₜ₋₁) - 1
```

---

## 2.2 Log Returns

Calculate continuously compounded returns.

```text
rₜ = ln(Pₜ / Pₜ₋₁)
```

---

## 2.3 Rolling Statistics

Calculate statistics over a moving window of observations.

Planned metrics include:

- Rolling mean
- Rolling variance
- Rolling standard deviation
- Rolling minimum
- Rolling maximum

---

## 2.4 Historical Volatility

Estimate volatility from historical return observations.

A common formulation is:

```text
σ = standard_deviation(returns)
```

with optional annualization:

```text
σannual = σperiod × √N
```

where `N` represents the number of periods per year.

---

## 2.5 Realized Volatility

Estimate realized volatility from high-frequency or intraday returns.

A basic formulation is:

```text
RV = √(Σ rₜ²)
```

The precise definition will depend on the sampling frequency and annualization convention.

---

## 2.6 EWMA Volatility

Estimate volatility using exponentially weighted observations, assigning greater weight to recent returns.

A common recursive formulation is:

```text
σₜ² = λσₜ₋₁² + (1 - λ)rₜ₋₁²
```

where `λ` is the decay factor.

---

## 2.7 Covariance

Measure the joint variability of two random variables.

For paired observations:

```text
Cov(X,Y) = Σ[(xᵢ - μₓ)(yᵢ - μᵧ)] / n
```

---

## 2.8 Correlation

Normalize covariance to measure the strength and direction of a linear relationship.

```text
ρₓᵧ = Cov(X,Y) / (σₓσᵧ)
```

The resulting value lies between:

```text
-1 ≤ ρ ≤ 1
```

---

## 2.9 Sharpe Ratio

Measure risk-adjusted return relative to volatility.

A basic formulation is:

```text
Sharpe = (Rₚ - R_f) / σₚ
```

where:

- `Rₚ` = portfolio return
- `R_f` = risk-free return
- `σₚ` = portfolio volatility

Annualization conventions will be documented when implemented.

---

## 2.10 Sortino Ratio

Measure risk-adjusted return using downside deviation rather than total volatility.

A basic formulation is:

```text
Sortino = (Rₚ - Rₜ) / DownsideDeviation
```

where `Rₜ` is the target or minimum acceptable return.

---

## 2.11 Maximum Drawdown

Measure the largest observed decline from a historical peak to a subsequent trough.

For portfolio value `Vₜ`:

```text
Peakₜ = max(V₁, ..., Vₜ)
```

and:

```text
Drawdownₜ = (Vₜ / Peakₜ) - 1
```

Maximum drawdown is:

```text
MDD = min(Drawdownₜ)
```

---

## 2.12 Value at Risk (VaR)

Estimate a loss threshold that should not be exceeded at a specified confidence level under a defined model.

Future implementations may support multiple approaches, including:

- Historical VaR
- Parametric VaR
- Monte Carlo VaR

The methodology, confidence level, horizon, and assumptions must be explicitly documented for each implementation.

---

## 2.13 Conditional Value at Risk (CVaR)

Estimate the expected loss conditional on losses exceeding the VaR threshold.

CVaR is also commonly referred to as Expected Shortfall (ES).

The implementation will document the exact estimation methodology and confidence level.

---

## 2.14 Beta

Measure the sensitivity of an asset's returns relative to a benchmark.

A common formulation is:

```text
β = Cov(Rᵢ, Rₘ) / Var(Rₘ)
```

where:

- `Rᵢ` = asset returns
- `Rₘ` = market or benchmark returns

---

## 2.15 Alpha

Measure the return of an investment relative to a benchmark or expected return model.

The exact definition will depend on the selected asset-pricing model.

For a simple CAPM-style formulation:

```text
α = Rᵢ - [R_f + β(Rₘ - R_f)]
```

---

## 2.16 VWAP

Calculate Volume-Weighted Average Price.

A common formulation is:

```text
VWAP = Σ(PᵢVᵢ) / ΣVᵢ
```

where:

- `Pᵢ` = transaction price
- `Vᵢ` = transaction volume

---

## 2.17 TWAP

Calculate Time-Weighted Average Price over a specified interval.

For equally sampled prices:

```text
TWAP = ΣPᵢ / n
```

For irregular observations, the implementation may use duration-weighted prices.

---

## 2.18 Bid-Ask Spread

Measure the difference between the best ask and best bid prices.

```text
Spread = Ask - Bid
```

A relative spread may also be defined as:

```text
RelativeSpread = (Ask - Bid) / MidPrice
```

where:

```text
MidPrice = (Ask + Bid) / 2
```

---

## 2.19 Order Imbalance

Measure the relative difference between buy-side and sell-side quantities.

A basic formulation is:

```text
OI = (BidVolume - AskVolume) /
     (BidVolume + AskVolume)
```

The exact definition will depend on the market-data representation.

---

## 2.20 Trade Imbalance

Measure the difference between classified buy and sell trading activity.

Possible formulations include:

```text
TI = (BuyVolume - SellVolume) /
     (BuyVolume + SellVolume)
```

Trade classification methodology will be documented when implemented.

---

## 2.21 Price Impact

Measure the price movement associated with a trade or change in market liquidity.

The implementation will specify:

- Reference price
- Observation horizon
- Trade direction
- Volume normalization
- Temporary vs. permanent impact

---

# 3. Model Development Standards

As QuantPulse evolves, each production quantitative model should document:

1. Mathematical definition
2. Input and output types
3. Units and conventions
4. Assumptions
5. Edge cases
6. Numerical stability considerations
7. Time complexity
8. Space complexity
9. Implementation reference
10. Unit and integration tests
11. Validation methodology
12. External references

Where multiple accepted definitions exist, the implementation must explicitly state which definition is used.

Financial metrics should also document important conventions such as:

- Return frequency
- Annualization factor
- Day-count convention
- Risk-free rate convention
- Price vs. total-return data
- Currency
- Sampling frequency
- Missing-data treatment

The goal is to make every QuantPulse quantitative model **mathematically explicit, reproducible, testable, and suitable for future production use**.
