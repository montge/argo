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
- [Discrete Distributions](#discrete-distributions)
  - [Binomial Distribution](#binomial-distribution)
  - [Poisson Distribution](#poisson-distribution)
  - [Geometric Distribution](#geometric-distribution)
  - [Hypergeometric Distribution](#hypergeometric-distribution)
- [Choosing the Right Distribution](#choosing-the-right-distribution)
- [Examples by Use Case](#examples-by-use-case)

---

## Overview

Argo provides 14 probability distributions (10 continuous + 4 discrete) for modeling uncertainty in Monte Carlo simulations. Each distribution has specific characteristics that make it suitable for different scenarios.

**Key Concepts:**
- **PDF/PMF:** Probability Density Function (continuous) or Probability Mass Function (discrete)
- **CDF (Cumulative Distribution Function):** Probability that a value is ≤ x
- **Inverse CDF (Quantile Function):** Given a probability p, returns the value x where CDF(x) = p
- **Sample:** Generate a random value following the distribution
- **Discrete vs Continuous:** Discrete distributions model countable outcomes (0, 1, 2...), continuous distributions model measurable quantities

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

### Binomial Distribution

**When to use:**
- Fixed number of independent trials with success/fail outcomes
- Quality control (defects in a batch)
- A/B testing (conversions from visitors)
- Clinical trials (patients responding to treatment)
- Any scenario with "n tries, probability p of success each time"

**Parameters:**
- `n` (integer ≥ 1): Number of independent trials
- `p` (0 ≤ p ≤ 1): Probability of success on each trial

**Mean:** n × p
**Variance:** n × p × (1 - p)

**Example:**
```typescript
import { BinomialDistribution, SimpleRNG } from '@argo/core';

// Quality control: 100 items tested, 5% defect rate
const dist = new BinomialDistribution(100, 0.05);
const rng = new SimpleRNG(42);

console.log(dist.mean);        // 5 (expected defects)
console.log(dist.variance);    // 4.75

// Sample: How many defects in this batch?
const defects = dist.sample(rng);  // e.g., 3, 7, 4, 6...

// PMF: Probability of exactly 5 defects
console.log(dist.pmf(5));      // ~0.1800

// CDF: Probability of 5 or fewer defects
console.log(dist.cdf(5));      // ~0.6160
```

**Real-world scenarios:**
- **Manufacturing:** Out of 1000 units, how many will be defective if defect rate is 2%?
- **Marketing:** 500 email recipients, 10% conversion rate - how many conversions?
- **Clinical:** 50 patients, 70% response rate - how many will respond to treatment?

---

### Poisson Distribution

**When to use:**
- Events occurring randomly over time or space
- Rare events with many opportunities
- Call center arrivals, website visits, equipment failures
- Radioactive decay, emails per hour
- When you know the **rate** but not when individual events occur

**Parameters:**
- `λ` (lambda > 0): Average rate of events per interval

**Mean:** λ
**Variance:** λ

**Example:**
```typescript
import { PoissonDistribution, SimpleRNG } from '@argo/core';

// Customer support: average 4 calls per hour
const dist = new PoissonDistribution(4);
const rng = new SimpleRNG(42);

console.log(dist.mean);        // 4
console.log(dist.variance);    // 4

// Sample: How many calls this hour?
const calls = dist.sample(rng);  // e.g., 3, 5, 2, 6...

// PMF: Probability of exactly 4 calls
console.log(dist.pmf(4));      // ~0.1954

// CDF: Probability of 4 or fewer calls
console.log(dist.cdf(4));      // ~0.6288

// Inverse CDF: 90% of hours have this many calls or fewer
console.log(dist.inverseCDF(0.90));  // 7 calls
```

**Real-world scenarios:**
- **IT Operations:** Server receives average 20 requests/minute - simulate load
- **Healthcare:** Emergency room gets 3 patients/hour on average - staffing needs
- **Retail:** Store has 15 customers/hour - checkout lane requirements
- **Network Security:** Website gets 0.5 attacks/day - risk assessment

---

### Geometric Distribution

**When to use:**
- "How many trials until the first success?"
- Memoryless processes (past doesn't affect future)
- Time until first failure, first sale, first defect
- Waiting time problems with constant probability

**Parameters:**
- `p` (0 < p ≤ 1): Probability of success on each trial

**Mean:** 1/p
**Variance:** (1 - p) / p²

**Example:**
```typescript
import { GeometricDistribution, SimpleRNG } from '@argo/core';

// Sales: 10% chance each call converts
const dist = new GeometricDistribution(0.10);
const rng = new SimpleRNG(42);

console.log(dist.mean);        // 10 (average calls until sale)
console.log(dist.variance);    // 90

// Sample: How many calls until first sale?
const calls = dist.sample(rng);  // e.g., 3, 15, 7, 22...

// PMF: Probability first sale on call #5
console.log(dist.pmf(5));      // ~0.0656

// CDF: Probability first sale within 10 calls
console.log(dist.cdf(10));     // ~0.6513

// Inverse CDF: 50% chance of sale within this many calls
console.log(dist.inverseCDF(0.50));  // 7 calls
```

**Real-world scenarios:**
- **Quality Control:** Rolling dice until you get a 6 - how many rolls?
- **Marketing:** Cold calling until first conversion - calls needed?
- **Reliability:** Component with 1% failure rate - how long until first failure?
- **Gaming:** Slot machine with 5% jackpot probability - spins until win?

**Key Property - Memoryless:**
If you've already made 10 attempts without success, the expected number of *additional* attempts is still 1/p. Past failures don't change future probabilities.

---

### Hypergeometric Distribution

**When to use:**
- Sampling **WITHOUT replacement** from finite population
- Population has two categories (success/failure)
- Drawing cards, quality inspection of small batches
- Different from Binomial (which uses replacement/independent trials)

**Parameters:**
- `N` (integer ≥ 1): Total population size
- `K` (0 ≤ K ≤ N): Number of success states in population
- `n` (1 ≤ n ≤ N): Number of draws (sample size)

**Mean:** n × (K/N)
**Variance:** n × (K/N) × (1 - K/N) × ((N - n)/(N - 1))

**Example:**
```typescript
import { HypergeometricDistribution, SimpleRNG } from '@argo/core';

// Quality control: Box of 100 parts, 10 defective, inspect 20
const dist = new HypergeometricDistribution(100, 10, 20);
const rng = new SimpleRNG(42);

console.log(dist.mean);        // 2 (expected defects in sample)
console.log(dist.variance);    // 1.455

// Sample: How many defects in this sample of 20?
const defects = dist.sample(rng);  // e.g., 1, 3, 2, 0...

// PMF: Probability of exactly 2 defects
console.log(dist.pmf(2));      // ~0.2909

// CDF: Probability of 2 or fewer defects
console.log(dist.cdf(2));      // ~0.6766

// Inverse CDF: 95% of samples have this many defects or fewer
console.log(dist.inverseCDF(0.95));  // 5 defects
```

**Real-world scenarios:**
- **Card Games:** Draw 5 cards from deck - how many hearts? (N=52, K=13, n=5)
- **Quality Control:** Inspect 30 units from batch of 500 with 20 defects
- **Jury Selection:** Pick 12 jurors from pool of 100 (60 men, 40 women)
- **Ecology:** Capture-recapture studies - tag 50 fish, release, recapture 30

**When to use Hypergeometric vs Binomial:**
- **Hypergeometric:** Small population, sampling without replacement, dependent trials
- **Binomial:** Large population or sampling with replacement, independent trials
- **Rule of thumb:** If n < 0.05×N (sample < 5% of population), Binomial is good approximation

---

## Choosing the Right Distribution

### Decision Tree

**Is your outcome discrete (countable) or continuous (measurable)?**

**DISCRETE (integers: 0, 1, 2, 3...):**
- **Fixed number of independent trials (n) with success probability (p):** Binomial Distribution
- **Count of events in fixed interval with rate (λ):** Poisson Distribution
- **Number of trials until first success:** Geometric Distribution
- **Sampling without replacement from finite population:** Hypergeometric Distribution

**CONTINUOUS (measurable values):**

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
- Defects in batch: Binomial, Hypergeometric
- Inspection times: Log-Normal

**Sales & Marketing:**
- Customer lifetime value: Pareto, Log-Normal
- Conversion rates: Beta
- Conversions from visitors: Binomial
- Calls until first sale: Geometric
- Sales volume: Normal, Log-Normal

**IT Operations & Support:**
- Server requests per minute: Poisson
- Calls per hour: Poisson
- Incidents per day: Poisson
- Tests until first failure: Geometric

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

### Example 4: Quality Control Inspection (Discrete)

```typescript
import { BinomialDistribution, HypergeometricDistribution, SimpleRNG } from '@argo/core';

const rng = new SimpleRNG(54321);

// Scenario: Manufacturing batch of 1000 units with 2% defect rate

// Method 1: Sample with replacement (Binomial)
const binomial = new BinomialDistribution(100, 0.02); // Inspect 100 units

// Method 2: Sample without replacement (Hypergeometric)
const hypergeometric = new HypergeometricDistribution(1000, 20, 100);
// Population: 1000, Defective: 20, Sample: 100

// Run 10,000 simulations for each
const binomialResults: number[] = [];
const hyperResults: number[] = [];

for (let i = 0; i < 10000; i++) {
  binomialResults.push(binomial.sample(rng));
  hyperResults.push(hypergeometric.sample(rng));
}

const binomialMean = binomialResults.reduce((a, b) => a + b) / binomialResults.length;
const hyperMean = hyperResults.reduce((a, b) => a + b) / hyperResults.length;

console.log(`Binomial - Expected defects: ${binomialMean.toFixed(2)}`);
console.log(`Hypergeometric - Expected defects: ${hyperMean.toFixed(2)}`);
console.log(`Theoretical (both): ${binomial.mean.toFixed(2)}`);

// Probability of finding 0 defects (batch appears good)
console.log(`P(0 defects | Binomial): ${(binomial.pmf(0) * 100).toFixed(1)}%`);
console.log(`P(0 defects | Hypergeometric): ${(hypergeometric.pmf(0) * 100).toFixed(1)}%`);
```

### Example 5: Customer Support Staffing (Poisson)

```typescript
import { PoissonDistribution, SimpleRNG } from '@argo/core';

const rng = new SimpleRNG(11111);

// Average 12 calls per hour
const callsPerHour = new PoissonDistribution(12);

// Simulate 24 hours
const hourlyResults: number[] = [];
for (let hour = 0; hour < 24; hour++) {
  hourlyResults.push(callsPerHour.sample(rng));
}

// Calculate statistics
const maxCalls = Math.max(...hourlyResults);
const avgCalls = hourlyResults.reduce((a, b) => a + b) / hourlyResults.length;

console.log(`Average calls per hour: ${avgCalls.toFixed(1)}`);
console.log(`Maximum in any hour: ${maxCalls}`);

// Staffing question: How many agents needed to handle 95% of hours?
const p95 = callsPerHour.inverseCDF(0.95);
console.log(`95th percentile: ${p95} calls`);
console.log(`Recommended staffing: ${Math.ceil(p95 / 5)} agents (5 calls/hour each)`);

// Probability of overwhelm (>20 calls in an hour)
const probOverwhelm = 1 - callsPerHour.cdf(20);
console.log(`P(>20 calls in hour): ${(probOverwhelm * 100).toFixed(2)}%`);
```

### Example 6: Sales Conversion Pipeline (Geometric)

```typescript
import { GeometricDistribution, SimpleRNG } from '@argo/core';

const rng = new SimpleRNG(33333);

// 8% conversion rate per sales call
const conversionDist = new GeometricDistribution(0.08);

// Simulate 100 sales reps
const callsNeeded: number[] = [];
for (let rep = 0; rep < 100; rep++) {
  callsNeeded.push(conversionDist.sample(rng));
}

// Calculate statistics
callsNeeded.sort((a, b) => a - b);
const median = callsNeeded[50];
const p90 = callsNeeded[90];
const totalCalls = callsNeeded.reduce((a, b) => a + b);

console.log(`Expected calls per sale: ${conversionDist.mean.toFixed(1)}`);
console.log(`Median calls (simulated): ${median}`);
console.log(`90th percentile: ${p90} calls`);
console.log(`Total calls for 100 sales: ${totalCalls}`);

// Business question: What if we make 50 calls per rep?
const prob50orLess = conversionDist.cdf(50);
console.log(`P(sale within 50 calls): ${(prob50orLess * 100).toFixed(1)}%`);

// How many calls to be 90% confident of at least one sale?
const callsFor90 = conversionDist.inverseCDF(0.90);
console.log(`Calls needed for 90% confidence: ${callsFor90}`);
```

---

## Best Practices

1. **Start Simple:** Use Triangular/Uniform when you lack data (continuous), Binomial for counts
2. **Discrete vs Continuous:** Count outcomes → Discrete; Measure values → Continuous
3. **Validate Assumptions:** Check if your chosen distribution matches reality
4. **Seed Your RNG:** Use `SimpleRNG(seed)` for reproducible results
5. **Run Enough Iterations:** 10,000+ for most simulations
6. **Check Percentiles:** Look at P10, P50, P90, not just mean
7. **Document Your Choices:** Explain why you chose each distribution
8. **Sensitivity Analysis:** Test how results change with different distributions
9. **Sampling Method Matters:** With/without replacement affects Binomial vs Hypergeometric choice

---

**For more information:**
- [REQUIREMENTS.md](./REQUIREMENTS.md) - Functional requirements
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture
- [argo-core README](../packages/argo-core/README.md) - API reference

**Version:** 5.0.0-alpha.1
**Last Updated:** October 2025
