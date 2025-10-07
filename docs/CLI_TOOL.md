# Argo CLI Tool

**Version:** 2.0
**Last Updated:** 2025-10-07

## Overview

The **Argo CLI** is a command-line tool for running Monte Carlo simulations on Linux, macOS, and Windows without requiring Excel. It enables:
- Headless simulation execution
- Batch processing
- CI/CD integration
- Server-side analytics
- Development and testing on Linux

---

## 1. Design Goals

### 1.1 Cross-Platform
- Run on Linux, macOS, Windows
- No Excel dependency
- Pure Node.js/TypeScript implementation

### 1.2 Code Reuse
- Share simulation engine with Office.js Add-in
- Same distributions, same statistics
- Consistent results across platforms

### 1.3 Automation-Friendly
- Scriptable workflows
- JSON input/output
- Exit codes for CI/CD

---

## 2. Architecture

### 2.1 Component Reuse

```
┌─────────────────────────────────────────────────┐
│            Argo Core Library                    │
│  ┌─────────────┐  ┌────────────┐  ┌─────────┐  │
│  │ Simulation  │  │Distribution│  │  Stats  │  │
│  │  Engine     │  │  Library   │  │  Funcs  │  │
│  └─────────────┘  └────────────┘  └─────────┘  │
└────────────┬────────────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    v                 v
┌───────────┐   ┌──────────────┐
│ Office.js │   │   CLI Tool   │
│  Add-in   │   │  (Node.js)   │
└───────────┘   └──────────────┘
 (Excel)         (Terminal)
```

### 2.2 Package Structure

```
argo/
├── packages/
│   ├── argo-core/              # Shared core library
│   │   ├── src/
│   │   │   ├── engine/
│   │   │   ├── distributions/
│   │   │   ├── stats/
│   │   │   └── utils/
│   │   └── package.json
│   │
│   ├── argo-excel/             # Office.js Add-in
│   │   ├── src/
│   │   │   ├── taskpane/
│   │   │   ├── functions/
│   │   │   └── commands/
│   │   └── package.json
│   │
│   └── argo-cli/               # CLI tool
│       ├── src/
│       │   ├── cli.ts          # Main CLI entry point
│       │   ├── commands/       # CLI commands
│       │   ├── formats/        # Input/output formats
│       │   └── utils/
│       └── package.json
│
└── package.json                # Monorepo root
```

---

## 3. CLI Commands

### 3.1 Command Structure

```bash
argo <command> [options]
```

### 3.2 Core Commands

#### `argo simulate`
Run Monte Carlo simulation

```bash
argo simulate \
  --config simulation.json \
  --iterations 10000 \
  --output results.json
```

#### `argo distributions`
List available probability distributions

```bash
argo distributions              # List all
argo distributions --name normal  # Show details
```

#### `argo stats`
Calculate statistics on data

```bash
argo stats --input data.csv --output stats.json
```

#### `argo validate`
Validate simulation configuration

```bash
argo validate --config simulation.json
```

#### `argo generate`
Generate sample configuration

```bash
argo generate --template basic > simulation.json
```

#### `argo version`
Show version information

```bash
argo version
```

---

## 4. Configuration Format

### 4.1 Simulation Configuration (JSON)

```json
{
  "name": "Revenue Simulation",
  "description": "Simulates monthly revenue based on demand and price",
  "iterations": 10000,
  "seed": 42,

  "inputs": {
    "demand": {
      "type": "normal",
      "parameters": {
        "mean": 1000,
        "stddev": 150
      }
    },
    "price": {
      "type": "triangular",
      "parameters": {
        "min": 10,
        "mode": 12,
        "max": 15
      }
    }
  },

  "correlation": {
    "matrix": [
      [1.0, 0.3],
      [0.3, 1.0]
    ],
    "variables": ["demand", "price"]
  },

  "outputs": {
    "revenue": {
      "formula": "demand * price",
      "description": "Monthly revenue"
    },
    "profit": {
      "formula": "revenue - (demand * 5)",
      "description": "Monthly profit (assuming $5 cost)"
    }
  },

  "analysis": {
    "percentiles": [5, 25, 50, 75, 95],
    "confidence_interval": 0.95,
    "var": 0.95
  }
}
```

### 4.2 YAML Configuration (Alternative)

```yaml
name: Revenue Simulation
description: Simulates monthly revenue based on demand and price
iterations: 10000
seed: 42

inputs:
  demand:
    type: normal
    parameters:
      mean: 1000
      stddev: 150

  price:
    type: triangular
    parameters:
      min: 10
      mode: 12
      max: 15

correlation:
  matrix:
    - [1.0, 0.3]
    - [0.3, 1.0]
  variables: [demand, price]

outputs:
  revenue:
    formula: demand * price
    description: Monthly revenue

  profit:
    formula: revenue - (demand * 5)
    description: Monthly profit

analysis:
  percentiles: [5, 25, 50, 75, 95]
  confidence_interval: 0.95
  var: 0.95
```

### 4.3 CSV Input (Simple)

```csv
variable,distribution,param1,param2,param3
demand,normal,1000,150,
price,triangular,10,12,15
cost,uniform,4,6,
```

---

## 5. Output Formats

### 5.1 JSON Output

```json
{
  "simulation": {
    "name": "Revenue Simulation",
    "iterations": 10000,
    "seed": 42,
    "duration_ms": 234
  },

  "inputs": {
    "demand": {
      "type": "normal",
      "parameters": { "mean": 1000, "stddev": 150 }
    },
    "price": {
      "type": "triangular",
      "parameters": { "min": 10, "mode": 12, "max": 15 }
    }
  },

  "results": {
    "revenue": {
      "mean": 12000,
      "stddev": 1850,
      "min": 6500,
      "max": 18500,
      "percentiles": {
        "5": 9200,
        "25": 10800,
        "50": 12000,
        "75": 13200,
        "95": 14800
      },
      "confidence_interval_95": [9300, 14700],
      "var_95": 9200
    },
    "profit": {
      "mean": 7000,
      "stddev": 1900,
      "percentiles": { ... },
      "confidence_interval_95": [4200, 9800],
      "var_95": 4100
    }
  },

  "samples": [
    { "demand": 1020, "price": 11.5, "revenue": 11730, "profit": 6630 },
    { "demand": 980, "price": 12.2, "revenue": 11956, "profit": 7056 },
    ...
  ]
}
```

### 5.2 CSV Output

```csv
output,mean,stddev,min,max,p5,p25,p50,p75,p95,var_95
revenue,12000,1850,6500,18500,9200,10800,12000,13200,14800,9200
profit,7000,1900,2000,13000,4200,6000,7000,8000,9800,4100
```

### 5.3 Markdown Report

```markdown
# Revenue Simulation Results

**Iterations:** 10,000
**Duration:** 234 ms
**Seed:** 42

## Summary Statistics

### Revenue
- Mean: $12,000
- Std Dev: $1,850
- 95% CI: [$9,300, $14,700]
- 95% VaR: $9,200

### Profit
- Mean: $7,000
- Std Dev: $1,900
- 95% CI: [$4,200, $9,800]
- 95% VaR: $4,100

## Percentiles

| Output  | 5%    | 25%    | 50%    | 75%    | 95%    |
|---------|-------|--------|--------|--------|--------|
| Revenue | 9,200 | 10,800 | 12,000 | 13,200 | 14,800 |
| Profit  | 4,200 | 6,000  | 7,000  | 8,000  | 9,800  |
```

---

## 6. Usage Examples

### 6.1 Basic Simulation

```bash
# Create configuration
cat > sim.json <<EOF
{
  "iterations": 10000,
  "inputs": {
    "x": { "type": "normal", "parameters": { "mean": 100, "stddev": 15 } }
  },
  "outputs": {
    "y": { "formula": "x * 2" }
  }
}
EOF

# Run simulation
argo simulate --config sim.json --output results.json

# View results
cat results.json | jq '.results.y.mean'
```

### 6.2 Batch Processing

```bash
# Simulate multiple scenarios
for scenario in low mid high; do
  argo simulate \
    --config scenarios/${scenario}.json \
    --output results/${scenario}.json
done

# Compare results
argo compare results/*.json --metric mean --output comparison.csv
```

### 6.3 CI/CD Integration

```yaml
# .github/workflows/simulation.yml
name: Run Simulation Tests

on: [push, pull_request]

jobs:
  simulate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install Argo CLI
        run: npm install -g @argo/cli

      - name: Run Simulations
        run: |
          argo simulate --config tests/scenarios/baseline.json --output baseline.json
          argo validate baseline.json --expected tests/expected/baseline.json

      - name: Generate Report
        run: argo report --input baseline.json --format markdown > report.md

      - name: Upload Results
        uses: actions/upload-artifact@v3
        with:
          name: simulation-results
          path: baseline.json
```

### 6.4 Data Pipeline

```bash
# Extract data from database
psql -c "COPY sales TO STDOUT CSV" > sales.csv

# Fit distributions to historical data
argo fit --input sales.csv --column revenue --output distributions.json

# Generate simulation config from fitted distributions
argo generate --from-fit distributions.json > simulation.json

# Run simulation
argo simulate --config simulation.json --output forecast.json

# Create visualizations
argo plot --input forecast.json --output charts/
```

---

## 7. Formula Engine

### 7.1 Supported Operators

```
Arithmetic: +, -, *, /, ^, %
Comparison: <, >, <=, >=, ==, !=
Logical: &&, ||, !
Functions: min(), max(), abs(), sqrt(), log(), exp(), if()
```

### 7.2 Formula Examples

```json
{
  "outputs": {
    "simple": { "formula": "a + b" },
    "complex": { "formula": "a * b + c / 2" },
    "conditional": { "formula": "if(x > 100, x * 0.9, x)" },
    "nested": { "formula": "max(a, min(b, c))" },
    "power": { "formula": "a^2 + b^2" }
  }
}
```

---

## 8. Advanced Features

### 8.1 Distribution Fitting

```bash
# Fit distribution to data
argo fit \
  --input historical_data.csv \
  --column sales \
  --distributions normal,lognormal,gamma \
  --output fitted.json

# Output: Best-fit distribution with parameters
```

### 8.2 Sensitivity Analysis

```bash
# Run tornado chart analysis
argo sensitivity \
  --config simulation.json \
  --output tornado \
  --output sensitivity.json
```

### 8.3 Optimization

```bash
# Find optimal input values
argo optimize \
  --config simulation.json \
  --objective "maximize profit" \
  --constraints "cost < 1000" \
  --output optimal.json
```

---

## 9. Development

### 9.1 Project Setup

```bash
# Clone repository
git clone https://github.com/boozallen/argo.git
cd argo

# Install dependencies (monorepo)
npm install

# Build all packages
npm run build

# Link CLI for development
cd packages/argo-cli
npm link

# Test CLI
argo --version
```

### 9.2 Adding New Commands

```typescript
// packages/argo-cli/src/commands/mycommand.ts
import { Command } from 'commander';
import { SimulationEngine } from '@argo/core';

export function registerMyCommand(program: Command): void {
  program
    .command('mycommand')
    .description('My new command')
    .option('-i, --input <file>', 'Input file')
    .option('-o, --output <file>', 'Output file')
    .action(async (options) => {
      // Command implementation
      console.log('Running mycommand with options:', options);
    });
}
```

### 9.3 Testing

```bash
# Run CLI tests
npm run test:cli

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

---

## 10. Installation & Distribution

### 10.1 npm Package

```bash
# Install globally
npm install -g @argo/cli

# Or use npx (no install)
npx @argo/cli simulate --config sim.json
```

### 10.2 Standalone Binaries

```bash
# Build standalone executables (using pkg or nexe)
npm run build:standalone

# Output:
# dist/argo-linux
# dist/argo-macos
# dist/argo-win.exe

# Install
sudo mv argo-linux /usr/local/bin/argo
```

### 10.3 Docker Image

```dockerfile
# Dockerfile
FROM node:18-alpine

RUN npm install -g @argo/cli

ENTRYPOINT ["argo"]
CMD ["--help"]
```

```bash
# Build image
docker build -t argo-cli .

# Run simulation
docker run -v $(pwd):/data argo-cli simulate --config /data/sim.json --output /data/results.json
```

---

## 11. Linux Development Workflow

### 11.1 Development on Linux

**Advantages:**
- Fast development cycle (no Excel needed)
- Automated testing in CI/CD
- Server-side analytics
- Scripting and automation

**Workflow:**
```bash
# 1. Develop core library on Linux
cd packages/argo-core
npm run test:watch

# 2. Test with CLI
cd ../argo-cli
argo simulate --config examples/basic.json

# 3. When ready, test in Excel (Windows VM or separate machine)
cd ../argo-excel
npm run dev
# Open Excel, sideload add-in, test
```

### 11.2 Cross-Platform Testing

```bash
# Test on Linux
npm test

# Test on Windows (via Wine or WSL)
wine argo-win.exe simulate --config sim.json

# Test on macOS (via CI)
# (Run in GitHub Actions on macOS runner)
```

---

## 12. Roadmap

### Phase 1: MVP (Q2 2025)
- [x] Design CLI architecture
- [ ] Implement core commands (simulate, validate, generate)
- [ ] JSON/CSV input/output formats
- [ ] Basic formula engine
- [ ] npm package release

### Phase 2: Advanced Features (Q3 2025)
- [ ] Distribution fitting
- [ ] Sensitivity analysis
- [ ] Optimization
- [ ] Markdown/HTML reports
- [ ] Plotting (charts)

### Phase 3: Integration (Q4 2025)
- [ ] Excel file import (.xlsx)
- [ ] Excel file export
- [ ] Database connectors
- [ ] REST API server mode
- [ ] Docker image

---

## 13. Comparison: CLI vs Excel Add-in

| Feature | CLI | Excel Add-in |
|---------|-----|--------------|
| **Platform** | Linux/Mac/Windows | Windows/Mac (Office 365) |
| **Excel Required** | ❌ No | ✅ Yes |
| **UI** | Terminal | Rich (Task Pane) |
| **Automation** | ✅ Excellent | ⚠️ Limited |
| **Batch Processing** | ✅ Yes | ❌ No |
| **CI/CD** | ✅ Yes | ❌ No |
| **Interactive Viz** | ❌ No | ✅ Yes |
| **Learning Curve** | Medium | Low |
| **Use Case** | Automation, Dev, Servers | End-user analysis |

---

## 14. References

- **Commander.js:** https://github.com/tj/commander.js (CLI framework)
- **Chalk:** https://github.com/chalk/chalk (Terminal colors)
- **Inquirer.js:** https://github.com/SBoudrias/Inquirer.js (Interactive prompts)
- **pkg:** https://github.com/vercel/pkg (Standalone binaries)
- **Ajv:** https://ajv.js.org/ (JSON schema validation)

---

## 15. Summary

The Argo CLI enables:
1. ✅ **Linux Development:** Develop and test Argo core on Linux
2. ✅ **Automation:** Script simulations in CI/CD pipelines
3. ✅ **Server-Side Analytics:** Run simulations on servers
4. ✅ **Cross-Platform:** Works on Linux, macOS, Windows
5. ✅ **Code Reuse:** Shares core library with Excel Add-in

**Next Steps:**
- Implement CLI MVP commands
- Create sample configurations and examples
- Write CLI documentation
- Publish to npm
