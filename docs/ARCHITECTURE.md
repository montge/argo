# Argo for Office 365 Excel - Architecture Document

**Version:** 5.0
**Last Updated:** 2025-10-07

## Overview

This document describes the technical architecture for Argo v5.0, a complete rewrite targeting Office 365 Excel using modern web technologies. This is a **modern rebuild using Claude Code (AI)** - the original Argo (v1.0 through v4.3.1) was built for Excel 2007-2016 using .NET technologies that are not suitable for modern Office 365, and this rebuild is based on available documentation from the original Argo project.

---

## 1. High-Level Architecture

### 1.0 Key Advantage: Web-Based Architecture

**Argo v5.0 uses modern Office.js Add-ins, which are fundamentally different from traditional compiled plugins:**

✅ **Web Application** (not compiled executable)
- HTML/CSS/JavaScript hosted on a web server
- Excel loads it like embedding a website
- No .dll, .xll, or native code compilation

✅ **No Code Signing Required** (for development/testing)
- Optional manifest signing for AppSource
- No expensive certificates needed ($0 vs $300-500/year)

✅ **Cross-Platform by Default**
- Same code runs on Windows, Mac, and Web
- Develop on Linux, deploy everywhere

✅ **Easy Updates**
- Change files on server → users get updates automatically
- No reinstallation required

✅ **Simple Deployment**
- Just an XML manifest pointing to your web URL
- No installer packages (.msi)
- No admin rights required (for sideloading)

**See [DEPLOYMENT.md](DEPLOYMENT.md) for complete details on web-based deployment.**

---

### 1.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Excel Application                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Office.js Runtime                       │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────────┘
                        │ Office.js API
┌───────────────────────┴─────────────────────────────────────┐
│                   Argo Add-in (Web App)                      │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           Presentation Layer (React)                │    │
│  │  ┌─────────────┐ ┌──────────────┐ ┌─────────────┐  │    │
│  │  │  Task Pane  │ │ Ribbon Cmds  │ │  Dialogs    │  │    │
│  │  └─────────────┘ └──────────────┘ └─────────────┘  │    │
│  └──────────────────────┬──────────────────────────────┘    │
│                         │                                     │
│  ┌──────────────────────┴──────────────────────────────┐    │
│  │         Business Logic Layer (TypeScript)           │    │
│  │  ┌────────────┐ ┌──────────┐ ┌─────────────────┐   │    │
│  │  │ Simulation │ │ Analysis │ │ Distribution    │   │    │
│  │  │ Engine     │ │ Services │ │ Services        │   │    │
│  │  └────────────┘ └──────────┘ └─────────────────┘   │    │
│  └──────────────────────┬──────────────────────────────┘    │
│                         │                                     │
│  ┌──────────────────────┴──────────────────────────────┐    │
│  │          Data Layer (Office.js API)                 │    │
│  │  ┌────────────┐ ┌──────────┐ ┌─────────────────┐   │    │
│  │  │ Workbook   │ │ Range    │ │ Custom          │   │    │
│  │  │ Manager    │ │ Manager  │ │ Functions       │   │    │
│  │  └────────────┘ └──────────┘ └─────────────────┘   │    │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │       Computation Layer (Web Workers)              │     │
│  │  ┌────────────┐ ┌──────────┐ ┌─────────────────┐  │     │
│  │  │ Monte Carlo│ │ Stats    │ │ Matrix          │  │     │
│  │  │ Worker     │ │ Worker   │ │ Operations      │  │     │
│  │  └────────────┘ └──────────┘ └─────────────────┘  │     │
│  └────────────────────────────────────────────────────┘     │
└───────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Office.js | Microsoft's JavaScript API for Office integration |
| **Frontend Framework** | React 18+ | UI component library |
| **Language** | TypeScript 5.x | Type-safe JavaScript |
| **UI Components** | Fluent UI React | Microsoft's design system |
| **State Management** | Zustand / React Context | Application state |
| **Charting** | Recharts | Data visualization |
| **Statistical Computing** | Custom + math.js | Probability distributions & statistics |
| **Build Tool** | Vite | Fast build and dev server |
| **Testing** | Jest + Playwright | Unit and E2E testing |
| **Package Manager** | npm | Dependency management |

---

## 2. Module Architecture

### 2.1 Directory Structure

```
argo/
├── manifest.xml                 # Office Add-in manifest
├── package.json                 # npm dependencies
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite build configuration
├── .env.development            # Development environment variables
├── .env.production             # Production environment variables
│
├── src/                        # Source code
│   ├── index.tsx               # Entry point
│   ├── taskpane/               # Task pane UI
│   │   ├── TaskPane.tsx        # Main task pane component
│   │   ├── components/         # UI components
│   │   │   ├── SimulationControls.tsx
│   │   │   ├── OutputDashboard.tsx
│   │   │   ├── DistributionSelector.tsx
│   │   │   └── SettingsPanel.tsx
│   │   └── styles/             # Component styles
│   │
│   ├── commands/               # Ribbon command handlers
│   │   ├── runSimulation.ts
│   │   ├── openDistributionBuilder.ts
│   │   ├── openResultsAnalyzer.ts
│   │   └── showSettings.ts
│   │
│   ├── functions/              # Excel custom functions
│   │   ├── functions.ts        # Custom function definitions
│   │   ├── functions.json      # Function metadata
│   │   └── distribution-functions/
│   │       ├── normal.ts
│   │       ├── uniform.ts
│   │       ├── triangular.ts
│   │       └── ... (35+ distributions)
│   │
│   ├── engine/                 # Simulation engine
│   │   ├── SimulationEngine.ts # Main simulation orchestrator
│   │   ├── MonteCarloEngine.ts # Monte Carlo algorithm
│   │   ├── DependencyGraph.ts  # Excel dependency tracking
│   │   └── CorrelationEngine.ts # Rank correlation
│   │
│   ├── distributions/          # Probability distributions
│   │   ├── Distribution.ts     # Base distribution interface
│   │   ├── continuous/
│   │   │   ├── NormalDistribution.ts
│   │   │   ├── LogNormalDistribution.ts
│   │   │   ├── UniformDistribution.ts
│   │   │   ├── TriangularDistribution.ts
│   │   │   └── ... (20+ continuous)
│   │   ├── discrete/
│   │   │   ├── BinomialDistribution.ts
│   │   │   ├── PoissonDistribution.ts
│   │   │   └── ... (10+ discrete)
│   │   └── DistributionFactory.ts
│   │
│   ├── stats/                  # Statistical functions
│   │   ├── descriptive.ts      # Mean, median, std dev, etc.
│   │   ├── distributions.ts    # PDF, CDF, inverse CDF
│   │   ├── confidence.ts       # Confidence intervals
│   │   ├── sensitivity.ts      # Tornado charts, correlation
│   │   └── risk.ts             # VaR, CVaR
│   │
│   ├── utils/                  # Utility functions
│   │   ├── excelUtils.ts       # Excel API helpers
│   │   ├── mathUtils.ts        # Math helpers
│   │   ├── validators.ts       # Input validation
│   │   └── formatters.ts       # Data formatting
│   │
│   └── workers/                # Web Workers
│       ├── simulation.worker.ts
│       └── statistics.worker.ts
│
├── assets/                     # Static assets
│   ├── icons/                  # Ribbon icons
│   │   ├── run-simulation-16.png
│   │   ├── run-simulation-32.png
│   │   └── ...
│   └── images/                 # Images
│
├── tests/                      # Test suites
│   ├── unit/                   # Unit tests
│   │   ├── distributions/
│   │   ├── engine/
│   │   └── stats/
│   ├── integration/            # Integration tests
│   └── e2e/                    # End-to-end tests
│
└── docs/                       # Documentation
    ├── REQUIREMENTS.md
    ├── ARCHITECTURE.md
    ├── DEVELOPMENT.md
    ├── COLLABORATION.md
    └── API.md
```

### 2.2 Module Descriptions

#### **Presentation Layer (`src/taskpane/`, `src/commands/`)**
- **Purpose:** User interface components and ribbon command handlers
- **Technology:** React, Fluent UI
- **Responsibilities:**
  - Render task pane UI
  - Handle user interactions
  - Display simulation results
  - Execute ribbon commands

#### **Business Logic Layer (`src/engine/`, `src/distributions/`, `src/stats/`)**
- **Purpose:** Core simulation and statistical logic
- **Technology:** TypeScript classes and services
- **Responsibilities:**
  - Execute Monte Carlo simulations
  - Generate random samples from distributions
  - Calculate statistical measures
  - Manage correlation structures

#### **Data Layer (`src/utils/excelUtils.ts`)**
- **Purpose:** Interface with Excel workbook
- **Technology:** Office.js API wrappers
- **Responsibilities:**
  - Read cell values and ranges
  - Write simulation results
  - Track formula dependencies
  - Register custom functions

#### **Computation Layer (`src/workers/`)**
- **Purpose:** Heavy computational tasks
- **Technology:** Web Workers
- **Responsibilities:**
  - Parallel simulation execution
  - Statistical calculations
  - Matrix operations (correlation)

---

## 3. Key Components

### 3.1 Simulation Engine

```typescript
// src/engine/SimulationEngine.ts
export class SimulationEngine {
  private monteCarloEngine: MonteCarloEngine;
  private dependencyGraph: DependencyGraph;
  private correlationEngine: CorrelationEngine;

  async runSimulation(config: SimulationConfig): Promise<SimulationResult> {
    // 1. Parse input cells with distributions
    // 2. Build dependency graph
    // 3. Apply correlation structure
    // 4. Execute iterations (via Web Worker)
    // 5. Collect output statistics
    // 6. Return results
  }
}
```

**Key Features:**
- Identifies uncertain input cells (cells with distribution functions)
- Builds dependency graph using Excel's calculation chain
- Supports correlated inputs via Cholesky decomposition
- Executes in Web Worker for non-blocking performance
- Progress callbacks for UI updates

### 3.2 Distribution System

```typescript
// src/distributions/Distribution.ts
export interface Distribution {
  name: string;
  parameters: Record<string, number>;

  // Generate random sample
  sample(rng: RandomNumberGenerator): number;

  // Probability density function
  pdf(x: number): number;

  // Cumulative distribution function
  cdf(x: number): number;

  // Inverse CDF (quantile function)
  inverseCDF(p: number): number;

  // Validate parameters
  validateParameters(): boolean;
}
```

**Supported Distributions:**
- Continuous: Normal, Log-Normal, Uniform, Triangular, Beta, Gamma, Exponential, Weibull, etc.
- Discrete: Binomial, Poisson, Geometric, Hypergeometric, etc.
- Special: Empirical, Historical, PERT

### 3.3 Custom Functions

```typescript
// src/functions/distribution-functions/normal.ts
/**
 * Generates a random sample from a Normal distribution
 * @customfunction
 * @param mean The mean of the distribution
 * @param stddev The standard deviation
 * @returns A random sample
 */
export function ARGO_NORMAL(mean: number, stddev: number): number {
  const dist = new NormalDistribution(mean, stddev);
  return dist.sample(globalRNG);
}
```

**Custom Function Categories:**
1. **Distribution Functions:** `ARGO.NORMAL()`, `ARGO.TRIANGULAR()`, etc.
2. **Statistical Analysis:** `ARGO.MEAN()`, `ARGO.PERCENTILE()`, etc.
3. **Risk Metrics:** `ARGO.VAR()`, `ARGO.CVAR()`

### 3.4 Task Pane UI

```typescript
// src/taskpane/TaskPane.tsx
export const TaskPane: React.FC = () => {
  const [simulationStatus, setSimulationStatus] = useState<Status>('idle');
  const [results, setResults] = useState<SimulationResult | null>(null);

  const handleRunSimulation = async () => {
    setSimulationStatus('running');
    const result = await simulationEngine.runSimulation(config);
    setResults(result);
    setSimulationStatus('completed');
  };

  return (
    <Stack>
      <SimulationControls onRun={handleRunSimulation} status={simulationStatus} />
      {results && <OutputDashboard results={results} />}
    </Stack>
  );
};
```

---

## 4. Data Flow

### 4.1 Simulation Execution Flow

```
User Action (Click "Run Simulation")
  │
  ├──> Task Pane Component
  │       │
  │       ├──> SimulationEngine.runSimulation()
  │       │       │
  │       │       ├──> Parse Input Cells (identify distributions)
  │       │       │       └──> Read cell formulas via Office.js
  │       │       │
  │       │       ├──> Build Dependency Graph
  │       │       │       └──> Traverse Excel's calculation chain
  │       │       │
  │       │       ├──> Initialize Web Worker
  │       │       │       │
  │       │       │       ├──> MonteCarloEngine.execute()
  │       │       │       │       │
  │       │       │       │       └──> For each iteration:
  │       │       │       │           ├──> Sample input distributions
  │       │       │       │           ├──> Apply correlation
  │       │       │       │           ├──> Recalculate formulas
  │       │       │       │           └──> Collect output values
  │       │       │       │
  │       │       │       └──> Return iteration results
  │       │       │
  │       │       └──> Aggregate Statistics
  │       │               ├──> Calculate mean, std dev, percentiles
  │       │               ├──> Generate histograms
  │       │               └──> Perform sensitivity analysis
  │       │
  │       └──> Update Task Pane UI with Results
  │               └──> Render charts and tables
  │
  └──> Write Results to Excel (optional)
          └──> Create output tables/charts
```

### 4.2 Custom Function Evaluation Flow

```
User enters formula: =ARGO.NORMAL(100, 15)
  │
  ├──> Office.js Custom Functions Runtime
  │       │
  │       ├──> Call ARGO_NORMAL(100, 15)
  │       │       │
  │       │       ├──> NormalDistribution.sample()
  │       │       │       └──> Generate random value using RNG
  │       │       │
  │       │       └──> Return value to Excel
  │       │
  │       └──> Excel displays value in cell
  │
  └──> On Simulation Run:
          ├──> Replace static values with sampled values
          └──> Excel recalculates dependent formulas
```

---

## 5. Concurrency & Performance

### 5.1 Web Workers

**Purpose:** Offload heavy computation to background threads

**Implementation:**
```typescript
// src/workers/simulation.worker.ts
self.onmessage = async (e: MessageEvent<SimulationRequest>) => {
  const { config, iterations } = e.data;

  for (let i = 0; i < iterations; i++) {
    // Sample distributions
    const inputSamples = sampleInputs(config.distributions);

    // Recalculate model
    const outputValues = evaluateModel(config.model, inputSamples);

    // Send progress update
    if (i % 1000 === 0) {
      self.postMessage({ type: 'progress', iteration: i });
    }
  }

  // Send final results
  self.postMessage({ type: 'complete', results });
};
```

### 5.2 Batching Strategy

- **Small Models (<100 uncertain inputs):** Single-threaded, 10k iterations
- **Large Models (100+ uncertain inputs):** Multi-threaded, split iterations across workers
- **Real-Time Updates:** Batch progress updates every 1000 iterations

### 5.3 Memory Management

- Stream results to avoid storing all iterations in memory
- Use TypedArrays for numerical data
- Garbage collect between simulation runs

---

## 6. Multi-User Development Design

### 6.1 Module Independence

Each core module is isolated with clear interfaces:

| Module | Depends On | Interface |
|--------|-----------|-----------|
| Distributions | None | `Distribution` interface |
| Stats | Distributions (optional) | Pure functions |
| Engine | Distributions, Stats | `SimulationEngine` class |
| UI Components | Engine | React props/events |

### 6.2 Development Workflow

```
Developer A: Working on Distributions
  ├── Feature branch: feature/beta-distribution
  ├── Files: src/distributions/continuous/BetaDistribution.ts
  └── Tests: tests/unit/distributions/beta.test.ts

Developer B: Working on UI
  ├── Feature branch: feature/output-dashboard
  ├── Files: src/taskpane/components/OutputDashboard.tsx
  └── Tests: tests/integration/taskpane/dashboard.test.tsx

Developer C: Working on Engine
  ├── Feature branch: feature/correlation-matrix
  ├── Files: src/engine/CorrelationEngine.ts
  └── Tests: tests/unit/engine/correlation.test.ts
```

### 6.3 Shared Resources

**Common Interfaces:** All developers implement shared TypeScript interfaces
```typescript
// src/types/simulation.types.ts
export interface SimulationConfig { ... }
export interface SimulationResult { ... }
export interface Distribution { ... }
```

**Mock Office.js API:** For local development without Excel
```typescript
// tests/mocks/office.mock.ts
export const mockExcel = { ... };
```

### 6.4 Claude Code Collaboration

**Guidelines for multiple Claude Code instances:**
1. Each instance works on a separate feature branch
2. Clear module boundaries prevent merge conflicts
3. Shared type definitions in `src/types/`
4. Automated tests ensure interface compatibility
5. PR-based workflow with CI/CD checks

---

## 7. Security & Privacy

### 7.1 Data Privacy

- **No Server Calls:** All computation happens client-side
- **No Telemetry by Default:** Optional opt-in analytics
- **No Data Persistence:** Simulation results stay in Excel workbook

### 7.2 Code Signing

- Add-in manifest signed with trusted certificate
- Package verified during installation
- Distributed via Microsoft AppSource (or sideloading)

---

## 8. Deployment Architecture

### 8.1 Development Environment

```
Developer Machine
  ├── npm run dev (Vite dev server on localhost:3000)
  ├── Excel Desktop with sideloaded add-in
  └── manifest.xml points to https://localhost:3000
```

### 8.2 Production Environment

```
CDN (e.g., GitHub Pages, Azure CDN)
  ├── Static files (HTML, JS, CSS)
  ├── manifest.xml points to https://cdn.example.com
  └── Users install add-in via AppSource or sideloading
```

### 8.3 Continuous Integration

```
GitHub Actions Workflow:
  1. Run linters (ESLint, Prettier)
  2. Run TypeScript compiler
  3. Run unit tests (Jest)
  4. Run integration tests (Playwright)
  5. Build production bundle (Vite)
  6. Deploy to CDN (if main branch)
```

---

## 9. Extensibility

### 9.1 Custom Distribution Plugin

Developers can add new distributions:

```typescript
// custom-distributions/MyDistribution.ts
import { Distribution } from 'argo';

export class MyDistribution implements Distribution {
  name = 'My Custom Distribution';

  constructor(public params: { a: number; b: number }) {}

  sample(rng: RandomNumberGenerator): number {
    // Custom sampling logic
  }

  pdf(x: number): number { ... }
  cdf(x: number): number { ... }
  inverseCDF(p: number): number { ... }
  validateParameters(): boolean { ... }
}

// Register with factory
DistributionFactory.register('custom', MyDistribution);
```

### 9.2 API for External Tools

```typescript
// Expose API for programmatic access
export const ArgoAPI = {
  runSimulation,
  getResults,
  registerDistribution,
  exportResults
};
```

---

## 10. Testing Strategy

### 10.1 Unit Tests

- Test each distribution (compare against reference implementations)
- Test statistical functions (validate formulas)
- Test engine components in isolation

### 10.2 Integration Tests

- Test simulation end-to-end with mock Excel API
- Test UI components with mock data
- Test Web Worker communication

### 10.3 E2E Tests

- Test in real Excel Desktop (Playwright)
- Test common user workflows
- Test performance benchmarks

---

## 11. Future Enhancements

- **Excel Online Support:** Full feature parity with desktop
- **Excel Mobile:** Optimized UI for touch devices
- **Optimization Integration:** Link with Excel Solver for robust optimization
- **Machine Learning:** Distribution fitting from historical data
- **Collaboration:** Multi-user simultaneous simulation

---

## 12. References

- Office Add-ins Platform: https://learn.microsoft.com/office/dev/add-ins/
- Office.js API: https://learn.microsoft.com/javascript/api/office
- Excel Custom Functions: https://learn.microsoft.com/office/dev/add-ins/excel/custom-functions-overview
- Web Workers: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API
