# QuantPulse Runbook

Operational setup and development guide for the QuantPulse market analytics platform.

## 1. Current Scope

The currently connected local workflow is:

```text
OHLCV CSV
  -> C++20 quant engine
  -> JSON analytics contract
  -> Node.js/Express API
  -> React/Vite terminal
```

Implemented local capabilities include:

- C++ quantitative domain library
- MarketBar v1 OHLCV ingestion
- CSV validation and analytics
- C++ CLI JSON output
- Node.js REST API
- React market dashboard
- Lightweight Charts price/volume visualization
- GoogleTest and CTest
- Google Benchmark

Not required for the current local run:

- MongoDB
- Redis
- gRPC
- Docker
- Authentication
- Backtesting API integration
- CI/CD

Those are future architecture items and should not be started as part of routine local setup.

## 2. Repository Layout

```text
QuantPulse-VP/
├── backend/       Node.js + TypeScript + Express API
├── frontend/      React + TypeScript + Vite terminal
├── cpp-engine/    C++20 quant library, CLI, tests, benchmarks
├── data/          Schemas and sample market data
├── docs/          Architecture, methodology, and runbooks
├── scripts/       Reserved project scripts
└── docker/        Reserved deployment files; currently empty
```

## 3. Required Tools

### 3.1 All Platforms

Install:

- Git
- Node.js 24.x, as specified by `.nvmrc`
- npm, bundled with Node.js
- CMake 3.20 or newer
- A C++20 compiler
- GoogleTest development package or vcpkg installation
- Internet access during first CMake configure, because Google Benchmark is fetched with CMake `FetchContent`

Recommended:

- Visual Studio Code
- VS Code C/C++ tooling
- VS Code CMake Tools extension
- Ninja
- PowerShell on Windows or Bash on Linux/WSL

### 3.2 Windows Native Build

Install Visual Studio 2022 or newer with:

- Desktop development with C++ workload
- MSVC compiler
- Windows 10/11 SDK
- CMake tools for Windows

The repository has been validated with the Visual Studio generator on Windows.

### 3.3 WSL/Linux Build

Install the distribution packages:

```bash
sudo apt update
sudo apt install -y \
  build-essential \
  cmake \
  ninja-build \
  git \
  pkg-config
```

GoogleTest must also be available to CMake. Depending on the distribution, install its development package, for example:

```bash
sudo apt install -y libgtest-dev
```

Verify the compiler and tools:

```bash
node --version
npm --version
g++ --version
cmake --version
ninja --version
```

## 4. Node.js Package Installation

Install backend dependencies:

### PowerShell

```powershell
Set-Location D:\QuantPulse-VP\backend
npm ci
```

### Bash/WSL

```bash
cd ~/project/QuantPulse-VP/backend
npm ci
```

Install frontend dependencies:

### PowerShell

```powershell
Set-Location D:\QuantPulse-VP\frontend
npm ci
```

### Bash/WSL

```bash
cd ~/project/QuantPulse-VP/frontend
npm ci
```

Do not commit `node_modules/` or generated `dist/` directories.

## 5. Environment Configuration

The repository root contains `.env.example` for backend configuration. Copy it to a local `.env` when needed:

```powershell
Copy-Item D:\QuantPulse-VP\.env.example D:\QuantPulse-VP\.env
```

Current variables:

| Variable | Current use |
| --- | --- |
| `NODE_ENV` | Backend runtime mode; normally `development` locally |
| `PORT` | Backend HTTP port; default `8000` |
| `MONGODB_URI` | Reserved; MongoDB is not currently connected |
| `REDIS_URL` | Reserved; Redis is not currently connected |
| `CPP_ENGINE_URL` | Reserved for future service communication |
| `JWT_SECRET` | Reserved; authentication is not currently implemented |
| `LOG_LEVEL` | Reserved logging configuration |
| `QUANTPULSE_ENGINE_PATH` | Optional backend override for the C++ CLI executable |

The current backend invokes the C++ CLI through a local process. For local development, the default executable path is:

```text
../cpp-engine/build-release/quantpulse_cli
```

That path is resolved relative to the backend process working directory. Start the backend from `backend/` unless `QUANTPULSE_ENGINE_PATH` is explicitly set.

## 6. Build the C++ Engine

### 6.1 Windows Visual Studio Generator

From PowerShell:

```powershell
Set-Location D:\QuantPulse-VP\cpp-engine

cmake -S . -B build-release
cmake --build build-release --config Debug --target ALL_BUILD
cmake --build build-release --config Release --target ALL_BUILD
```

The generated binaries are placed under:

```text
cpp-engine/build-release/Debug/
cpp-engine/build-release/Release/
```

Important executables:

- `quantpulse_demo.exe`
- `quantpulse_cli.exe`
- `quantpulse_tests.exe`
- `quantpulse_benchmarks.exe`

### 6.2 Linux/WSL Ninja Generator

```bash
cd ~/project/QuantPulse-VP/cpp-engine

cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=Debug
cmake --build build

cmake -S . -B build-release -G Ninja -DCMAKE_BUILD_TYPE=Release
cmake --build build-release
```

If CMake cannot find a compiler, install a C++ toolchain and verify `g++` or `clang++` is on `PATH`.

## 7. C++ Tests

Run CTest after configuring and building the selected configuration.

### Windows

```powershell
Set-Location D:\QuantPulse-VP\cpp-engine
ctest --test-dir build-release -C Debug --output-on-failure
ctest --test-dir build-release -C Release --output-on-failure
```

### Linux/WSL

```bash
cd ~/project/QuantPulse-VP/cpp-engine
ctest --test-dir build --output-on-failure
ctest --test-dir build-release --output-on-failure
```

Run the direct GoogleTest executable as an additional check.

### Windows

```powershell
.\build-release\Release\quantpulse_tests.exe --gtest_color=no
```

### Linux/WSL

```bash
./build-release/quantpulse_tests --gtest_color=no
```

Focused MarketBar tests:

```text
CsvMarketDataReaderTest.*
MarketDataAnalyticsTest.*
MarketAnalyticsJsonTest.*
```

The C++ suite validates domain calculations, OHLCV ingestion, JSON serialization, and integration behavior. Do not treat a successful compile as a substitute for running CTest.

## 8. C++ CLI Smoke Test

The CLI accepts a canonical MarketBar v1 CSV file:

```text
 timestamp,symbol,open,high,low,close,volume
```

### Windows

```powershell
Set-Location D:\QuantPulse-VP\cpp-engine
.\build-release\Release\quantpulse_cli.exe analyze '..\data\samples\reliance-market-bar-v1.csv'
```

### Linux/WSL

```bash
cd ~/project/QuantPulse-VP/cpp-engine
./build-release/quantpulse_cli analyze ../data/samples/reliance-market-bar-v1.csv
```

Expected output contains:

- `symbol`
- aggregate metrics
- `series[]`
- `timestamp`
- `open`
- `high`
- `low`
- `close`
- `volume`

The sample data is a development fixture. It must not be described as real NSE market data.

## 9. Backend Development

Build and typecheck:

```powershell
Set-Location D:\QuantPulse-VP\backend
npm run typecheck
npm run build
```

Start the backend in development mode:

```powershell
npm run dev
```

The API listens on `http://localhost:8000` by default.

Health check:

```powershell
Invoke-RestMethod http://localhost:8000/health
```

Market module check:

```powershell
Invoke-RestMethod http://localhost:8000/api/market
```

Current local analysis endpoint:

```powershell
$file = '..\data\samples\reliance-market-bar-v1.csv'
$url = 'http://localhost:8000/api/market/analyze?file=' + [uri]::EscapeDataString($file)
Invoke-RestMethod $url
```

The `file` query parameter is for local development only. It accepts a filesystem path and is not suitable for a public production API. The intended future boundary is a controlled dataset ID resolved server-side.

Stop the development backend with `Ctrl+C`.

## 10. Frontend Development

Build and typecheck:

```powershell
Set-Location D:\QuantPulse-VP\frontend
npm run typecheck
npm run build
```

Start the Vite development server:

```powershell
npm run dev
```

Open:

```text
http://localhost:5173/
```

The frontend expects the backend at `http://localhost:8000`. Start the backend first, then the frontend.

Expected local screen behavior:

- RELIANCE sample data loads.
- KPI values are populated.
- OHLC candlesticks render.
- Volume histogram renders.
- Chart resizes with the viewport.
- Microstructure values remain `—` because the sample contains OHLCV only.
- No order-book, OFI, spread, or microprice values are fabricated.

Stop the Vite server with `Ctrl+C`.

## 11. Recommended Full Local Run

Use three terminals.

### Terminal 1: C++ build and smoke test

```powershell
Set-Location D:\QuantPulse-VP\cpp-engine
cmake --build build-release --config Release --target ALL_BUILD
ctest --test-dir build-release -C Release --output-on-failure
.\build-release\Release\quantpulse_cli.exe analyze '..\data\samples\reliance-market-bar-v1.csv'
```

### Terminal 2: Backend

```powershell
Set-Location D:\QuantPulse-VP\backend
npm run dev
```

### Terminal 3: Frontend

```powershell
Set-Location D:\QuantPulse-VP\frontend
npm run dev
```

Then open `http://localhost:5173/`.

## 12. Benchmarks

Build the benchmark target:

### Windows

```powershell
cmake --build D:\QuantPulse-VP\cpp-engine\build-release --config Release --target quantpulse_benchmarks
```

Run all benchmarks:

```powershell
Set-Location D:\QuantPulse-VP\cpp-engine
.\build-release\Release\quantpulse_benchmarks.exe
```

Run a filtered benchmark:

```powershell
.\build-release\Release\quantpulse_benchmarks.exe --benchmark_filter=Statistics
```

Do not claim an optimization without recording the workload, build configuration, machine, compiler, and before/after benchmark results. See [benchmarking.md](benchmarking.md).

## 13. Package Inventory

### Backend runtime packages

Declared in `backend/package.json`:

- `express`: HTTP API framework
- `cors`: Cross-origin request middleware
- `dotenv`: Environment loading

### Backend development packages

- `typescript`: TypeScript compiler
- `tsx`: TypeScript development runner/watch mode
- `@types/node`: Node.js types
- `@types/express`: Express types
- `@types/cors`: CORS types

### Frontend runtime packages

Declared in `frontend/package.json`:

- `react`, `react-dom`: UI runtime
- `lightweight-charts`: financial chart rendering
- `recharts`: analytical charts for future non-market visualizations
- `@base-ui/react`: UI primitives
- `lucide-react`: icons
- `@fontsource-variable/geist`: bundled font
- `class-variance-authority`: component variants
- `cn`: class-name utility
- `tw-animate-css`: Tailwind animation utilities

### Frontend build and UI packages

- `vite`: frontend dev server and bundler
- `@vitejs/plugin-react`: React integration for Vite
- `typescript`: type checking and build
- `tailwindcss`: utility CSS
- `@tailwindcss/vite`: Tailwind Vite plugin
- `shadcn`: component tooling
- `@types/node`, `@types/react`, `@types/react-dom`: TypeScript types

### C++ dependencies

- C++20 standard library
- CMake 3.20+
- C++20 compiler
- GoogleTest, discovered with `find_package(GTest REQUIRED)`
- Google Benchmark 1.9.4, fetched by CMake `FetchContent`

## 14. Common Problems

### CMake cannot find a compiler

Install Visual Studio C++ tools on Windows or `build-essential` on Linux/WSL. Confirm the compiler is available in the same shell used to invoke CMake.

### CMake cannot find GoogleTest

Install the GoogleTest development package or configure the environment with the package manager used by the machine. Re-run CMake after the dependency is available.

### Google Benchmark download fails

The first configure requires network access to fetch the pinned Google Benchmark source. Retry with network access or pre-populate the CMake dependency cache.

### CTest reports no tests

Regenerate the build directory, rebuild the test target, and include the correct configuration on Visual Studio generators:

```powershell
cmake -S D:\QuantPulse-VP\cpp-engine -B D:\QuantPulse-VP\cpp-engine\build-release
cmake --build D:\QuantPulse-VP\cpp-engine\build-release --config Release --target quantpulse_tests
ctest --test-dir D:\QuantPulse-VP\cpp-engine\build-release -C Release --output-on-failure
```

### MSVC reports a PDB `C1041` error

Stop stale `cl.exe` or MSBuild processes, then rebuild. The project includes `/FS` for the core and test targets to reduce parallel PDB collisions.

### Backend cannot start the C++ engine

Confirm:

1. The C++ CLI exists in `cpp-engine/build-release/Release/` on Windows or `cpp-engine/build-release/` on Linux.
2. The backend is started from `backend/` when using the default relative path.
3. `QUANTPULSE_ENGINE_PATH` points to the correct executable if using a custom build directory.
4. The sample CSV path is valid from the backend working directory.

### Frontend shows a fetch error

Confirm the backend is running on port `8000`, then open `/health`. Check browser developer tools for the failed request and confirm the frontend API base URL matches the backend.

## 15. Production Readiness Boundaries

This repository is not production-ready as a deployed trading platform. Before public deployment, address at minimum:

- Replace arbitrary filesystem paths with controlled dataset IDs.
- Add request validation and consistent error responses.
- Add backend and frontend automated tests.
- Add structured logging and request IDs.
- Add persistence only when a concrete workflow requires it.
- Add authentication and authorization before user-specific workflows.
- Add deployment configuration and secrets management.
- Add integration and end-to-end tests.
- Validate real market-data licensing and provenance.

Never represent the included synthetic sample as real market data, and never calculate order-book metrics from OHLCV-only input.

## 16. Useful References

- [README.md](../README.md)
- [Project state](PROJECT_STATE.md)
- [Architecture](architecture.md)
- [API design](api.md)
- [Data model](data-model.md)
- [Benchmarking](benchmarking.md)
- [Deployment](deployment.md)
- [Market data schema notes](../data/schemas/README.md)
