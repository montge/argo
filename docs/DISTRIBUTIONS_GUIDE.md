# Argo Distributions Guide

**Version:** 5.0.0-alpha.1
**Last Updated:** October 2025

This guide provides practical information for using probability distributions in Argo for Monte Carlo simulations.

## Table of Contents

- [Overview](#overview)
- [Continuous Distributions](#continuous-distributions)
  - [Normal Distribution](#normal-distribution)
  - [Uniform Distribution](#uniform-distribution)
  - [Triangular Distribution](#triangular-distribution)
  - [Log-Normal Distribution](#log-normal-distribution)
  - [Exponential Distribution](#exponential-distribution)
  - [Beta Distribution](#beta-distribution)
  - [Gamma Distribution](#gamma-distribution)
  - [Weibull Distribution](#weibull-distribution)
  - [Pareto Distribution](#pareto-distribution)
  - [PERT Distribution](#pert-distribution)
- [Discrete Distributions](#discrete-distributions) _(Coming in Sprint 3)_
- [Choosing the Right Distribution](#choosing-the-right-distribution)
- [Examples by Use Case](#examples-by-use-case)

---

## Overview

Argo provides 10 continuous probability distributions (as of Sprint 2) for modeling uncertainty in Monte Carlo simulations. Each distribution has specific characteristics that make it suitable for different scenarios.

**Key Concepts:**
- **PDF (Probability Density Function):** Describes the relative likelihood of different values
- **CDF (Cumulative Distribution Function):** Probability that a value is ≤ x
- **Inverse CDF (Quantile Function):** Given a probability p, returns the value x where CDF(x) = p
- **Sample:** Generate a random value following the distribution

---

## Continuous Distributions

### Normal Distribution

**When to use:**
- Natural phenomena with symmetric variation around a mean
- Measurement errors
- Many real-world processes (heights, test scores, manufacturing tolerances)
- Central Limit Theorem applies (sum of many independent factors)

**Parameters:**
- `mean` (μ): Center of the distribution
- `stddev` (σ): Spread around the mean (σ > 0)

**Properties:**
- Support: (-∞, +∞)
- Shape: Symmetric bell curve
- 68% of values within ±1σ, 95% within ±2σ, 99.7% within ±3σ

**Example:**
```typescript
import { NormalDistribution, SimpleRNG } from '@argo/core';

const rng = new SimpleRNG(42);

// Project cost with uncertainty
const cost = new NormalDistribution(100000, 15000);
console.log(`Estimated cost: $${cost.sample(rng).toFixed(0)}`);
// Most values between $70,000 and $130,000

// What's the probability cost exceeds $120,000?
console.log(`P(cost > $120k) = ${(1 - cost.cdf(120000)).toFixed(3)}`);
// Output: 0.091 (9.1%)
```

**Real-world applications:**
- Financial returns (short-term)
- Quality control measurements
- IQ scores
- Physical measurements (height, weight)

---

### Uniform Distribution

**When to use:**
- All values in a range are equally likely
- Complete uncertainty within bounds
- Random selection from a range
- As a starting point when you have no information except min/max

**Parameters:**
- `min`: Minimum value (inclusive)
- `max`: Maximum value (inclusive)

**Properties:**
- Support: [min, max]
- Shape: Flat/rectangular
- Mean: (min + max) / 2
- Every value has equal probability

**Example:**
```typescript
import { UniformDistribution, SimpleRNG } from '@argo/core';

const rng = new SimpleRNG(42);

// Random delivery time between 2 and 5 days
const delivery = new UniformDistribution(2, 5);
console.log(`Delivery time: ${delivery.sample(rng).toFixed(1)} days`);

// Random interest rate between 3% and 7%
const rate = new UniformDistribution(0.03, 0.07);
console.log(`Interest rate: ${(rate.sample(rng) * 100).toFixed(2)}%`);
```

**Real-world applications:**
- Round-off errors
- Random number generation
- Arrival times (when no pattern is known)
- Placeholder when no data is available

---

### Triangular Distribution

**When to use:**
- You know min, max, and most likely value (mode)
- Expert estimates without detailed data
- Project planning and cost estimation
- Simple alternative to normal when bounds are needed

**Parameters:**
- `min`: Minimum possible value
- `mode`: Most likely value (peak)
- `max`: Maximum possible value

**Properties:**
- Support: [min, max]
- Shape: Triangle with peak at mode
- Mean: (min + mode + max) / 3
- Skewed if mode is not centered

**Example:**
```typescript
import { TriangularDistribution, SimpleRNG } from '@argo/core';

const rng = new SimpleRNG(42);

// Task duration: optimistic 3 days, most likely 5 days, pessimistic 10 days
const duration = new TriangularDistribution(3, 5, 10);
console.log(`Task duration: ${duration.sample(rng).toFixed(1)} days`);
console.log(`Mean: ${duration.mean.toFixed(1)} days`); // 6.0 days

// Sales forecast: min $50k, likely $80k, max $120k
const sales = new TriangularDistribution(50000, 80000, 120000);
console.log(`Expected sales: $${sales.sample(rng).toFixed(0)}`);
```

**Real-world applications:**
- Project task duration estimates
- Cost estimates with expert judgment
- Sales forecasts
- Resource requirements

---

### Log-Normal Distribution

**When to use:**
- Values are always positive and right-skewed
- Multiplicative processes
- Values can't go negative but can be very large
- Income, stock prices, file sizes

**Parameters:**
- `mu` (μ): Mean of underlying normal distribution (not the mean of log-normal!)
- `sigma` (σ): Std dev of underlying normal (σ > 0)

**Properties:**
- Support: (0, +∞)
- Shape: Right-skewed, long tail to the right
- Mean: exp(μ + σ²/2)
- Cannot be negative

**Example:**
```typescript
import { LogNormalDistribution, SimpleRNG } from '@argo/core';

const rng = new SimpleRNG(42);

// Stock price (always positive, can grow exponentially)
const stock = new LogNormalDistribution(4.6, 0.2); // Mean ~$100
console.log(`Stock price: $${stock.sample(rng).toFixed(2)}`);

// File download time (always positive, occasional very long waits)
const downloadTime = new LogNormalDistribution(2, 0.5);
console.log(`Download time: ${downloadTime.sample(rng).toFixed(1)} seconds`);
```

**Real-world applications:**
- Stock prices and returns
- Income distributions
- File sizes
- Survival times
- Particle sizes

---

### Exponential Distribution

**When to use:**
- Time between events in a Poisson process
- Waiting times, lifetimes
- Memoryless processes (past doesn't affect future)
- Reliability engineering (time to failure)

**Parameters:**
- `rate` (λ): Rate parameter (λ > 0). Mean time = 1/λ

**Properties:**
- Support: [0, +∞)
- Shape: Decreasing exponential curve
- Mean: 1/rate
- Memoryless property

**Example:**
```typescript
import { ExponentialDistribution, SimpleRNG } from '@argo/core';

const rng = new SimpleRNG(42);

// Time between customer arrivals (average 5 minutes = rate 0.2 per minute)
const arrivalTime = new ExponentialDistribution(0.2);
console.log(`Next customer in: ${arrivalTime.sample(rng).toFixed(1)} minutes`);
console.log(`Mean wait time: ${arrivalTime.mean.toFixed(1)} minutes`); // 5.0

// Component lifetime (fails on average after 1000 hours)
const lifetime = new ExponentialDistribution(1/1000);
console.log(`Component lifespan: ${lifetime.sample(rng).toFixed(0)} hours`);
```

**Real-world applications:**
- Customer service wait times
- Equipment failure times
- Time between phone calls
- Radioactive decay
- Network packet inter-arrival times

---

### Beta Distribution

**When to use:**
- Values bounded between 0 and 1
- Modeling percentages, proportions, probabilities
- Flexible shape (U-shaped, bell-shaped, J-shaped)
- Bayesian prior for probabilities

**Parameters:**
- `alpha` (α): First shape parameter (α > 0)
- `beta` (β): Second shape parameter (β > 0)

**Properties:**
- Support: [0, 1]
- Shape: Extremely flexible depending on α and β
- Mean: α / (α + β)
- α = β: symmetric, α < β: skewed left, α > β: skewed right

**Example:**
```typescript
import { BetaDistribution, SimpleRNG } from '@argo/core';

const rng = new SimpleRNG(42);

// Project completion percentage (tends toward 70-90%)
const completion = new BetaDistribution(8, 2);
console.log(`Project ${(completion.sample(rng) * 100).toFixed(1)}% complete`);

// Success rate for a new product (uncertain, centered around 50%)
const successRate = new BetaDistribution(2, 2);
console.log(`Success probability: ${(successRate.sample(rng) * 100).toFixed(1)}%`);

// Defect rate (most likely very low, but uncertain)
const defectRate = new BetaDistribution(1, 20);
console.log(`Defect rate: ${(defectRate.sample(rng) * 100).toFixed(2)}%`);
```

**Real-world applications:**
- Conversion rates
- Success probabilities
- Market share
- Test pass rates
- Bayesian analysis

---

### Gamma Distribution

**When to use:**
- Waiting time for multiple events
- Sum of exponential random variables
- Modeling positive, right-skewed data
- Rainfall amounts, insurance claims

**Parameters:**
- `shape` (k): Shape parameter (k > 0)
- `rate` (θ): Rate parameter (θ > 0). Alternatively: scale = 1/rate

**Properties:**
- Support: [0, +∞)
- Shape: Right-skewed, approaches normal for large k
- Mean: shape / rate
- For k=1: equivalent to Exponential

**Example:**
```typescript
import { GammaDistribution, SimpleRNG } from '@argo/core';

const rng = new SimpleRNG(42);

// Total rainfall in a month (always positive, right-skewed)
const rainfall = new GammaDistribution(5, 0.2); // Mean = 25mm
console.log(`Monthly rainfall: ${rainfall.sample(rng).toFixed(1)} mm`);

// Insurance claim amount
const claimAmount = new GammaDistribution(2, 0.001); // Mean = $2000
console.log(`Claim amount: $${claimAmount.sample(rng).toFixed(0)}`);
```

**Real-world applications:**
- Insurance claims
- Rainfall amounts
- Queue waiting times
- Load on web servers
- Survival analysis

---

### Weibull Distribution

**When to use:**
- Reliability engineering (time to failure)
- Modeling failure rates that change over time
- Extreme value analysis
- Wind speed distributions

**Parameters:**
- `shape` (k): Shape parameter (k > 0)
- `scale` (λ): Scale parameter (λ > 0)

**Properties:**
- Support: [0, +∞)
- Shape varies:
  - k < 1: Decreasing failure rate (early failures)
  - k = 1: Constant failure rate (Exponential)
  - k > 1: Increasing failure rate (wear-out)
- Mean: scale × Γ(1 + 1/shape)

**Example:**
```typescript
import { WeibullDistribution, SimpleRNG } from '@argo/core';

const rng = new SimpleRNG(42);

// Component lifetime with increasing failure rate (wear-out)
const lifetime = new WeibullDistribution(2, 1000); // k=2: wear-out phase
console.log(`Component fails after: ${lifetime.sample(rng).toFixed(0)} hours`);

// Wind speed distribution
const windSpeed = new WeibullDistribution(2, 10); // k=2: Rayleigh-like
console.log(`Wind speed: ${windSpeed.sample(rng).toFixed(1)} m/s`);
```

**Real-world applications:**
- Equipment failure analysis
- Warranty prediction
- Material strength
- Wind speed modeling
- Reliability testing

---

### Pareto Distribution

**When to use:**
- Power law phenomena (80/20 rule)
- Income and wealth distributions
- City sizes, firm sizes
- File sizes, network traffic
- "Heavy-tailed" distributions

**Parameters:**
- `scale` (xₘ): Minimum value (xₘ > 0)
- `shape` (α): Tail parameter (α > 0). Smaller α = heavier tail

**Properties:**
- Support: [scale, +∞)
- Shape: Power law, heavy right tail
- Mean: scale × shape / (shape - 1) if shape > 1, else ∞
- Pareto principle: For α ≈ 1.16, top 20% account for 80% of total

**Example:**
```typescript
import { ParetoDistribution, SimpleRNG } from '@argo/core';

const rng = new SimpleRNG(42);

// Income distribution (80/20 rule)
const income = new ParetoDistribution(30000, 1.16); // Min $30k, 80/20 rule
console.log(`Income: $${income.sample(rng).toFixed(0)}`);

// File sizes (most small, few very large)
const fileSize = new ParetoDistribution(1, 2); // Min 1 MB
console.log(`File size: ${fileSize.sample(rng).toFixed(1)} MB`);

// Verify 80/20 rule
const p80 = income.inverseCDF(0.8); // 80th percentile
const p100 = income.inverseCDF(0.999); // Near maximum
console.log(`80% earn less than: $${p80.toFixed(0)}`);
```

**Real-world applications:**
- Wealth and income distributions
- Sales by customer (80/20 rule)
- Website traffic
- City populations
- Natural resource distribution

---

### PERT Distribution

**When to use:**
- Project management (smoother than Triangular)
- Three-point estimates (optimistic, likely, pessimistic)
- Task duration estimation
- When you want less extreme values than Triangular

**Parameters:**
- `min`: Minimum (optimistic estimate)
- `mode`: Most likely value
- `max`: Maximum (pessimistic estimate)

**Properties:**
- Support: [min, max]
- Shape: Smooth bell curve (based on Beta distribution)
- Mean: (min + 4×mode + max) / 6 (weighted toward mode)
- Less probability at extremes than Triangular

**Example:**
```typescript
import { PERTDistribution, SimpleRNG } from '@argo/core';

const rng = new SimpleRNG(42);

// Task duration: optimistic 5 days, likely 8 days, pessimistic 15 days
const duration = new PERTDistribution(5, 8, 15);
console.log(`Task duration: ${duration.sample(rng).toFixed(1)} days`);
console.log(`Expected duration: ${duration.mean.toFixed(1)} days`); // ~8.8 days

// Project cost estimate
const cost = new PERTDistribution(80000, 100000, 150000);
console.log(`Project cost: $${cost.sample(rng).toFixed(0)}`);
console.log(`Expected cost: $${cost.mean.toFixed(0)}`); // ~105,000
```

**Real-world applications:**
- Project task duration (PERT/CPM)
- Cost estimation
- Resource planning
- Risk analysis with three-point estimates

---

## Discrete Distributions

_(Coming in Sprint 3: Binomial, Poisson, Geometric, Hypergeometric)_

---

## Choosing the Right Distribution

### Decision Tree

**Is your variable bounded?**
- **Bounded [0, 1]:** Beta Distribution
- **Bounded [min, max] with a mode:**
  - More peaked/smooth → PERT Distribution
  - More uniform weight → Triangular Distribution
- **Bounded [min, max] equally likely:** Uniform Distribution

**Is your variable unbounded positive?**
- **Right-skewed, multiplicative process:** Log-Normal Distribution
- **Time between events:** Exponential Distribution
- **Time for k events:** Gamma Distribution
- **Failure rate changes over time:** Weibull Distribution
- **Power law / 80-20 rule:** Pareto Distribution

**Is your variable unbounded (can be negative)?**
- **Symmetric around mean:** Normal Distribution

### By Industry/Application

**Project Management:**
- Task duration: Triangular, PERT
- Cost estimates: Triangular, PERT, Log-Normal
- Resource availability: Beta, Uniform

**Finance:**
- Stock returns (short-term): Normal
- Stock prices: Log-Normal
- Default probability: Beta
- Extreme events: Pareto

**Reliability Engineering:**
- Time to failure: Exponential, Weibull, Gamma
- Wear-out failures: Weibull (k > 1)
- Random failures: Exponential

**Quality Control:**
- Measurement errors: Normal
- Defect rates: Beta
- Inspection times: Log-Normal

**Sales & Marketing:**
- Customer lifetime value: Pareto, Log-Normal
- Conversion rates: Beta
- Sales volume: Normal, Log-Normal

---

## Examples by Use Case

### Example 1: Project Cost Estimate

```typescript
import { PERTDistribution, SimpleRNG } from '@argo/core';

const rng = new SimpleRNG(12345);

// Labor cost: optimistic $50k, likely $70k, pessimistic $100k
const labor = new PERTDistribution(50000, 70000, 100000);

// Materials: optimistic $20k, likely $25k, pessimistic $40k
const materials = new PERTDistribution(20000, 25000, 40000);

// Run 10,000 simulations
const results: number[] = [];
for (let i = 0; i < 10000; i++) {
  const totalCost = labor.sample(rng) + materials.sample(rng);
  results.push(totalCost);
}

// Calculate statistics
results.sort((a, b) => a - b);
const mean = results.reduce((a, b) => a + b) / results.length;
const p50 = results[Math.floor(results.length * 0.5)];
const p90 = results[Math.floor(results.length * 0.9)];

console.log(`Mean cost: $${mean.toFixed(0)}`);
console.log(`Median cost: $${p50.toFixed(0)}`);
console.log(`90th percentile: $${p90.toFixed(0)}`);
console.log(`Expected: ${labor.mean + materials.mean}`);
```

### Example 2: Reliability Analysis

```typescript
import { WeibullDistribution, SimpleRNG } from '@argo/core';

const rng = new SimpleRNG(99999);

// Component with increasing failure rate (wear-out)
const component = new WeibullDistribution(2.5, 5000); // shape > 1

// Simulate 1000 components
const failures: number[] = [];
for (let i = 0; i < 1000; i++) {
  failures.push(component.sample(rng));
}

// Calculate reliability at 3000 hours
const survivedCount = failures.filter(t => t > 3000).length;
const reliability = survivedCount / failures.length;

console.log(`Reliability at 3000 hours: ${(reliability * 100).toFixed(1)}%`);
console.log(`Expected lifetime: ${component.mean.toFixed(0)} hours`);

// Compare to CDF
const probFailByHour = component.cdf(3000);
console.log(`Probability of failure by 3000h: ${(probFailByHour * 100).toFixed(1)}%`);
```

### Example 3: Sales Forecast with 80/20 Rule

```typescript
import { ParetoDistribution, SimpleRNG } from '@argo/core';

const rng = new SimpleRNG(777);

// Customer value follows Pareto (few high-value customers)
const customerValue = new ParetoDistribution(100, 1.16); // Min $100, 80/20

// Simulate 100 customers
const values: number[] = [];
for (let i = 0; i < 100; i++) {
  values.push(customerValue.sample(rng));
}

values.sort((a, b) => b - a); // Descending
const totalValue = values.reduce((a, b) => a + b);
const top20Value = values.slice(0, 20).reduce((a, b) => a + b);

console.log(`Total value: $${totalValue.toFixed(0)}`);
console.log(`Top 20% contribute: $${top20Value.toFixed(0)}`);
console.log(`Percentage: ${(top20Value / totalValue * 100).toFixed(1)}%`);
// Should be close to 80%
```

---

## Best Practices

1. **Start Simple:** Use Triangular/Uniform when you lack data
2. **Validate Assumptions:** Check if your chosen distribution matches reality
3. **Seed Your RNG:** Use `SimpleRNG(seed)` for reproducible results
4. **Run Enough Iterations:** 10,000+ for most simulations
5. **Check Percentiles:** Look at P10, P50, P90, not just mean
6. **Document Your Choices:** Explain why you chose each distribution
7. **Sensitivity Analysis:** Test how results change with different distributions

---

**For more information:**
- [REQUIREMENTS.md](./REQUIREMENTS.md) - Functional requirements
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture
- [argo-core README](../packages/argo-core/README.md) - API reference

**Version:** 5.0.0-alpha.1
**Last Updated:** October 2025
