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
    benchmarks/statistics/StatisticsEngineBenchmark.cpp
    benchmarks/returns/ReturnsEngineBenchmark.cpp
    benchmarks/volatility/VolatilityEngineBenchmark.cpp
)

target_link_libraries(
    quantpulse_benchmarks
    PRIVATE 
        quantpulse_core
        benchmark::benchmark   
)
