# QuantPulse — Quantitative Concepts & Mathematical Reference

> **QuantPulse** is a quantitative finance analytics platform designed to provide a modular foundation for market statistics, return analysis, volatility measurement, portfolio analytics, and risk-adjusted performance evaluation.

This document serves as the **mathematical and conceptual reference** for the quantitative concepts currently implemented in QuantPulse.

It is intended to answer three questions for every metric:

1. **What does it measure?**
2. **What is the mathematical formula?**
3. **Why is it useful in quantitative finance?**

---

# Table of Contents

- [1. QuantPulse Quantitative Architecture](#1-quantpulse-quantitative-architecture)
- [2. Mathematical Notation](#2-mathematical-notation)
- [3. Statistics](#3-statistics)
    - [3.1 Mean](#31-mean)
    - [3.2 Median](#32-median)
    - [3.3 Population Variance](#33-population-variance)
    - [3.4 Sample Variance](#34-sample-variance)
    - [3.5 Standard Deviation](#35-standard-deviation)
    - [3.6 Covariance](#36-covariance)
    - [3.7 Correlation](#37-correlation)

- [4. Returns](#4-returns)
    - [4.1 Simple Return](#41-simple-return)
    - [4.2 Logarithmic Return](#42-logarithmic-return)
    - [4.3 Cumulative Return](#43-cumulative-return)

- [5. Volatility](#5-volatility)
    - [5.1 Historical Volatility](#51-historical-volatility)
    - [5.2 Annualization](#52-annualization)

- [6. Risk Metrics](#6-risk-metrics)
    - [6.1 Sharpe Ratio](#61-sharpe-ratio)
    - [6.2 Maximum Drawdown](#62-maximum-drawdown)
    - [6.3 Downside Deviation](#63-downside-deviation)

- [7. Portfolio Analytics](#7-portfolio-analytics)
    - [7.1 Portfolio Return](#71-portfolio-return)
    - [7.2 Portfolio Variance](#72-portfolio-variance)
    - [7.3 Portfolio Volatility](#73-portfolio-volatility)
    - [7.4 Covariance Matrix](#74-covariance-matrix)

- [8. Relationship Between Metrics](#8-relationship-between-metrics)
- [9. Formula Summary](#9-formula-summary)
- [10. Financial Interpretation Summary](#10-financial-interpretation-summary)
- [11. QuantPulse Dependency Graph](#11-quantpulse-dependency-graph)
- [12. Current Implementation Status](#12-current-implementation-status)
- [13. Planned Quantitative Extensions](#13-planned-quantitative-extensions)
- [14. Important Mathematical Assumptions](#14-important-mathematical-assumptions)
- [15. Example End-to-End Workflow](#15-example-end-to-end-workflow)

---

# 1. QuantPulse Quantitative Architecture

The current quantitative layer can be viewed as the following pipeline:

```text
                         MARKET PRICES
                              │
                              ▼
                    ┌──────────────────┐
                    │  RETURNS ENGINE  │
                    └────────┬─────────┘
                             │
             ┌───────────────┼────────────────┐
             │               │                │
             ▼               ▼                ▼
          Statistics      Volatility          Risk
             │               │                │
             │               │        ┌───────┼────────┐
             │               │        │       │        │
             ▼               ▼        ▼       ▼        ▼
          Variance       Historical   Sharpe Drawdown Downside
          Std. Dev.      Volatility
             │
             ├───────────────┐
             │               │
             ▼               ▼
        Covariance       Correlation
             │
             └───────────────┐
                             ▼
                    PORTFOLIO ANALYTICS
                             │
                  ┌──────────┼──────────┐
                  ▼          ▼          ▼
              Portfolio   Portfolio  Portfolio
                Return     Variance  Volatility
```

The important design principle is that these are **not isolated calculations**.

For example:

```text
Prices
  ↓
Returns
  ↓
Mean / Variance
  ↓
Standard Deviation
  ↓
Historical Volatility
  ↓
Risk-Adjusted Metrics
```

For multiple assets:

```text
Asset Returns
      ↓
Covariance / Correlation
      ↓
Covariance Matrix
      ↓
Portfolio Weights
      ↓
Portfolio Variance
      ↓
Portfolio Volatility
```

---

# 2. Mathematical Notation

The following notation is used throughout this document.

| Symbol     | Meaning                          |
| ---------- | -------------------------------- |
| `xᵢ`       | Individual observation           |
| `x̄`        | Sample mean                      |
| `μ`        | Population mean                  |
| `N`        | Number of observations           |
| `Pₜ`       | Price at time `t`                |
| `Rₜ`       | Simple return at time `t`        |
| `rₜ`       | Log return at time `t`           |
| `σ`        | Population standard deviation    |
| `s`        | Sample standard deviation        |
| `σ²`       | Population variance              |
| `s²`       | Sample variance                  |
| `Cov(X,Y)` | Covariance between X and Y       |
| `ρ(X,Y)`   | Correlation between X and Y      |
| `wᵢ`       | Portfolio weight of asset i      |
| `w`        | Portfolio weight vector          |
| `Σ`        | Covariance matrix                |
| `Rₚ`       | Portfolio return                 |
| `σₚ`       | Portfolio volatility             |
| `R_f`      | Risk-free return                 |
| `T`        | Target/minimum acceptable return |
| `P`        | Number of periods per year       |

---

# 3. Statistics

The `StatisticsEngine` provides the fundamental statistical primitives used by the rest of QuantPulse.

These functions form the mathematical foundation for volatility, risk, and portfolio analytics.

---

## 3.1 Mean

### Definition

The arithmetic mean represents the average value of a dataset.

### Formula

```text
          N
         Σ xᵢ
μ =      i=1
         ─────
           N
```

or:

```text
μ = (x₁ + x₂ + ... + xₙ) / N
```

### Example

Given:

```text
2%, 4%, 6%
```

```text
μ = (0.02 + 0.04 + 0.06) / 3
μ = 0.04
```

Therefore:

```text
Mean = 4%
```

### Financial Meaning

The mean represents the **central tendency** of observations.

It is required by several other statistical calculations:

```text
Mean
 ├── Variance
 ├── Standard Deviation
 └── Covariance
```

### QuantPulse Usage

```text
StatisticsEngine::mean(...)
```

---

# 3.2 Median

The median represents the middle observation after sorting the dataset.

### Odd Number of Observations

For `N` odd:

```text
Median = x[(N + 1) / 2]
```

### Even Number of Observations

For `N` even:

```text
Median = (x[N/2] + x[N/2 + 1]) / 2
```

### Example

```text
1, 2, 3, 100
```

Mean:

```text
26.5
```

Median:

```text
(2 + 3) / 2 = 2.5
```

The median is much less affected by the extreme observation `100`.

### Financial Meaning

Median can be useful when data contains:

- extreme returns
- outliers
- abnormal observations
- market shocks

### QuantPulse Usage

```text
StatisticsEngine::median(...)
```

---

# 3.3 Population Variance

Variance measures the dispersion of observations around the population mean.

### Formula

```text
              N
             Σ (xᵢ - μ)²
            i=1
σ² =         ───────────
                  N
```

### Interpretation

A higher variance means observations are more dispersed.

A lower variance means observations are more concentrated around the mean.

### Why Square the Deviations?

Consider:

```text
-2%, +2%
```

The deviations cancel if simply added:

```text
-2% + 2% = 0
```

Squaring removes the sign:

```text
(-2%)² + (2%)² > 0
```

Therefore variance measures magnitude of dispersion rather than directional movement.

### Financial Application

Variance is a fundamental measure of:

- return variability
- statistical dispersion
- portfolio risk
- volatility calculation

### QuantPulse Usage

```text
StatisticsEngine::populationVariance(...)
```

---

# 3.4 Sample Variance

Sample variance estimates the variance of a larger population using a sample.

### Formula

```text
              N
             Σ (xᵢ - x̄)²
            i=1
s² =         ───────────
                 N - 1
```

The important difference is:

```text
Population variance → divide by N

Sample variance     → divide by N - 1
```

### Why `N - 1`?

Using `N - 1` provides **Bessel's correction**, which corrects the tendency of the sample variance estimator to underestimate population variance when the sample mean is estimated from the same observations.

### Financial Example

A dataset containing 1,000 daily returns represents observations from a broader market process.

It is therefore often treated as a sample rather than the complete population of possible returns.

### QuantPulse Usage

```text
StatisticsEngine::sampleVariance(...)
```

---

# 3.5 Standard Deviation

Standard deviation is the square root of variance.

### Population Standard Deviation

```text
σ = √σ²
```

### Sample Standard Deviation

```text
s = √s²
```

### Why Use Standard Deviation?

Variance has squared units.

For example:

```text
Return       → %
Variance     → %²
Std. Dev.    → %
```

Standard deviation therefore returns the measurement to the same scale as the original observations.

### Financial Meaning

Standard deviation measures the typical magnitude of variation around the mean.

It is one of the primary measures used as a proxy for **total risk or volatility**.

---

# 3.6 Covariance

Covariance measures how two variables move together.

### Population Covariance

```text
                  N
                 Σ (xᵢ - μx)(yᵢ - μy)
                i=1
Cov(X,Y) =       ─────────────────────
                          N
```

### Interpretation

```text
Positive covariance
→ Variables tend to move in the same direction.

Negative covariance
→ Variables tend to move in opposite directions.

Covariance near zero
→ Weak linear co-movement.
```

### Example

If:

```text
Asset A ↑
Asset B ↑
```

frequently occurs, covariance tends to be positive.

If:

```text
Asset A ↑
Asset B ↓
```

frequently occurs, covariance tends to be negative.

### Why Covariance Matters

Portfolio risk depends not only on individual asset volatility but also on how assets interact.

```text
Portfolio Risk
=
Individual Risk
+
Interaction Between Assets
```

Covariance provides the mathematical representation of this interaction.

---

# 3.7 Correlation

Correlation normalizes covariance.

### Formula

```text
             Cov(X,Y)
ρXY = ─────────────────────
           σX × σY
```

### Range

```text
-1 ≤ ρ ≤ +1
```

### Interpretation

| Correlation | Meaning                              |
| ----------: | ------------------------------------ |
|        `+1` | Perfect positive linear relationship |
|         `0` | No linear relationship               |
|        `-1` | Perfect negative linear relationship |

### Why Correlation Is Useful

Covariance depends on the scale and units of the variables.

Correlation removes this scale dependency.

Therefore it is easier to compare relationships between different assets.

### Portfolio Interpretation

```text
High positive correlation
        ↓
Less diversification benefit

Low correlation
        ↓
Greater diversification potential

Negative correlation
        ↓
Potentially strong diversification benefit
```

---

# 4. Returns

Prices themselves are generally not the preferred input for most statistical and risk calculations.

QuantPulse therefore converts prices into **returns**.

```text
Price Series
     ↓
Return Series
     ↓
Statistics / Risk / Portfolio Analytics
```

---

# 4.1 Simple Return

Simple return measures proportional price change between two consecutive periods.

### Formula

```text
              Pₜ
Rₜ = ─────────────── - 1
          Pₜ₋₁
```

Equivalent:

```text
Rₜ = (Pₜ - Pₜ₋₁) / Pₜ₋₁
```

### Example

```text
Previous Price = 100
Current Price  = 105
```

```text
R = (105 - 100) / 100
R = 0.05
```

Therefore:

```text
Return = 5%
```

### Why Returns Instead of Price Changes?

Consider:

```text
Asset A: ₹100 → ₹110
Asset B: ₹1,000 → ₹1,010
```

Both have:

```text
Price change = ₹10
```

But their returns are:

```text
Asset A = 10%
Asset B = 1%
```

Returns therefore provide a normalized way to compare assets.

### QuantPulse Usage

```text
ReturnsEngine::simpleReturn(...)
```

---

# 4.2 Logarithmic Return

Log return is calculated using the natural logarithm of the price ratio.

### Formula

```text
          ⎛ Pₜ ⎞
rₜ = ln   ⎜───⎟
          ⎝Pₜ₋₁⎠
```

### Example

For:

```text
100 → 105
```

```text
r = ln(105 / 100)
r = ln(1.05)
r ≈ 0.04879
```

Therefore:

```text
Log return ≈ 4.879%
```

### Key Property: Time Additivity

Suppose:

```text
100 → 110 → 121
```

Simple returns:

```text
+10%
+10%
```

They cannot simply be added to obtain the total simple return.

The total return is:

```text
(1.10 × 1.10) - 1
= 21%
```

Log returns are additive:

```text
ln(110/100) + ln(121/110)
= ln(121/100)
```

### Why Log Returns Are Useful

They are particularly useful for:

- time-series analysis
- statistical modeling
- continuous compounding
- volatility modeling
- quantitative research

### QuantPulse Usage

```text
ReturnsEngine::logReturn(...)
```

---

# 4.3 Cumulative Return

Cumulative return measures total compounded return across multiple periods.

### Formula

```text
Rcum = Π (1 + Rᵢ) - 1
```

where:

```text
i = 1 ... N
```

### Example

Returns:

```text
+10%
-5%
```

Correct calculation:

```text
Rcum = (1.10 × 0.95) - 1
Rcum = 0.045
```

Therefore:

```text
Cumulative Return = 4.5%
```

### Important Rule

Simple returns should **not normally be added** across periods.

Incorrect:

```text
10% + (-5%) = 5%
```

Correct:

```text
(1 + 10%) × (1 - 5%) - 1
= 4.5%
```

This difference exists because investment returns compound.

### QuantPulse Usage

```text
ReturnsEngine::cumulativeReturn(...)
```

---

# 5. Volatility

Volatility measures the variability of returns.

Conceptually:

```text
Higher volatility
→ Larger return fluctuations
→ Greater uncertainty

Lower volatility
→ Smaller return fluctuations
→ Lower observed variability
```

QuantPulse currently uses **historical volatility**.

---

# 5.1 Historical Volatility

Historical volatility estimates future-like risk from the observed historical return series.

The process is:

```text
Historical Prices
       ↓
Historical Returns
       ↓
Standard Deviation
       ↓
Annualization
       ↓
Historical Volatility
```

### Formula

For periodic volatility:

```text
σperiod = standard deviation of returns
```

Annualized volatility:

```text
σannual = σperiod × √P
```

where `P` is the number of periods per year.

For daily observations:

```text
P = 252
```

is commonly used as an approximation for the number of trading days in a year.

Therefore:

```text
σannual = σdaily × √252
```

### Example

Suppose:

```text
Daily volatility = 1%
```

Then:

```text
Annualized volatility
= 0.01 × √252
≈ 0.1587
```

Therefore:

```text
Annualized volatility ≈ 15.87%
```

---

# 5.2 Annualization

The square-root-of-time rule follows from the variance aggregation assumption.

If individual returns are independent and have stable variance:

```text
Var(R₁ + R₂ + ... + Rₜ)
= Tσ²
```

Therefore:

```text
σT = √(Tσ²)
```

which gives:

```text
σT = σ√T
```

### Important Assumption

Square-root-of-time annualization assumes, approximately:

- independent returns
- stable variance
- no significant autocorrelation
- consistent measurement intervals

These assumptions are not always true in real financial markets.

Therefore annualized historical volatility should be interpreted as a **model-based estimate**, not a guaranteed future volatility.

---

# 6. Risk Metrics

The `RiskEngine` converts return and volatility information into higher-level risk and performance measures.

Current metrics include:

```text
Sharpe Ratio
Maximum Drawdown
Downside Deviation
```

---

# 6.1 Sharpe Ratio

The Sharpe ratio measures excess return relative to total volatility.

### Formula

```text
              Rp - Rf
Sharpe = ───────────────
                 σ
```

where:

- `Rp` = portfolio/strategy return
- `Rf` = risk-free return
- `σ` = standard deviation/volatility

### Example

Suppose:

```text
Portfolio Return = 12%
Risk-Free Rate  = 4%
Volatility      = 10%
```

Then:

```text
Sharpe
= (0.12 - 0.04) / 0.10
= 0.8
```

### Interpretation

The Sharpe ratio answers:

> How much excess return am I receiving per unit of total volatility?

Generally:

```text
Higher Sharpe
→ Better risk-adjusted performance

Lower Sharpe
→ Lower excess return relative to risk
```

### Important Note

Sharpe ratio interpretation depends on:

- return frequency
- volatility frequency
- risk-free rate frequency
- annualization convention

The numerator and denominator should be expressed consistently.

---

# 6.2 Maximum Drawdown

Maximum drawdown measures the largest decline from a previous peak to a subsequent trough.

### Running Peak

For portfolio value `Vₜ`:

```text
Peakₜ = max(V₁, V₂, ..., Vₜ)
```

### Drawdown

```text
             Vₜ - Peakₜ
DDₜ = ─────────────────────
                 Peakₜ
```

### Maximum Drawdown

```text
MDD = min(DDₜ)
```

### Example

Portfolio value:

```text
100
120
150
140
100
130
```

Peak:

```text
150
```

Trough after the peak:

```text
100
```

Drawdown:

```text
(100 - 150) / 150
= -0.3333
```

Therefore:

```text
Maximum Drawdown = -33.33%
```

### Financial Meaning

Maximum drawdown answers:

> What was the worst peak-to-trough decline experienced during the observed period?

This is different from volatility.

```text
Volatility
→ How much does the value fluctuate?

Drawdown
→ How severe was the decline from a previous high?
```

---

# 6.3 Downside Deviation

Standard deviation treats positive and negative deviations as risk.

Downside deviation focuses only on observations below a target.

### Formula

```text
                  N
                 Σ min(0, Rᵢ - T)²
                i=1
DD = √          ───────────────────
                         N
```

where:

- `Rᵢ` = observed return
- `T` = target return
- `N` = number of observations

### Example

Target:

```text
T = 0
```

Returns:

```text
+10%
-5%
+3%
-2%
```

Only returns below the target contribute:

```text
-5%
-2%
```

Positive returns do not contribute to downside deviation.

### Financial Meaning

Downside deviation answers:

> How much unfavorable return variation exists relative to a target?

This is the key downside-risk primitive required for metrics such as the **Sortino Ratio**.

---

# 7. Portfolio Analytics

Portfolio analytics combines multiple assets.

The key principle is:

> Portfolio risk depends on both individual asset risk and relationships between assets.

Current portfolio metrics include:

```text
Portfolio Return
Portfolio Variance
Portfolio Volatility
```

---

# 7.1 Portfolio Return

For `N` assets:

```text
Rp = Σ wiRi
```

or:

```text
Rp = w₁R₁ + w₂R₂ + ... + wₙRₙ
```

where:

- `wi` = weight of asset i
- `Ri` = return of asset i

### Example

Suppose:

```text
Asset A = 10%
Asset B = 5%

Weight A = 60%
Weight B = 40%
```

Then:

```text
Rp
= (0.60 × 0.10) + (0.40 × 0.05)
= 0.08
```

Therefore:

```text
Portfolio Return = 8%
```

### Interpretation

Portfolio return represents the return generated by the combined investment allocation.

---

# 7.2 Portfolio Variance

For two assets:

```text
σp² =
w₁²σ₁²
+
w₂²σ₂²
+
2w₁w₂Cov(R₁,R₂)
```

The third term is critical:

```text
2w₁w₂Cov(R₁,R₂)
```

It captures the interaction between the two assets.

### General Matrix Formula

For `N` assets:

```text
             ┌───────┐
σp² = wᵀ Σ w
```

where:

```text
w = portfolio weight vector

Σ = covariance matrix
```

For example:

```text
w =
[ w₁
  w₂ ]
```

and:

```text
Σ =
[ σ₁²       Cov₁₂ ]
[ Cov₂₁     σ₂²   ]
```

### Why This Matters

Portfolio risk is not:

```text
Risk A + Risk B
```

Instead:

```text
Portfolio Risk
=
Individual Asset Risk
+
Cross-Asset Relationships
+
Portfolio Weights
```

This is the mathematical foundation of diversification.

---

# 7.3 Portfolio Volatility

Portfolio variance is converted into portfolio volatility by taking the square root.

### Formula

```text
σp = √σp²
```

Using the covariance matrix:

```text
σp = √(wᵀΣw)
```

### Financial Meaning

Portfolio volatility represents the estimated variability of the portfolio's returns.

For example:

```text
Portfolio Volatility = 14.2%
```

is easier to interpret than reporting:

```text
Portfolio Variance = 0.020164
```

---

# 7.4 Covariance Matrix

For multiple assets, pairwise covariance values are represented using a covariance matrix.

For three assets:

```text
Σ =

[ Var(A)   Cov(A,B)   Cov(A,C) ]
[ Cov(B,A) Var(B)     Cov(B,C) ]
[ Cov(C,A) Cov(C,B)   Var(C)   ]
```

The diagonal contains individual asset variances:

```text
Σii = Var(Ri)
```

The off-diagonal elements contain pairwise covariance:

```text
Σij = Cov(Ri,Rj)
```

The covariance matrix is fundamental to:

- portfolio variance
- portfolio optimization
- efficient frontier calculations
- minimum-variance portfolios
- risk parity
- mean-variance optimization

---

# 8. Relationship Between Metrics

The metrics form a mathematical dependency chain.

## Returns → Statistics

```text
Prices
  ↓
Returns
  ↓
Mean
  ↓
Variance
  ↓
Standard Deviation
```

---

## Returns → Volatility

```text
Prices
  ↓
Returns
  ↓
Standard Deviation
  ↓
Annualization
  ↓
Historical Volatility
```

---

## Returns → Risk-Adjusted Performance

```text
Returns
   │
   ├───────────────┐
   ▼               ▼
Mean Return    Standard Deviation
   │               │
   └───────┬───────┘
           ▼
      Sharpe Ratio
```

---

## Returns → Downside Risk

```text
Returns
   ↓
Target Return
   ↓
Downside Deviations
   ↓
Downside Deviation
   ↓
Sortino Ratio
```

---

## Multiple Assets → Portfolio Risk

```text
Asset Returns
      ↓
Covariance
      ↓
Covariance Matrix
      ↓
Portfolio Weights
      ↓
wᵀΣw
      ↓
Portfolio Variance
      ↓
Portfolio Volatility
```

---

# 9. Formula Summary

| Concept               | Formula                            |
| --------------------- | ---------------------------------- |
| Mean                  | `μ = Σxᵢ / N`                      |
| Median                | Middle value after sorting         |
| Population Variance   | `σ² = Σ(xᵢ - μ)² / N`              |
| Sample Variance       | `s² = Σ(xᵢ - x̄)² / (N - 1)`        |
| Population Std. Dev.  | `σ = √σ²`                          |
| Sample Std. Dev.      | `s = √s²`                          |
| Simple Return         | `Rₜ = Pₜ/Pₜ₋₁ - 1`                 |
| Log Return            | `rₜ = ln(Pₜ/Pₜ₋₁)`                 |
| Cumulative Return     | `Π(1 + Rᵢ) - 1`                    |
| Covariance            | `Cov(X,Y) = Σ[(xᵢ-μx)(yᵢ-μy)] / N` |
| Correlation           | `ρXY = Cov(X,Y)/(σXσY)`            |
| Annualized Volatility | `σannual = σperiod√P`              |
| Sharpe Ratio          | `(Rp - Rf) / σ`                    |
| Drawdown              | `(Vₜ - Peakₜ) / Peakₜ`             |
| Maximum Drawdown      | `min(Drawdownₜ)`                   |
| Downside Deviation    | `√[Σmin(0,Rᵢ-T)²/N]`               |
| Portfolio Return      | `Rp = ΣwiRi`                       |
| Portfolio Variance    | `σp² = wᵀΣw`                       |
| Portfolio Volatility  | `σp = √(wᵀΣw)`                     |

---

# 10. Financial Interpretation Summary

The most useful way to remember these concepts is by the question each one answers.

| Concept                   | Question Answered                                           |
| ------------------------- | ----------------------------------------------------------- |
| **Mean**                  | What is the average?                                        |
| **Median**                | What is the middle observation?                             |
| **Variance**              | How dispersed are the observations?                         |
| **Standard Deviation**    | How much do observations typically vary?                    |
| **Simple Return**         | How much did the price change proportionally?               |
| **Log Return**            | What is the continuously compounded return?                 |
| **Cumulative Return**     | How much did the investment grow overall?                   |
| **Historical Volatility** | How variable has the asset historically been?               |
| **Covariance**            | How do two assets move together?                            |
| **Correlation**           | How strongly do two assets move together?                   |
| **Sharpe Ratio**          | How much excess return is generated per unit of total risk? |
| **Maximum Drawdown**      | What was the worst peak-to-trough loss?                     |
| **Downside Deviation**    | How much unfavorable variation exists?                      |
| **Portfolio Return**      | What did the combined portfolio earn?                       |
| **Portfolio Variance**    | How risky is the portfolio considering asset interactions?  |
| **Portfolio Volatility**  | What is the overall variability of portfolio returns?       |

---

# 11. QuantPulse Dependency Graph

The complete current dependency structure can be represented as:

```text
                           PRICE DATA
                              │
                              ▼
                     ┌─────────────────┐
                     │ ReturnsEngine   │
                     └────────┬────────┘
                              │
             ┌────────────────┼─────────────────┐
             │                │                 │
             ▼                ▼                 ▼
       Simple Return      Log Return      Cumulative Return
             │                │                 │
             └────────┬───────┘                 │
                      ▼                         │
               StatisticsEngine                │
                      │                         │
          ┌───────────┼────────────┐            │
          ▼           ▼            ▼            │
        Mean       Variance     Covariance       │
          │           │            │             │
          │           ▼            ▼             │
          │     Std. Deviation  Correlation      │
          │           │            │             │
          │           ▼            │             │
          │      Volatility       │             │
          │           │            │             │
          └─────┬─────┘            │             │
                ▼                  │             │
          ┌────────────┐           │             │
          │ RiskEngine │           │             │
          └─────┬──────┘           │             │
                │                  │             │
       ┌────────┼─────────┐        │             │
       ▼        ▼         ▼        │             │
    Sharpe   Drawdown  Downside    │             │
                       Deviation   │             │
                                   │             │
                         ┌─────────┴──────────┐  │
                         ▼                    ▼  ▼
                   Covariance Matrix     Portfolio Return
                         │                    │
                         └────────┬───────────┘
                                  ▼
                         ┌──────────────────┐
                         │ PortfolioEngine  │
                         └────────┬─────────┘
                                  │
                         ┌────────┴─────────┐
                         ▼                  ▼
                  Portfolio Variance   Portfolio Return
                         │
                         ▼
                  Portfolio Volatility
```

---

# 12. Current Implementation Status

The current quantitative foundation consists of:

## StatisticsEngine

```text
✓ Mean
✓ Median
✓ Population Variance
✓ Sample Variance
✓ Standard Deviation
✓ Covariance
✓ Correlation
```

## ReturnsEngine

```text
✓ Simple Return
✓ Log Return
✓ Cumulative Return
```

## VolatilityEngine

```text
✓ Historical Volatility
✓ Annualization
```

## RiskEngine

```text
✓ Sharpe Ratio
✓ Maximum Drawdown
✓ Downside Deviation
```

## PortfolioEngine

```text
✓ Portfolio Return
✓ Portfolio Variance
✓ Portfolio Volatility
```

## Validation / Testing

```text
✓ Unit tests
✓ Edge-case validation
✓ Exception handling
✓ GoogleTest-based testing
✓ Google Benchmark suite
```

The exact public API and implementation details should remain documented separately in the corresponding C++ headers and API documentation. This README is intended primarily as the **quantitative reference layer**.

---

# 13. Planned Quantitative Extensions

The current implementation creates a natural foundation for more advanced quantitative finance functionality.

## Phase 1 — Risk-Adjusted Performance

```text
Current:
✓ Sharpe Ratio
✓ Downside Deviation

Next:
→ Sortino Ratio
→ Calmar Ratio
```

### Sortino Ratio

The natural next metric is:

```text
Sortino = (Rp - T) / DownsideDeviation
```

It uses downside deviation instead of total standard deviation.

---

## Phase 2 — Market Risk

```text
→ Value at Risk (VaR)
→ Conditional Value at Risk (CVaR)
→ Historical VaR
→ Parametric VaR
→ Expected Shortfall
```

These metrics move QuantPulse from basic descriptive risk into formal **tail-risk analysis**.

---

## Phase 3 — Market Relationship Metrics

```text
→ Beta
→ Alpha
→ Tracking Error
→ Information Ratio
→ R-Squared
```

These allow QuantPulse to evaluate strategy and portfolio performance relative to a benchmark.

---

## Phase 4 — Portfolio Optimization

```text
→ Minimum Variance Portfolio
→ Maximum Sharpe Portfolio
→ Efficient Frontier
→ Mean-Variance Optimization
→ Risk Parity
→ Portfolio Constraints
```

The existing covariance matrix and portfolio variance implementation provide the mathematical foundation for this stage.

---

## Phase 5 — Market Microstructure

This is the stage that moves QuantPulse toward a stronger **quant/HFT-oriented analytics platform**.

Potential modules include:

```text
Order Book
    ↓
Bid / Ask
    ↓
Mid Price
    ↓
Spread
    ↓
Order Flow
    ↓
Trade Imbalance
    ↓
Market Impact
    ↓
Slippage
    ↓
Liquidity
    ↓
Execution Analytics
```

Potential metrics include:

```text
Bid-Ask Spread
Mid-Price
Microprice
Order Book Imbalance
Volume-Weighted Average Price (VWAP)
Time-Weighted Average Price (TWAP)
Implementation Shortfall
Price Impact
Execution Slippage
Liquidity Measures
```

---

# 14. Important Mathematical Assumptions

Quantitative formulas are only meaningful when their assumptions are understood.

## 14.1 Historical Volatility

Annualization using:

```text
σannual = σperiod√P
```

implicitly relies on assumptions such as:

- approximately independent returns
- stable variance
- consistent sampling frequency
- limited autocorrelation

Financial markets can violate these assumptions because volatility can cluster and returns can exhibit serial dependence.

---

## 14.2 Standard Deviation as Risk

Standard deviation measures total variability.

It does **not** distinguish between:

```text
Positive surprise
```

and:

```text
Negative surprise
```

Therefore:

```text
Standard Deviation
→ Total variation
```

while:

```text
Downside Deviation
→ Unfavorable variation
```

This distinction motivates the Sharpe vs. Sortino framework.

---

## 14.3 Correlation

Correlation measures **linear dependence**.

A correlation close to zero does not necessarily mean two assets are completely independent.

Two variables may have a nonlinear relationship while having low linear correlation.

---

## 14.4 Covariance Matrix

A covariance matrix used for portfolio analytics should generally satisfy mathematical properties such as:

```text
Symmetry
Positive semi-definiteness
```

A valid covariance matrix is essential for reliable portfolio variance calculations and optimization.

---

## 14.5 Simple Returns

For a conventional long-only investment:

```text
R ≥ -1
```

because a complete loss corresponds to:

```text
R = -100% = -1
```

A return below `-100%` is not possible for a conventional fully funded long position.

---

## 14.6 Numerical Stability

Financial calculations should be implemented carefully in C++ because floating-point arithmetic introduces rounding error.

Examples include:

```text
Very small variances
Near-zero denominators
Logarithms
Square roots
Correlation near ±1
Large price series
```

Domain validation and numerical checks are therefore part of the quantitative engine design, not merely implementation details.

---

# 15. Example End-to-End Workflow

A typical QuantPulse analysis can follow this sequence.

## Step 1 — Start With Prices

```text
Prices:

100
102
101
105
108
```

---

## Step 2 — Calculate Returns

Using simple returns:

```text
100 → 102 = +2.00%
102 → 101 ≈ -0.98%
101 → 105 ≈ +3.96%
105 → 108 ≈ +2.86%
```

---

## Step 3 — Calculate Statistics

From the return series:

```text
Mean
Variance
Standard Deviation
```

---

## Step 4 — Calculate Volatility

If the observations are daily:

```text
Historical Volatility
=
Daily Standard Deviation × √252
```

---

## Step 5 — Calculate Risk Metrics

Using the return series:

```text
Sharpe Ratio
Maximum Drawdown
Downside Deviation
```

---

## Step 6 — Combine Multiple Assets

For several assets:

```text
Asset Returns
      ↓
Covariance
      ↓
Correlation
      ↓
Covariance Matrix
```

---

## Step 7 — Apply Portfolio Weights

```text
Weights
   +
Expected Returns
   +
Covariance Matrix
```

produce:

```text
Portfolio Return
Portfolio Variance
Portfolio Volatility
```

---

# 16. Conceptual Hierarchy

The quantitative development of QuantPulse can be understood as a progression:

```text
LEVEL 1
Descriptive Statistics
│
├── Mean
├── Median
├── Variance
└── Standard Deviation
        │
        ▼
LEVEL 2
Return Analytics
│
├── Simple Return
├── Log Return
└── Cumulative Return
        │
        ▼
LEVEL 3
Volatility & Risk
│
├── Historical Volatility
├── Downside Deviation
└── Maximum Drawdown
        │
        ▼
LEVEL 4
Risk-Adjusted Performance
│
├── Sharpe
├── Sortino
└── Calmar
        │
        ▼
LEVEL 5
Multi-Asset Analytics
│
├── Covariance
├── Correlation
├── Portfolio Return
├── Portfolio Variance
└── Portfolio Volatility
        │
        ▼
LEVEL 6
Portfolio Construction
│
├── Efficient Frontier
├── Minimum Variance
├── Maximum Sharpe
└── Risk Parity
        │
        ▼
LEVEL 7
Quantitative Risk
│
├── VaR
├── CVaR
├── Beta
├── Alpha
└── Stress Testing
        │
        ▼
LEVEL 8
Market Microstructure
│
├── Order Book
├── Spread
├── Market Impact
├── Order Flow
├── Liquidity
└── Execution Analytics
```

---

# 17. Core Takeaway

QuantPulse should not be viewed as a collection of unrelated formulas.

It is a layered quantitative system:

```text
                    MARKET DATA
                        │
                        ▼
                     RETURNS
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
          STATISTICS           RISK
              │                   │
              ▼                   ▼
         VOLATILITY        RISK-ADJUSTED
              │             PERFORMANCE
              │                   │
              └─────────┬─────────┘
                        ▼
                 PORTFOLIO RISK
                        │
                        ▼
              PORTFOLIO OPTIMIZATION
                        │
                        ▼
                 QUANTITATIVE RISK
                        │
                        ▼
               MARKET MICROSTRUCTURE
```

The most important conceptual dependencies are:

```text
Prices
  ↓
Returns
  ↓
Statistics
  ↓
Volatility
  ↓
Risk Metrics
```

and:

```text
Asset Returns
  ↓
Covariance
  ↓
Covariance Matrix
  ↓
Portfolio Weights
  ↓
Portfolio Variance
  ↓
Portfolio Volatility
```

Understanding these dependencies is more important than memorizing individual formulas.

---

# 18. Recommended Development Order

Based on the current mathematical foundation, the next logical sequence is:

```text
✓ Statistics
✓ Returns
✓ Historical Volatility
✓ Sharpe Ratio
✓ Maximum Drawdown
✓ Downside Deviation
✓ Portfolio Return
✓ Portfolio Variance
✓ Portfolio Volatility

        ↓

NEXT

→ Sortino Ratio
→ Calmar Ratio
→ Beta
→ Alpha
→ Tracking Error
→ Information Ratio

        ↓

THEN

→ Historical VaR
→ Parametric VaR
→ CVaR / Expected Shortfall
→ Stress Testing
→ Scenario Analysis

        ↓

THEN

→ Portfolio Optimization
→ Efficient Frontier
→ Minimum Variance
→ Maximum Sharpe
→ Risk Parity

        ↓

THEN

→ Market Microstructure
→ Order Book Analytics
→ Spread
→ Microprice
→ Order Imbalance
→ Market Impact
→ Slippage
→ Execution Analytics
```

This order keeps the mathematical dependencies clean and allows each new QuantPulse component to build on a tested quantitative primitive rather than introducing disconnected functionality.

---

# QuantPulse Quantitative Foundation

**Current Status:** Core quantitative analytics implemented

**Primary Engines:**

```text
StatisticsEngine
ReturnsEngine
VolatilityEngine
RiskEngine
PortfolioEngine
```

**Core Areas:**

```text
Statistics
Returns
Volatility
Risk
Portfolio Analytics
```

**Future Areas:**

```text
Advanced Risk
Portfolio Optimization
Market Microstructure
Execution Analytics
```

> **QuantPulse principle:** Build mathematically correct, independently testable quantitative primitives first; compose them into increasingly sophisticated financial analytics only after their foundations are validated.
