/**
 * Distribution Fitting Module
 *
 * Provides functions for fitting probability distributions to empirical data
 * using Maximum Likelihood Estimation (MLE) and assessing goodness of fit.
 */

import { mean, standardDeviation } from './descriptive';
import type { Distribution, RandomNumberGenerator } from '../types/Distribution';

/**
 * Fit a normal distribution to data using Maximum Likelihood Estimation.
 *
 * Returns the MLE estimates for μ (mean) and σ (standard deviation).
 * For normal distribution, MLE estimates are:
 * - μ = sample mean
 * - σ = sample standard deviation
 *
 * @param data - Array of numeric values to fit
 * @returns Object with mu (mean) and sigma (std dev) parameters
 * @throws {Error} If data is invalid
 *
 * @example
 * ```typescript
 * const data = [8, 9, 10, 11, 12];
 * const params = fitNormal(data);
 * // Returns { mu: 10, sigma: 1.58 }
 *
 * // Use fitted parameters to create distribution
 * const dist = new NormalDistribution(params.mu, params.sigma);
 * ```
 */
export function fitNormal(data: number[]): { mu: number; sigma: number } {
  if (data.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  if (data.length < 2) {
    throw new Error('At least 2 values required for distribution fitting');
  }

  // MLE estimators for normal distribution
  const mu = mean(data);
  const sigma = standardDeviation(data, true); // Sample std dev

  return { mu, sigma };
}

/**
 * Fit a log-normal distribution to data using Maximum Likelihood Estimation.
 *
 * Returns the MLE estimates for μ and σ (parameters of the underlying normal
 * distribution of log-transformed data). For log-normal distribution:
 * - μ = mean of log(data)
 * - σ = standard deviation of log(data)
 *
 * @param data - Array of positive numeric values to fit
 * @returns Object with mu and sigma parameters
 * @throws {Error} If data is invalid or contains non-positive values
 *
 * @example
 * ```typescript
 * const data = [1, 2, 3, 5, 8, 13];
 * const params = fitLogNormal(data);
 * // Returns { mu: ~1.46, sigma: ~0.87 }
 *
 * // Use fitted parameters to create distribution
 * const dist = new LogNormalDistribution(params.mu, params.sigma);
 * ```
 */
export function fitLogNormal(data: number[]): { mu: number; sigma: number } {
  if (data.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  if (data.length < 2) {
    throw new Error('At least 2 values required for distribution fitting');
  }

  // Check that all values are positive
  if (data.some((x) => x <= 0)) {
    throw new Error('All values must be positive for log-normal fitting');
  }

  // Log-normal MLE: fit normal distribution to log-transformed data
  const logData = data.map((x) => Math.log(x));
  const mu = mean(logData);
  const sigma = standardDeviation(logData, true);

  return { mu, sigma };
}

/**
 * Assess goodness of fit using Kolmogorov-Smirnov test.
 *
 * Calculates the KS statistic (maximum difference between empirical and
 * theoretical CDFs) and estimates p-value using bootstrap resampling.
 *
 * **Interpretation:**
 * - KS statistic: 0 = perfect fit, 1 = worst fit
 * - p-value > 0.05: Good fit (fail to reject null hypothesis)
 * - p-value < 0.05: Poor fit (reject null hypothesis)
 *
 * @param data - Array of numeric values (empirical data)
 * @param distribution - Fitted distribution to test against
 * @param rng - Random number generator for bootstrap
 * @param bootstrapIterations - Number of bootstrap samples (default 1000)
 * @returns Object with ksStatistic and pValue
 * @throws {Error} If data is invalid
 *
 * @example
 * ```typescript
 * const data = [1, 2, 3, 4, 5];
 * const params = fitNormal(data);
 * const dist = new NormalDistribution(params.mu, params.sigma);
 * const rng = new SimpleRNG(12345);
 *
 * const gof = goodnessOfFit(data, dist, rng);
 * console.log(`KS statistic: ${gof.ksStatistic}`);
 * console.log(`p-value: ${gof.pValue}`);
 *
 * if (gof.pValue > 0.05) {
 *   console.log('Good fit!');
 * } else {
 *   console.log('Poor fit - consider different distribution');
 * }
 * ```
 */
export function goodnessOfFit(
  data: number[],
  distribution: Distribution,
  rng: RandomNumberGenerator,
  bootstrapIterations = 1000
): { ksStatistic: number; pValue: number } {
  if (data.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  if (data.length < 2) {
    throw new Error('At least 2 values required for goodness of fit test');
  }

  // Calculate KS statistic for observed data
  const ksObserved = calculateKSStatistic(data, distribution);

  // Bootstrap to estimate p-value
  let exceedCount = 0;
  const n = data.length;

  for (let i = 0; i < bootstrapIterations; i++) {
    // Generate bootstrap sample from fitted distribution
    const bootstrapSample = Array.from({ length: n }, () => distribution.sample(rng));

    // Calculate KS statistic for bootstrap sample
    const ksBootstrap = calculateKSStatistic(bootstrapSample, distribution);

    // Count how many bootstrap samples have KS >= observed KS
    if (ksBootstrap >= ksObserved) {
      exceedCount++;
    }
  }

  // p-value is proportion of bootstrap samples with KS >= observed
  const pValue = exceedCount / bootstrapIterations;

  return {
    ksStatistic: ksObserved,
    pValue: pValue,
  };
}

/**
 * Calculate Kolmogorov-Smirnov statistic.
 *
 * KS statistic is the maximum absolute difference between the empirical
 * cumulative distribution function (ECDF) and the theoretical CDF.
 *
 * @param data - Empirical data
 * @param distribution - Theoretical distribution
 * @returns KS statistic (0-1)
 */
function calculateKSStatistic(data: number[], distribution: Distribution): number {
  // Sort data for ECDF calculation
  const sorted = [...data].sort((a, b) => a - b);
  const n = sorted.length;

  let maxDiff = 0;

  for (let i = 0; i < n; i++) {
    const x = sorted[i];

    // Empirical CDF at x: (i + 1) / n
    const ecdf = (i + 1) / n;

    // Theoretical CDF at x
    const theoreticalCDF = distribution.cdf(x);

    // Calculate difference
    const diff = Math.abs(ecdf - theoreticalCDF);

    // Also check difference at previous step (step function)
    const ecdfPrev = i / n;
    const diffPrev = Math.abs(ecdfPrev - theoreticalCDF);

    maxDiff = Math.max(maxDiff, diff, diffPrev);
  }

  return maxDiff;
}
