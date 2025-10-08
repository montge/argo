# @argo/core

Core Monte Carlo simulation engine and probability distributions for Argo.

## Status

🚀 **Alpha v5.0.0-alpha.1** - Sprint 2 Complete! 10 distributions with 97%+ coverage

**Sprint 1 & 2 Complete (10 Continuous Distributions):**
- ✅ Normal Distribution (100% coverage)
- ✅ Uniform Distribution (100% coverage)
- ✅ Triangular Distribution (100% coverage)
- ✅ Log-Normal Distribution (100% coverage)
- ✅ Exponential Distribution (100% coverage)
- ✅ Beta Distribution (93% coverage)
- ✅ Gamma Distribution (96% coverage)
- ✅ Weibull Distribution (95% coverage)
- ✅ Pareto Distribution (100% coverage)
- ✅ PERT Distribution (100% coverage)

**Test Coverage:** 97.28% statements, 90.67% branches (504 tests)

**Coming Next (Sprint 3 - Discrete Distributions):**
- ⏳ Binomial Distribution
- ⏳ Poisson Distribution
- ⏳ Geometric Distribution
- ⏳ Hypergeometric Distribution

## Installation

```bash
npm install @argo/core
```

## Usage

### Basic Example - Normal Distribution

```typescript
import { NormalDistribution, SimpleRNG } from '@argo/core';

// Create a random number generator with seed (for reproducibility)
const rng = new SimpleRNG(42);

// Create a Normal distribution: mean=100, stddev=15
const dist = new NormalDistribution(100, 15);

// Generate samples
const sample = dist.sample(rng);
console.log(sample); // ~100

// Calculate probability density
const density = dist.pdf(100); // Maximum density at mean

// Calculate cumulative probability
const prob = dist.cdf(115); // P(X ≤ 115) ≈ 0.8413

// Calculate quantiles (inverse CDF)
const p95 = dist.inverseCDF(0.95); // 95th percentile ≈ 124.67
```

### More Distribution Examples

```typescript
import {
  TriangularDistribution,
  BetaDistribution,
  PERTDistribution,
  ParetoDistribution,
  SimpleRNG
} from '@argo/core';

const rng = new SimpleRNG(42);

// Triangular: common in project planning (min, mode, max)
const triangular = new TriangularDistribution(5, 8, 15);
console.log(`Task duration: ${triangular.sample(rng)} days`);

// PERT: smooth alternative to Triangular for project management
const pert = new PERTDistribution(5, 8, 15);
console.log(`PERT estimate: ${pert.sample(rng)} days`);

// Beta: flexible bounded distribution (0 to 1)
const beta = new BetaDistribution(2, 5);
console.log(`Success rate: ${(beta.sample(rng) * 100).toFixed(1)}%`);

// Pareto: 80/20 rule, wealth distribution
const pareto = new ParetoDistribution(1, 1.16); // 80/20 rule
console.log(`Income level: $${pareto.sample(rng).toFixed(0)}`);
```

### Monte Carlo Simulation

```typescript
import { NormalDistribution, SimpleRNG } from '@argo/core';

const rng = new SimpleRNG(42);
const dist = new NormalDistribution(100, 15);

// Run 10,000 simulations
const samples: number[] = [];
for (let i = 0; i < 10000; i++) {
  samples.push(dist.sample(rng));
}

// Calculate statistics
const mean = samples.reduce((a, b) => a + b) / samples.length;
console.log(`Mean: ${mean}`); // ~100
```

## Testing

```bash
# Run tests
npm test

# Watch mode (TDD)
npm run test:watch

# Coverage report
npm run test:coverage
```

## Demo

```bash
# Run interactive demo
npx ts-node examples/test-normal.ts
```

Output:
```
============================================================
Argo Normal Distribution Test
============================================================

Distribution Parameters:
  Mean: 100
  Standard Deviation: 15

Simple Monte Carlo Simulation:
  Simulating 10,000 samples...

Results:
  Iterations: 10,000
  Duration: 2ms (5,000,000 samples/sec)

Empirical Statistics (from samples):
  Mean: 100.04 (expected: 100.00)
  Std Dev: 14.88 (expected: 15.00)

✅ Normal distribution is working correctly!
============================================================
```

## API Reference

### Distributions

#### `NormalDistribution`

Normal (Gaussian) distribution with mean μ and standard deviation σ.

**Constructor:**
```typescript
new NormalDistribution(mean: number, stddev: number)
```

**Methods:**
- `sample(rng: RandomNumberGenerator): number` - Generate random sample
- `pdf(x: number): number` - Probability density function
- `cdf(x: number): number` - Cumulative distribution function
- `inverseCDF(p: number): number` - Inverse CDF (quantile function)
- `validateParameters(): boolean` - Validate parameters

**Properties:**
- `mean: number` - Mean (μ)
- `stddev: number` - Standard deviation (σ)

### Utilities

#### `SimpleRNG`

Seedable random number generator using Mulberry32 algorithm.

**Constructor:**
```typescript
new SimpleRNG(seed?: number)
```

**Methods:**
- `next(): number` - Generate random number [0, 1)
- `nextInt(min: number, max: number): number` - Random integer
- `nextGaussian(): number` - Standard normal random variable

## Development

### Test-Driven Development (TDD)

This package follows strict TDD methodology:

1. **Red:** Write failing test
2. **Green:** Implement minimal code to pass
3. **Refactor:** Improve code while keeping tests green

**Example workflow:**
```bash
# Start watch mode
npm run test:watch

# 1. Write test in tests/distributions/UniformDistribution.test.ts
# 2. Watch test fail (RED)
# 3. Implement in src/distributions/UniformDistribution.ts
# 4. Watch test pass (GREEN)
# 5. Refactor if needed
```

### Adding a New Distribution

1. Create test file: `tests/distributions/YourDistribution.test.ts`
2. Write comprehensive tests (constructor, sample, pdf, cdf, inverseCDF)
3. Create implementation: `src/distributions/YourDistribution.ts`
4. Implement `Distribution` interface
5. Export from `src/index.ts`
6. Run tests: `npm test`
7. Ensure 80%+ coverage

## Performance

**Benchmarks (on typical laptop):**
- Normal distribution sampling: **5 million samples/second**
- PDF calculation: **10 million calculations/second**
- CDF calculation: **8 million calculations/second**

## Roadmap

### Sprint 1 & 2: Continuous Distributions ✅ COMPLETE
- [x] Normal, Uniform, Triangular
- [x] Log-Normal, Exponential
- [x] Beta, Gamma, Weibull
- [x] Pareto, PERT
- [x] 97%+ test coverage
- [x] 504 comprehensive tests

### Sprint 3: Discrete Distributions (Current)
- [ ] Binomial
- [ ] Poisson
- [ ] Geometric
- [ ] Hypergeometric

### Phase 2: Statistical Functions
- [ ] Descriptive statistics (mean, median, std dev, etc.)
- [ ] Confidence intervals
- [ ] Sensitivity analysis
- [ ] Risk metrics (VaR, CVaR)

### Phase 3: Simulation Engine
- [ ] Monte Carlo engine
- [ ] Dependency graph
- [ ] Correlation support
- [ ] Parallel execution

## License

Apache 2.0 - See [LICENSE.md](../../LICENSE.md)

## Contributing

See [COLLABORATION.md](../../docs/COLLABORATION.md) for TDD workflow and development guidelines.

---

**🤖 Built with Claude Code (AI) using Test-Driven Development**
