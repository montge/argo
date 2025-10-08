# Sprint 4: Statistical Functions - Implementation Plan

**Status:** Ready to Start
**Target Date:** Week of 2025-11-04
**Duration:** 1 week
**Current Date:** 2025-10-08

---

## Overview

Sprint 4 focuses on implementing the statistical functions needed for Monte Carlo simulation analysis. These functions will process simulation results and provide insights for decision-making.

**Requirement:** FR-003 - Statistical Analysis Functions (50+ functions)
**Sprint 4 Target:** 30+ functions (core subset)

---

## Requirements Analysis

### From REQUIREMENTS.md (FR-003):

**Categories Required:**
1. **Descriptive Statistics** ✅ In Sprint 4
   - Mean, Median, Mode, Std Dev, Variance, Skewness, Kurtosis, Percentiles

2. **Distributions Analysis** ✅ Already Complete (Sprints 1-3)
   - PDF, CDF, Inverse CDF, Random sampling
   - 14 distributions implemented

3. **Confidence Intervals** ✅ In Sprint 4
   - Parametric and non-parametric intervals

4. **Sensitivity Analysis** ⏳ Sprint 5 (with Simulation Engine)
   - Correlation coefficients, regression statistics

5. **Risk Metrics** ✅ In Sprint 4
   - VaR (Value at Risk), CVaR, probability of target achievement

---

## Sprint 4 Scope

### Module 1: Descriptive Statistics (12 functions)

**Location:** `packages/argo-core/src/stats/descriptive.ts`

1. **Central Tendency:**
   - `mean(data: number[]): number` - Arithmetic mean
   - `median(data: number[]): number` - Middle value
   - `mode(data: number[]): number[]` - Most frequent value(s)
   - `geometricMean(data: number[]): number` - Nth root of product
   - `harmonicMean(data: number[]): number` - Reciprocal of arithmetic mean of reciprocals

2. **Dispersion:**
   - `variance(data: number[], sample = true): number` - Variance (sample or population)
   - `standardDeviation(data: number[], sample = true): number` - Square root of variance
   - `range(data: number[]): number` - Max - Min
   - `min(data: number[]): number` - Minimum value
   - `max(data: number[]): number` - Maximum value

3. **Shape:**
   - `skewness(data: number[]): number` - Asymmetry measure
   - `kurtosis(data: number[]): number` - Tail heaviness measure

**Total:** 12 functions

### Module 2: Percentiles & Quantiles (5 functions)

**Location:** `packages/argo-core/src/stats/percentiles.ts`

1. `percentile(data: number[], p: number): number` - Generic percentile function
2. `quartiles(data: number[]): { q1: number; q2: number; q3: number }` - 25th, 50th, 75th
3. `iqr(data: number[]): number` - Interquartile range (Q3 - Q1)
4. `percentiles(data: number[], ps: number[]): number[]` - Multiple percentiles at once
5. `quantile(data: number[], q: number): number` - Alias for percentile

**Special percentiles to support:**
- P5, P10, P25, P50, P75, P90, P95, P99

**Total:** 5 functions

### Module 3: Confidence Intervals (4 functions)

**Location:** `packages/argo-core/src/stats/intervals.ts`

1. `confidenceIntervalNormal(data: number[], confidence = 0.95): { lower: number; upper: number; margin: number }`
   - Parametric interval assuming normality
   - Uses t-distribution for small samples

2. `confidenceIntervalBootstrap(data: number[], confidence = 0.95, iterations = 10000): { lower: number; upper: number }`
   - Non-parametric bootstrap resampling
   - More robust, no distribution assumptions

3. `marginOfError(data: number[], confidence = 0.95): number`
   - Half-width of confidence interval

4. `sampleSize(marginOfError: number, stdDev: number, confidence = 0.95): number`
   - Required sample size for desired precision

**Total:** 4 functions

### Module 4: Risk Metrics (6 functions)

**Location:** `packages/argo-core/src/stats/risk.ts`

1. **Value at Risk (VaR):**
   - `valueAtRisk(data: number[], confidence = 0.95): number`
   - Returns the value below which (1 - confidence)% of observations fall
   - Example: VaR(0.95) = 95th percentile

2. **Conditional Value at Risk (CVaR):**
   - `conditionalVaR(data: number[], confidence = 0.95): number`
   - Average loss beyond VaR threshold
   - Also called Expected Shortfall

3. **Probability Metrics:**
   - `probabilityExceeding(data: number[], threshold: number): number`
   - `probabilityBelow(data: number[], threshold: number): number`
   - `probabilityBetween(data: number[], lower: number, upper: number): number`

4. **Target Achievement:**
   - `probabilityOfTarget(data: number[], target: number, direction: 'above' | 'below'): number`
   - Probability of achieving a target value

**Total:** 6 functions

### Module 5: Distribution Fitting (3 functions)

**Location:** `packages/argo-core/src/stats/fitting.ts`

1. `fitNormal(data: number[]): { mu: number; sigma: number }`
   - Estimate parameters for normal distribution

2. `fitLogNormal(data: number[]): { mu: number; sigma: number }`
   - Estimate parameters for log-normal distribution

3. `goodnessOfFit(data: number[], distribution: Distribution): { chiSquare: number; pValue: number }`
   - Test how well data fits a distribution

**Total:** 3 functions

---

## Total Functions: 30

| Module | Functions | Priority |
|--------|-----------|----------|
| Descriptive Statistics | 12 | Critical |
| Percentiles & Quantiles | 5 | Critical |
| Confidence Intervals | 4 | High |
| Risk Metrics | 6 | High |
| Distribution Fitting | 3 | Medium |
| **TOTAL** | **30** | |

---

## Implementation Plan (TDD)

### Phase 1: Descriptive Statistics (Days 1-2)

**Day 1: Central Tendency & Dispersion**
1. Create `src/stats/descriptive.ts`
2. Create `tests/stats/descriptive.test.ts` (write tests FIRST)
3. Implement: mean, median, mode, variance, stdDev, min, max, range
4. Tests: 8 functions × 5-8 tests each = ~50 tests
5. Target coverage: 100%

**Day 2: Shape Measures**
1. Add tests for skewness, kurtosis, geometricMean, harmonicMean
2. Implement functions
3. Tests: 4 functions × 8-10 tests each = ~35 tests
4. Edge cases: empty arrays, single values, negative numbers
5. Target coverage: 100%

### Phase 2: Percentiles (Day 3)

1. Create `src/stats/percentiles.ts`
2. Create `tests/stats/percentiles.test.ts`
3. Implement percentile algorithms (use sorting + interpolation)
4. Tests: 5 functions × 8-10 tests each = ~40 tests
5. Test special cases: P0, P50, P100, out-of-range values
6. Target coverage: 100%

### Phase 3: Confidence Intervals (Day 4)

1. Create `src/stats/intervals.ts`
2. Create `tests/stats/intervals.test.ts`
3. Implement parametric intervals (t-distribution)
4. Implement bootstrap intervals (with SimpleRNG for reproducibility)
5. Tests: 4 functions × 10-12 tests each = ~45 tests
6. Test various confidence levels: 0.90, 0.95, 0.99
7. Target coverage: 95%+

### Phase 4: Risk Metrics (Day 5)

1. Create `src/stats/risk.ts`
2. Create `tests/stats/risk.test.ts`
3. Implement VaR, CVaR, probability functions
4. Tests: 6 functions × 8-10 tests each = ~50 tests
5. Test with known distributions for validation
6. Target coverage: 100%

### Phase 5: Distribution Fitting (Day 6)

1. Create `src/stats/fitting.ts`
2. Create `tests/stats/fitting.test.ts`
3. Implement parameter estimation (MLE)
4. Implement goodness-of-fit test
5. Tests: 3 functions × 10-12 tests each = ~35 tests
6. Target coverage: 95%+

### Phase 6: Integration & Documentation (Day 7)

1. Export all functions from `src/index.ts`
2. Create `docs/STATISTICS_GUIDE.md` with examples
3. Update README.md with Sprint 4 completion
4. Final test run: ~255 total tests for stats
5. Verify total coverage: 96%+ overall
6. Update ROADMAP.md

---

## Test Strategy

### Test Categories (per function):

1. **Basic Functionality:**
   - Normal inputs with known outputs
   - Compare against reference implementations

2. **Edge Cases:**
   - Empty array
   - Single element
   - Two elements
   - All same values

3. **Special Values:**
   - Negative numbers
   - Zero values
   - Very large numbers
   - Very small numbers
   - Mixed positive/negative

4. **Error Handling:**
   - Invalid inputs (null, undefined, non-numeric)
   - Out-of-range parameters (confidence < 0 or > 1)

5. **Accuracy:**
   - Compare with known statistical results
   - Test against datasets with known properties

### Test Data Sets:

1. **Simple:** `[1, 2, 3, 4, 5]` - Easy to verify manually
2. **Known Distribution:** Sample from Normal(10, 2) - Verify statistics match
3. **Real-World:** Stock prices, project costs, etc.
4. **Edge Cases:** `[1]`, `[]`, `[1, 1, 1]`, `[-5, -3, -1, 0, 1]`

---

## Dependencies

### Internal:
- `SimpleRNG` (already implemented) - For bootstrap resampling
- Distribution classes (already implemented) - For fitting tests

### External:
- None new - pure TypeScript/JavaScript implementations

### Mathematical Libraries:
- **NO external stats libraries** - We implement from scratch for:
  - Full control over algorithms
  - No dependency bloat
  - Educational value
  - License clarity

---

## Success Criteria

1. ✅ 30+ statistical functions implemented
2. ✅ ~255 tests passing (average 8.5 tests per function)
3. ✅ 95%+ code coverage
4. ✅ All functions documented with JSDoc
5. ✅ User guide created (`STATISTICS_GUIDE.md`)
6. ✅ No external dependencies added
7. ✅ Performance: All functions complete in <10ms for n=10,000
8. ✅ Type safety: Full TypeScript strict mode

---

## API Design

### Consistent Function Signatures:

```typescript
// Descriptive statistics - operate on arrays
function mean(data: number[]): number;

// Percentiles - include parameter
function percentile(data: number[], p: number): number;

// Confidence intervals - return objects
function confidenceInterval(
  data: number[],
  confidence?: number
): { lower: number; upper: number; margin: number };

// Risk metrics - include threshold/target
function valueAtRisk(data: number[], confidence?: number): number;

// All functions throw on invalid input
function validateData(data: number[]): void; // Helper
```

### Error Handling:

```typescript
// Throw descriptive errors for:
- Empty arrays (when not valid)
- Non-numeric values
- Out-of-range confidence levels
- NaN or Infinity values (depending on context)
```

---

## File Structure

```
packages/argo-core/
├── src/
│   └── stats/                    # NEW
│       ├── descriptive.ts        # 12 functions
│       ├── percentiles.ts        # 5 functions
│       ├── intervals.ts          # 4 functions
│       ├── risk.ts              # 6 functions
│       ├── fitting.ts           # 3 functions
│       └── index.ts             # Re-exports
├── tests/
│   └── stats/                    # NEW
│       ├── descriptive.test.ts
│       ├── percentiles.test.ts
│       ├── intervals.test.ts
│       ├── risk.test.ts
│       └── fitting.test.ts
└── src/index.ts                 # Export stats module
```

---

## Documentation Plan

### 1. JSDoc Comments (Inline)

Every function gets:
```typescript
/**
 * Calculate the arithmetic mean of an array of numbers.
 *
 * @param data - Array of numeric values
 * @returns The arithmetic mean
 * @throws {Error} If array is empty or contains non-numeric values
 *
 * @example
 * ```typescript
 * mean([1, 2, 3, 4, 5]); // Returns 3
 * mean([10, 20, 30]); // Returns 20
 * ```
 */
export function mean(data: number[]): number {
  // implementation
}
```

### 2. STATISTICS_GUIDE.md

User-facing guide with:
- Overview of all functions
- When to use each function
- Code examples for common scenarios
- Interpretation guidelines
- Common pitfalls

### 3. README.md Updates

Add Sprint 4 completion status:
- 30+ statistical functions
- Total test count
- Coverage percentage

---

## Performance Targets

| Function Type | Array Size | Target Time |
|---------------|------------|-------------|
| Descriptive Stats | 10,000 | <1ms |
| Percentiles | 10,000 | <5ms (includes sort) |
| Confidence Intervals | 10,000 | <10ms |
| Bootstrap CI | 10,000 | <100ms (10k iterations) |
| Risk Metrics | 10,000 | <5ms |

**Optimization Notes:**
- Percentiles require sorting - use native `Array.sort()` for speed
- Bootstrap is intentionally slower (resampling)
- Consider caching for repeated calculations on same data

---

## Known Challenges

### 1. Mode Calculation
- Multiple modes possible (bimodal, multimodal)
- Return array of all modes
- Define "mode" threshold (frequency count)

### 2. Skewness & Kurtosis
- Multiple definitions exist
- Use Fisher's moment coefficient (standard)
- Document which formula is used

### 3. Percentile Interpolation
- Multiple methods (linear, nearest, etc.)
- Use linear interpolation (R's Type 7 - most common)
- Document the method

### 4. Bootstrap Convergence
- 10,000 iterations may not be enough for extreme quantiles
- Allow configurable iteration count
- Document convergence considerations

### 5. Small Sample Sizes
- Some statistics undefined for n < 2 or n < 3
- Throw descriptive errors
- Document minimum sample sizes

---

## References

### Statistical Formulas:
- Wikipedia: Descriptive Statistics
- NIST Engineering Statistics Handbook
- Numerical Recipes (Press et al.)

### Testing References:
- Compare against NumPy (Python) for validation
- R's stats package
- Excel's statistical functions (for compatibility)

---

## Next Sprint Preview

**Sprint 5: Simulation Engine** will use Sprint 4 functions:
- Calculate statistics on simulation results
- Display confidence intervals in output
- Show risk metrics (VaR, CVaR)
- Sensitivity analysis using correlations

**Sprint 4 is a prerequisite** - we can't analyze simulation results without these statistical functions!

---

## Ready to Start?

**Recommended Starting Point:**
1. Create directory structure
2. Start with `descriptive.ts` - most fundamental
3. Begin with `mean()` function - simplest
4. Build up from there

**First Command:**
```bash
mkdir -p packages/argo-core/src/stats
mkdir -p packages/argo-core/tests/stats
```

Let's begin! 🚀
