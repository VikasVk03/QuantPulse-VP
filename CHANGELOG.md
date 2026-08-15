# Changelog

All notable changes to QuantPulse are documented here.

---

## [Unreleased]

### Added

- Initial QuantPulse monorepo structure
- C++20 quantitative engine
- CMake + Ninja build configuration
- StatisticsEngine
- Mean calculation
- Median calculation
- Population variance
- Standard deviation
- Initial project documentation

### Testing

- Manual execution of StatisticsEngine demo verified
- Added GoogleTest integration
- Added CTest integration
- Added 10 StatisticsEngine unit tests
- Added edge-case tests for empty datasets
- Added tests for negative and single-value datasets
- Added tests for odd/even median datasets
- Verified 100% test pass rate

---

## [0.1.0] — 2026-08-14

### Added

- Initial project architecture
- Frontend structure
- Backend structure
- C++ engine structure
- Documentation structure
- Benchmark structure
- Docker structure

### C++ Engine

- Added StatisticsEngine
- Added mean calculation
- Added median calculation
- Added population variance
- Added standard deviation

### Build

- Added CMake configuration
- Added C++20 configuration
- Added Ninja build support
