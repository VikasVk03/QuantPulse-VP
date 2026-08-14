cmake_minimum_required(VERSION 3.20)

project(
    QuantPulseEngine
    VERSION 0.1.0
    LANGUAGES CXX 
)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

add_library(quantpulse_core src/domain/statistics/StatisticsEngine.cpp)

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