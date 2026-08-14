# QuantPulse Research Framework

## Status

**Initial research framework**

The QuantPulse research framework is currently in the design stage.

The goal is to build a research system that supports systematic experimentation, reproducibility, quantitative evaluation, and critical interpretation of results.

QuantPulse should support a research workflow rather than simply displaying financial charts.

---

# 1. Objective

The research framework should allow a researcher to move from an initial hypothesis to a measurable conclusion through a structured process.

The intended workflow is:

```text
Hypothesis
    |
    v
Data Selection
    |
    v
Feature Engineering
    |
    v
Experiment
    |
    v
Backtest
    |
    v
Evaluation
    |
    v
Conclusion
```

Each stage should produce enough information for the next stage to be understood and reproduced.

The system should prioritize **scientific discipline and reproducibility** over producing attractive backtest results.

---

# 2. Research Principles

Every research experiment should clearly document:

- Hypothesis
- Dataset
- Time period
- Instruments
- Features
- Methodology
- Assumptions
- Parameters
- Evaluation metrics
- Results
- Limitations
- Conclusion

The objective is to make it possible for another researcher to understand:

> What was tested, why it was tested, how it was tested, and what the results actually demonstrate.

---

# 3. Research Workflow

## 3.1 Hypothesis

Every experiment should begin with a clearly defined hypothesis.

A good hypothesis should be:

- Specific
- Testable
- Falsifiable
- Quantifiable

Example:

```text
Hypothesis:

Extreme short-term order-flow imbalance is associated with
subsequent short-horizon price movement.
```

The hypothesis should be defined before examining the final backtest results whenever practical.

This helps reduce the risk of changing the research question after seeing the data.

---

# 4. Data Selection

The dataset used by an experiment should be explicitly documented.

Important information includes:

- Data source
- Instrument
- Exchange
- Asset class
- Time period
- Sampling frequency
- Data type
- Data cleaning rules
- Missing-data treatment
- Corporate-action treatment where applicable

Example:

```text
Dataset:
    Instrument: XYZ
    Exchange: Example Exchange
    Period: 2024-01-01 → 2025-01-01
    Frequency: 1-minute
    Data Type: OHLCV
```

The exact dataset should eventually be identifiable or versioned so that an experiment can be reproduced.

---

# 5. Data Quality

Research conclusions are only as reliable as the data used to produce them.

The research pipeline should consider:

- Missing observations
- Duplicate records
- Invalid prices
- Invalid quantities
- Timestamp errors
- Out-of-order events
- Trading-session boundaries
- Corporate actions
- Trading halts
- Data-source changes

Data cleaning and filtering rules should be documented rather than silently applied.

---

# 6. Feature Engineering

Feature engineering converts raw market data into variables used by a research model.

Potential features include:

### Price-Based Features

- Simple returns
- Log returns
- Rolling returns
- Moving averages
- Price momentum

### Volatility Features

- Rolling volatility
- Historical volatility
- Realized volatility
- EWMA volatility

### Market Microstructure Features

- Bid-ask spread
- Mid price
- Order imbalance
- Trade imbalance
- Trade intensity
- Order-book depth
- Price impact

### Volume Features

- Volume
- Relative volume
- VWAP
- Volume imbalance

Every feature should document:

- Definition
- Formula
- Input data
- Lookback period
- Sampling frequency
- Missing-data behavior
- Units

---

# 7. Experiment Design

An experiment should define exactly what is being tested.

A conceptual experiment record may contain:

```text
Experiment
    |
    +-- Hypothesis
    |
    +-- Dataset
    |
    +-- Features
    |
    +-- Parameters
    |
    +-- Methodology
    |
    +-- Evaluation Metrics
    |
    +-- Results
    |
    +-- Limitations
    |
    +-- Conclusion
```

The experiment should distinguish between:

- Inputs
- Model assumptions
- Parameters
- Observations
- Derived results
- Conclusions

This separation is important for reproducibility.

---

# 8. Methodology

The methodology should describe how the hypothesis is evaluated.

Depending on the research problem, this may include:

- Statistical analysis
- Correlation analysis
- Regression
- Classification
- Time-series analysis
- Factor analysis
- Signal analysis
- Backtesting
- Simulation

The methodology should specify:

```text
Input
  |
  v
Transformation
  |
  v
Model / Signal
  |
  v
Output
  |
  v
Evaluation
```

The methodology should be defined independently of the final conclusion.

---

# 9. Backtesting

Backtesting allows a trading strategy or signal to be evaluated against historical data.

A conceptual workflow is:

```text
Historical Data
       |
       v
Feature Calculation
       |
       v
Signal Generation
       |
       v
Position / Order Logic
       |
       v
Transaction Costs
       |
       v
Portfolio Simulation
       |
       v
Performance Metrics
```

A backtest should document:

- Strategy
- Instruments
- Dataset
- Time period
- Initial capital
- Position sizing
- Entry rules
- Exit rules
- Transaction costs
- Slippage assumptions
- Liquidity assumptions
- Risk constraints
- Rebalancing frequency

---

# 10. Evaluation Metrics

Research results should use metrics appropriate to the hypothesis.

Potential metrics include:

### Return Metrics

- Total return
- Annualized return
- Average return
- Excess return

### Risk Metrics

- Volatility
- Maximum drawdown
- Value at Risk
- Conditional Value at Risk

### Risk-Adjusted Metrics

- Sharpe ratio
- Sortino ratio
- Calmar ratio

### Trading Metrics

- Number of trades
- Win rate
- Average trade return
- Profit factor
- Average holding period
- Turnover

The selected metrics should be defined before interpreting the results.

---

# 11. Statistical Significance

A strong backtest result is not necessarily a statistically meaningful result.

Depending on the research question, experiments may eventually include:

- Confidence intervals
- Hypothesis tests
- Standard errors
- Bootstrap methods
- Out-of-sample evaluation
- Cross-validation where appropriate
- Statistical significance tests

The choice of statistical methodology should match the structure of the data.

Financial time series frequently violate assumptions such as independent and identically distributed observations, so statistical conclusions must be interpreted carefully.

---

# 12. Training and Testing Data

Where models are fitted to historical data, the research framework should distinguish between:

```text
Historical Dataset
       |
       +---- Training / Development
       |
       +---- Validation
       |
       +---- Test / Out-of-Sample
```

The exact split depends on the research methodology.

Future research infrastructure should avoid using future information when constructing features, labels, or model parameters.

---

# 13. Look-Ahead Bias

Look-ahead bias occurs when information that would not have been available at the time is used in a historical simulation.

Examples include:

- Using future prices to generate current signals
- Using future corporate information
- Calculating statistics using observations after the decision timestamp
- Incorrectly aligning features and targets

Research code should explicitly consider timestamp alignment.

Conceptually:

```text
Information Available at t
          |
          v
Signal at t
          |
          v
Decision at t
          |
          v
Future Outcome
```

Information from the future must not flow backward into the decision process.

---

# 14. Survivorship Bias

Survivorship bias occurs when historical analysis includes only assets that survived until the end of the observation period.

For example, evaluating a historical equity strategy using only today's surviving companies may produce misleading results.

Where relevant, research datasets should account for:

- Delisted instruments
- Failed companies
- Historical constituents
- Corporate actions
- Changing index membership

The treatment of survivorship should be documented for each experiment.

---

# 15. Transaction Costs

Backtests that ignore transaction costs can materially overstate strategy performance.

Relevant costs may include:

- Brokerage fees
- Exchange fees
- Taxes
- Slippage
- Bid-ask spread
- Market impact
- Financing costs

The research framework should allow transaction-cost assumptions to be explicitly specified.

Example:

```text
Gross Return
     |
     - Transaction Costs
     - Slippage
     - Market Impact
     |
     v
Net Return
```

---

# 16. Slippage

Slippage represents the difference between an expected execution price and the actual simulated execution price.

A backtest should document whether slippage is:

- Fixed
- Percentage-based
- Spread-based
- Volume-dependent
- Liquidity-dependent
- Market-impact-based

The model should be appropriate for the strategy and market being studied.

---

# 17. Liquidity

A strategy that appears profitable on historical prices may not be executable at the required size.

Research should consider:

- Average traded volume
- Order-book depth
- Bid-ask spread
- Position size
- Participation rate
- Market impact

Where possible, backtests should impose realistic execution constraints.

---

# 18. Overfitting

Overfitting occurs when a strategy or model is excessively tuned to historical data.

A strategy can appear highly successful in-sample while having little predictive value out-of-sample.

Potential warning signs include:

- Excessive parameter tuning
- Large numbers of tested strategies
- Very complex models
- Exceptional in-sample performance
- Significant degradation out-of-sample

The research process should distinguish between:

```text
Research / Development Data
          |
          v
Model Selection
          |
          v
Out-of-Sample Evaluation
```

The final test data should not repeatedly be used to tune the strategy.

---

# 19. Multiple Testing

Testing many hypotheses increases the probability of finding apparently significant results by chance.

For example:

```text
100 hypotheses
      |
      v
Multiple statistical tests
      |
      v
Some apparently significant results
      |
      v
Potential false discoveries
```

Future research tooling should consider methods for handling multiple comparisons where appropriate.

Research reports should disclose extensive hypothesis or parameter searches.

---

# 20. Regime Changes

Financial markets are not stationary.

Relationships that appear in one period may weaken or disappear in another.

Potential regime changes may involve:

- Volatility
- Interest rates
- Market structure
- Liquidity
- Regulation
- Technology
- Investor behavior
- Macroeconomic conditions

Research conclusions should therefore specify the historical period over which the relationship was observed.

---

# 21. Reproducibility

Reproducibility is a core requirement of the QuantPulse research framework.

Each experiment should record:

- Dataset
- Dataset version where available
- Configuration
- Parameters
- Feature definitions
- Methodology
- Code version
- Execution environment
- Execution timestamp
- Results

Conceptually:

```text
Experiment
    |
    +-- Dataset Version
    +-- Code Version
    +-- Configuration
    +-- Parameters
    +-- Environment
    +-- Results
```

The objective is to make it possible to reproduce an experiment rather than relying on undocumented local state.

---

# 22. Experiment Metadata

A future experiment record may contain:

```text
experiment_id
name
hypothesis
dataset
dataset_version
instruments
time_period
features
methodology
parameters
assumptions
code_version
environment
created_at
executed_at
results
limitations
conclusion
```

This is a conceptual model and should not be treated as a finalized database schema.

---

# 23. Research Results

Results should distinguish between raw observations and conclusions.

For example:

```text
Observed Result:
Correlation = X

Interpretation:
The experiment observed a relationship between
feature A and outcome B during the tested period.

Conclusion:
The evidence does / does not support the original hypothesis.
```

A correlation or backtest metric should not automatically be interpreted as proof of causation.

---

# 24. Limitations

Every research experiment should include a limitations section.

Potential limitations include:

- Limited historical period
- Limited sample size
- Data-quality issues
- Transaction-cost assumptions
- Slippage assumptions
- Liquidity assumptions
- Model assumptions
- Look-ahead risk
- Survivorship bias
- Overfitting
- Multiple testing
- Regime changes
- Execution constraints

The purpose is to clearly communicate what the experiment does **not** establish.

---

# 25. Research Conclusion

A conclusion should directly address the original hypothesis.

A useful structure is:

```text
Hypothesis
    |
    v
Evidence
    |
    v
Interpretation
    |
    v
Conclusion
    |
    v
Limitations
    |
    v
Next Experiment
```

The conclusion should not claim more than the experiment supports.

---

# 26. Important Principle

A backtest result should **not automatically be treated as evidence that a trading strategy works in live markets**.

Historical simulations are subject to assumptions and implementation choices that may not hold in production.

Results must be interpreted with respect to:

- Transaction costs
- Slippage
- Liquidity
- Look-ahead bias
- Survivorship bias
- Overfitting
- Multiple testing
- Regime changes
- Data quality
- Execution constraints

A profitable backtest is therefore an observation requiring further investigation, not proof of future profitability.

---

# 27. Planned Research Areas

QuantPulse may eventually support research in the following areas.

## Market Microstructure

- Order-book dynamics
- Bid-ask spread
- Market depth
- Price formation
- Liquidity

## Order Flow

- Order-flow imbalance
- Trade imbalance
- Trade intensity
- Aggressive buying/selling

## Short-Term Prediction

- Price direction
- Return prediction
- Signal classification
- Short-horizon forecasting

## Volatility Modeling

- Historical volatility
- Realized volatility
- EWMA volatility
- Volatility forecasting

## Trading Strategies

- Mean reversion
- Momentum
- Trend following
- Statistical signals

## Liquidity and Price Impact

- Liquidity measurement
- Market impact
- Execution analysis
- Transaction-cost modeling

## Risk Modeling

- VaR
- CVaR
- Drawdown
- Portfolio risk
- Factor exposure

These areas are planned research directions and do not imply that the corresponding models or strategies are currently implemented.

---

# 28. Research Experiment Lifecycle

A future QuantPulse experiment may follow this lifecycle:

```text
Draft
  |
  v
Defined
  |
  v
Data Prepared
  |
  v
Experiment Running
  |
  v
Completed
  |
  +----> Failed
  |
  v
Evaluated
  |
  v
Reviewed
  |
  v
Concluded
```

The exact experiment state model will be defined when the research service is implemented.

---

# 29. Research Review Checklist

Before accepting a research result, the researcher should be able to answer:

- What was the hypothesis?
- What data was used?
- What time period was tested?
- Which instruments were included?
- How was the data cleaned?
- What features were used?
- Were the features available at the decision time?
- What methodology was used?
- What parameters were selected?
- Were transaction costs modeled?
- Was slippage modeled?
- Were liquidity constraints considered?
- Was the result evaluated out-of-sample?
- Could survivorship bias be present?
- Could look-ahead bias be present?
- How much parameter tuning was performed?
- Were multiple hypotheses tested?
- Which metrics were used?
- What are the limitations?
- Can the experiment be reproduced?
- Does the conclusion actually follow from the evidence?

---

# 30. Relationship to Backtesting

Research and backtesting are related but distinct.

```text
Research
   |
   +---- Hypothesis
   +---- Data
   +---- Features
   +---- Methodology
   +---- Experiment
   +---- Evaluation
   +---- Conclusion
             |
             v
        Backtesting
```

A backtest is one possible research methodology.

Not every research question requires a trading strategy or backtest.

For example, a market-microstructure study may investigate statistical relationships without directly constructing a trading strategy.

---

# 31. Relationship to Quantitative Models

Research experiments should use the quantitative models documented in:

```text
docs/quant-model.md
```

Where a model is used, the experiment should identify:

- Model name
- Model version where applicable
- Parameters
- Input data
- Output
- Assumptions

This creates a link between mathematical definitions and empirical research.

---

# 32. Relationship to Data Model

Research metadata should eventually integrate with the conceptual data model described in:

```text
docs/data-model.md
```

A conceptual relationship is:

```text
Research Experiment
        |
        +---- Dataset
        |
        +---- Instrument
        |
        +---- Features
        |
        +---- Quantitative Model
        |
        +---- Backtest
        |
        +---- Results
```

The database representation is not yet finalized.

---

# 33. Current Status

The research framework is currently **planned**.

QuantPulse does not yet claim to have:

- A production research platform
- A finalized experiment schema
- A finalized dataset-versioning system
- A finalized feature store
- A production backtesting framework
- Automated bias detection
- Automated statistical validation
- A standardized research-report format

These capabilities should be added incrementally as the underlying systems are implemented.

---

# 34. Future Work

Planned research infrastructure includes:

1. Define the experiment data model.
2. Implement dataset identification and versioning.
3. Build reproducible feature-generation pipelines.
4. Connect quantitative models to experiments.
5. Implement backtesting workflows.
6. Add standardized evaluation metrics.
7. Add experiment result storage.
8. Record code and environment versions.
9. Add research reports.
10. Add benchmark and performance metadata.
11. Introduce validation for common research biases.
12. Support comparison between experiments.
13. Build out-of-sample evaluation workflows.

---

# 35. Design Goal

The QuantPulse research framework should make quantitative research **structured, reproducible, measurable, and appropriately skeptical**.

The intended workflow is:

```text
Question
   |
   v
Hypothesis
   |
   v
Data
   |
   v
Experiment
   |
   v
Evidence
   |
   v
Evaluation
   |
   v
Conclusion
   |
   v
Reproducible Research
```

The purpose of the framework is not to prove that a strategy works.

Its purpose is to determine, as rigorously as practical:

> **What does the available evidence actually support?**
