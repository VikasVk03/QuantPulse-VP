# QuantPulse Benchmarking

## Status

**Initial benchmarking design**

Benchmarking infrastructure and results are not yet fully implemented.

This document defines how QuantPulse should measure and report performance as the project evolves.

Performance claims should be based on reproducible measurements rather than assumptions about a particular programming language, library, compiler, or implementation.

---

# 1. Purpose

QuantPulse should use benchmarking to answer questions such as:

- How long does a quantitative operation take?
- How does execution time change with input size?
- How much memory does an implementation require?
- How does throughput scale?
- Which implementation is faster for a specific workload?
- Did an optimization actually improve performance?
- What is the performance variability between runs?

The project should avoid unsupported statements such as:

> "C++ is faster."

Instead, performance claims should define the workload, implementation, environment, and measurement methodology.

A meaningful benchmark statement should look more like:

```text
For a dataset containing 1,000,000 observations,
implementation A completed the mean calculation in X µs
under the specified benchmark environment.
```

---

# 2. Benchmarking Principles

QuantPulse benchmarking should follow these principles:

1. **Measure before optimizing.**
2. **Benchmark equivalent workloads.**
3. **Separate correctness from performance.**
4. **Document the execution environment.**
5. **Use multiple iterations.**
6. **Account for warm-up effects where applicable.**
7. **Report statistical summaries rather than a single lucky measurement.**
8. **Keep benchmark inputs reproducible.**
9. **Avoid including unrelated setup work in the measured operation.**
10. **Re-run benchmarks after significant optimizations.**

---

# 3. Primary Metrics

The primary performance metrics are:

- Execution time
- Throughput
- Memory usage
- p50 latency
- p95 latency
- p99 latency

Not every benchmark will require every metric.

---

## 3.1 Execution Time

Execution time measures how long an operation takes to complete.

Example:

```text
Execution Time = end_time - start_time
```

The unit should be selected according to the workload:

```text
ns
µs
ms
s
```

Very small numerical operations may require nanosecond or microsecond measurements, while large backtests may be better represented in milliseconds or seconds.

---

## 3.2 Throughput

Throughput measures how much work can be completed per unit of time.

For an operation processing `N` observations:

```text
Throughput = N / execution_time
```

Possible units include:

```text
observations / second
operations / second
records / second
```

Throughput should always specify what constitutes one unit of work.

---

## 3.3 Memory Usage

Memory usage measures the resources required by an operation.

Depending on the benchmark, this may include:

- Peak resident memory
- Heap allocation
- Temporary allocations
- Dataset storage
- Output storage

Memory measurements should clearly state what is included.

---

## 3.4 Latency Percentiles

For repeated measurements, latency should be summarized using percentiles.

### p50

The median measured latency.

```text
p50 = 50th percentile
```

This represents typical performance.

### p95

The latency below which approximately 95% of observations fall.

```text
p95 = 95th percentile
```

This helps identify slower-than-usual executions.

### p99

The latency below which approximately 99% of observations fall.

```text
p99 = 99th percentile
```

This is particularly useful for latency-sensitive operations.

---

# 4. Planned C++ Benchmarks

The initial benchmark suite should focus on the statistical functionality implemented by the C++ quant engine.

## 4.1 Statistics

Planned benchmarks:

- Mean
- Median
- Population variance
- Standard deviation

Each benchmark should measure the implementation across multiple dataset sizes.

---

## 4.2 Future Quantitative Benchmarks

As new quantitative models are implemented, benchmarks may be added for:

- Simple returns
- Log returns
- Rolling statistics
- Historical volatility
- Realized volatility
- EWMA volatility
- Covariance
- Correlation
- Sharpe ratio
- Sortino ratio
- Maximum drawdown
- VaR
- CVaR
- Beta
- Alpha
- VWAP
- TWAP

---

## 4.3 Future Market-Data Benchmarks

Market-data functionality may eventually require benchmarks for:

- Trade processing
- Quote processing
- Order-book updates
- Order-book snapshots
- Market-data aggregation
- Time-series queries
- Market-data ingestion

These benchmarks should be introduced only after the corresponding functionality exists.

---

# 5. Dataset Sizes

The initial planned benchmark sizes are:

```text
1,000
10,000
100,000
1,000,000
10,000,000
```

These sizes are intended to reveal how an implementation behaves as the workload grows.

The exact sizes may vary depending on the operation.

For example, a latency-sensitive order-book operation may require much smaller datasets than a batch historical calculation.

---

# 6. Benchmark Workload

Every benchmark should define its workload explicitly.

At minimum, the benchmark should identify:

```text
Operation
Input type
Input size
Input characteristics
Expected output
Number of iterations
```

For numerical algorithms, input characteristics may include:

- Random data
- Sequential data
- Constant values
- Positive values
- Negative values
- Mixed values
- Realistic market-data distributions

Where random data is used, the random seed should be controlled when reproducibility is important.

---

# 7. Benchmark Environment

Each benchmark result should document the environment in which it was executed.

Required information:

- CPU
- CPU core count where relevant
- OS
- Compiler
- Compiler version
- Compiler optimization flags
- Build configuration
- Architecture
- Benchmark framework/version where applicable

Example:

```text
CPU:              <CPU model>
OS:               <Operating system>
Architecture:     <architecture>
Compiler:         <compiler>
Compiler Version: <version>
Optimization:     -O3
Build Type:       Release
```

The exact environment will be recorded when benchmark infrastructure is implemented.

---

# 8. Compiler Configuration

Compiler optimization settings can significantly affect numerical performance.

Benchmarks should therefore record the relevant compiler flags.

Examples may include:

```text
-O0
-O2
-O3
```

Additional architecture-specific optimizations may also affect results.

The benchmark report must state which configuration was used rather than assuming that all C++ builds have equivalent performance.

---

# 9. Iterations and Warm-Up

Each benchmark should perform enough iterations to produce stable measurements.

The number of iterations should depend on the operation.

For example:

```text
Small operation:
many iterations

Large operation:
fewer iterations
```

Where applicable, warm-up iterations should be performed before collecting measurements.

This can help reduce the influence of:

- Initialization costs
- Cache effects
- Runtime setup
- Memory allocation behavior
- CPU frequency transitions

The warm-up strategy must be documented.

---

# 10. Measurement Method

The measurement method must be consistent and appropriate for the operation.

The benchmark should measure only the work being evaluated.

For example:

```text
Input Generation
       |
       v
Benchmark Setup
       |
       v
Start Timer
       |
       v
Operation Under Test
       |
       v
Stop Timer
```

Input generation should generally occur outside the timed section unless input generation itself is the subject of the benchmark.

Likewise, result validation should normally occur outside the measured operation.

---

# 11. Correctness Before Performance

A benchmark must not be used as a substitute for correctness testing.

The expected development sequence is:

```text
Implementation
      |
      v
Correctness Tests
      |
      v
Benchmark
```

An implementation that produces incorrect results should not be considered faster simply because it completes more quickly.

Benchmark results are meaningful only when competing implementations perform equivalent work and produce equivalent results.

---

# 12. Benchmark Isolation

Benchmarks should minimize unrelated work.

Avoid measuring:

```text
File I/O
Logging
Console output
Network requests
Unrelated allocations
Debug assertions
Dataset generation
```

unless those operations are explicitly part of the workload being measured.

For quantitative calculations, the preferred benchmark should isolate the numerical operation itself.

---

# 13. Statistical Reporting

A benchmark should not rely on a single measurement.

Instead, repeated measurements should be collected and summarized.

A typical report may include:

```text
Minimum
Maximum
Mean
Median
p50
p95
p99
Standard deviation
```

For highly variable workloads, additional statistics may be useful.

The exact reporting format will depend on the benchmark framework selected by the project.

---

# 14. Example Benchmark Result

A future benchmark report may look conceptually like:

```text
Benchmark: StatisticsEngine::mean
Dataset:   1,000,000 observations

Iterations: 1000

Metric              Result
--------------------------------
p50                 X µs
p95                 X µs
p99                 X µs
Mean                X µs
Throughput          X observations/s
Memory              X MB
```

The actual values should come only from executed benchmark runs.

Documentation must not contain fabricated performance numbers.

---

# 15. Scaling Analysis

Benchmarking should examine how performance changes with input size.

For example:

```text
Dataset Size       Execution Time
----------------------------------
1,000               X
10,000              X
100,000             X
1,000,000           X
10,000,000          X
```

This helps identify whether an implementation behaves consistently with its expected algorithmic complexity.

For example, a linear algorithm should generally demonstrate approximately linear growth in execution time as input size increases, subject to hardware and implementation effects.

---

# 16. Complexity vs. Benchmark Results

Algorithmic complexity and measured performance answer different questions.

For example:

```text
Algorithmic Complexity
        |
        v
Theoretical scaling behavior


Benchmarking
        |
        v
Observed performance on real hardware
```

Both should be considered.

A benchmark should not be used to replace complexity analysis, and complexity analysis should not be used to claim a specific runtime without measurement.

---

# 17. Memory Benchmarking

Memory usage should be evaluated separately from execution time when appropriate.

Particular attention should be paid to operations that copy data.

For example, the current median implementation copies and sorts its input:

```text
Input
  |
  +---- Copy
         |
         v
       Sort
```

This has different memory characteristics from an implementation that operates in-place or uses a selection algorithm.

Future benchmarks may compare these implementations once alternative implementations exist.

---

# 18. Benchmark Comparison Rules

When comparing two implementations, ensure that:

- They receive equivalent inputs.
- They perform equivalent work.
- They produce equivalent results.
- They run under comparable conditions.
- Compiler configurations are documented.
- Dataset sizes are identical.
- Measurement methodology is identical.
- Warm-up behavior is comparable.
- Statistical summaries are reported.

Avoid comparisons based on a single execution.

---

# 19. Optimization Rule

**Do not optimize before measuring.**

The intended optimization process is:

```text
Implement
   |
   v
Correctness Test
   |
   v
Benchmark
   |
   v
Profile
   |
   v
Identify Bottleneck
   |
   v
Optimize
   |
   v
Benchmark Again
   |
   v
Verify Correctness
```

An optimization should be considered successful only when it:

1. Preserves correctness.
2. Improves the relevant performance metric.
3. Does not introduce unacceptable memory usage.
4. Does not create unacceptable complexity.
5. Is supported by benchmark measurements.

---

# 20. Profiling

When a benchmark identifies a performance problem, profiling should be used to determine where execution time is being spent.

Potential bottlenecks include:

- Algorithmic complexity
- Memory allocation
- Memory access
- Cache misses
- Branching
- Sorting
- Data copying
- Function-call overhead
- Synchronization
- I/O

Optimization should target measured bottlenecks rather than assumptions.

---

# 21. Regression Benchmarking

Performance should be monitored as the codebase evolves.

A future benchmark workflow may compare:

```text
Current Commit
      |
      v
Benchmark
      |
      v
Compare Against Baseline
      |
      v
Performance Regression?
      |
   +--+--+
   |     |
  Yes    No
   |     |
   v     v
Investigate  Continue
```

Performance regressions should be investigated when they are significant and reproducible.

The exact regression thresholds are not yet defined.

---

# 22. Reproducibility

Benchmark results should contain enough metadata to reproduce the measurement.

At minimum:

```text
Commit
CPU
OS
Compiler
Compiler Version
Compiler Flags
Build Configuration
Dataset Size
Dataset Characteristics
Iterations
Warm-up Strategy
Benchmark Framework
Measurement Method
```

If generated data is used:

```text
Random Seed
```

should also be recorded where appropriate.

---

# 23. Benchmark Storage

The project may eventually store benchmark results in a structured format such as:

```text
benchmarks/
    results/
        <benchmark-run>.json
```

or another machine-readable format.

The exact storage strategy has not yet been finalized.

Benchmark source code and benchmark results should remain distinguishable.

---

# 24. Benchmark Naming

Benchmark names should clearly identify the operation and workload.

Examples:

```text
StatisticsEngine_Mean_1K
StatisticsEngine_Mean_10K
StatisticsEngine_Mean_100K

StatisticsEngine_Median_1K
StatisticsEngine_Median_10K
StatisticsEngine_Median_100K
```

For more complex benchmarks:

```text
Volatility_Historical_1M
OrderBook_Update_100K
VaR_Historical_1M
```

Naming conventions should remain consistent across the benchmark suite.

---

# 25. Planned Benchmark Matrix

The initial benchmark matrix is:

| Operation          |      1K |     10K |    100K |      1M |     10M |
| ------------------ | ------: | ------: | ------: | ------: | ------: |
| Mean               | Planned | Planned | Planned | Planned | Planned |
| Median             | Planned | Planned | Planned | Planned | Planned |
| Variance           | Planned | Planned | Planned | Planned | Planned |
| Standard Deviation | Planned | Planned | Planned | Planned | Planned |

Future operations will be added as their implementations become available.

---

# 26. Current Status

At this stage, QuantPulse should treat benchmarking as **planned infrastructure**, not as an existing source of performance claims.

The project currently does not claim:

- A specific execution time
- A specific throughput
- A specific memory footprint
- A specific C++ performance advantage
- A specific Node.js/C++ performance ratio

Such claims should only be added after reproducible benchmark runs have been performed.

---

# 27. Future Benchmark Work

Planned work includes:

1. Select a C++ benchmark framework.
2. Implement the initial statistics benchmarks.
3. Generate reproducible benchmark datasets.
4. Define environment metadata.
5. Establish baseline measurements.
6. Add benchmark result reporting.
7. Add profiling workflows.
8. Add regression detection.
9. Benchmark new quantitative models as they are implemented.
10. Evaluate storage and processing strategies using realistic market-data workloads.

---

# 28. Design Goal

QuantPulse benchmarking should provide **evidence rather than assumptions**.

The goal is not simply to produce impressive numbers. The goal is to understand:

```text
What was measured?
        |
        v
Under what conditions?
        |
        v
Using which implementation?
        |
        v
With what workload?
        |
        v
How reproducible is the result?
        |
        v
Did the optimization actually help?
```

All future performance claims should be traceable to documented, reproducible measurements.
