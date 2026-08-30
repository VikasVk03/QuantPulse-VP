# ----------------------------
# Project Configuration
# ----------------------------

cmake_minimum_required(VERSION 3.20)

project(
    QuantPulseEngine
    VERSION 0.1.0
    LANGUAGES CXX 
)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

include(FetchContent)

add_library(
    quantpulse_core 
    src/domain/statistics/StatisticsEngine.cpp
    src/domain/returns/ReturnsEngine.cpp
    src/domain/volatility/VolatilityEngine.cpp
    src/domain/risk/RiskEngine.cpp 
    src/domain/portfolio/PortfolioEngine.cpp
    src/domain/microstructure/MarketMicrostructureEngine.cpp
    src/domain/features/FeatureEngine.cpp
    src/domain/signals/SignalEngine.cpp
    src/domain/strategy/StrategyEngine.cpp 
    src/domain/execution/ExecutionEngine.cpp
    src/domain/backtest/BacktestEngine.cpp
    src/domain/performance/PerformanceEngine.cpp 
    src/domain/research/ResearchEngine.cpp
)

target_include_directories(
    quantpulse_core
    PUBLIC
        ${CMAKE_CURRENT_SOURCE_DIR}/include
)

target_compile_options(
    quantpulse_core
    PRIVATE
        -Wall
        -Wextra 
        -Wpedantic
)

add_executable(
    quantpulse_demo
    src/main.cpp 
)

target_link_libraries(
    quantpulse_demo
    PRIVATE 
        quantpulse_core
)

add_executable(
    quantpulse_cli
    src/adapter/QuantPulseCLI.cpp
)

target_link_libraries(
    quantpulse_cli
    PRIVATE
        quantpulse_core
)

# ----------------------------
# Testing
# ----------------------------

enable_testing()

find_package(GTest REQUIRED)

add_executable(
    quantpulse_tests
    tests/statistics/StatisticsEngineTest.cpp
    tests/returns/ReturnsEngineTest.cpp
    tests/volatility/VolatilityEngineTest.cpp
    tests/risk/RiskEngineTest.cpp
    tests/portfolio/PortfolioEngineTest.cpp  
    tests/microstructure/MarketMicrostructureEngineTest.cpp
    tests/features/FeatureEngineTest.cpp
    tests/signals/SignalEngineTest.cpp
    tests/strategy/StrategyEngineTest.cpp
    tests/execution/ExecutionEngineTest.cpp
    tests/backtest/BacktestEngineTest.cpp
    tests/performance/PerformanceEngineTest.cpp
    tests/research/ResearchEngineTest.cpp
)

target_link_libraries(
    quantpulse_tests
    PRIVATE
        quantpulse_core
        GTest::gtest_main
)

include(GoogleTest)

gtest_discover_tests(quantpulse_tests)

# ----------------------------
# Benchmarking
# ----------------------------

set(BENCHMARK_ENABLE_TESTING OFF CACHE BOOL "" FORCE)
set(BENCHMARK_ENABLE_GTEST_TESTS OFF CACHE BOOL "" FORCE)

FetchContent_Declare(
    google_benchmark
    GIT_REPOSITORY https://github.com/google/benchmark.git
    GIT_TAG v1.9.4
    GIT_SHALLOW TRUE
)

FetchContent_MakeAvailable(google_benchmark)

add_executable(
    quantpulse_benchmarks
    benchmarks/BenchmarkMain.cpp
    benchmarks/statistics/StatisticsEngineBenchmark.cpp
    benchmarks/returns/ReturnsEngineBenchmark.cpp
    benchmarks/volatility/VolatilityEngineBenchmark.cpp
    benchmarks/risk/RiskEngineBenchmark.cpp
    benchmarks/portfolio/PortfolioEngineBenchmark.cpp
    benchmarks/microstructure/MarketMicrostructureEngineBenchmark.cpp
    benchmarks/features/FeatureEngineBenchmarks.cpp
    benchmarks/signals/SignalEngineBenchmark.cpp
    benchmarks/strategy/StrategyEngineBenchmark.cpp
    benchmarks/execution/ExecutionEngineBenchmark.cpp
    benchmarks/backtest/BacktestEngineBenchmark.cpp
    benchmarks/performance/PerformanceEngineBenchmark.cpp
    benchmarks/research/ResearchEngineBenchmark.cpp
)

target_link_libraries(
    quantpulse_benchmarks
    PRIVATE 
        quantpulse_core
        benchmark::benchmark   
)
