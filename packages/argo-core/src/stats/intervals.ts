/**
 * Confidence Intervals Module
 *
 * Provides functions for calculating confidence intervals and related statistics.
 * Supports both parametric (normal/t-distribution) and non-parametric (bootstrap) methods.
 */

import { mean, standardDeviation } from './descriptive';
import { percentile } from './percentiles';
import type { RandomNumberGenerator } from '../types/Distribution';

/**
 * Get critical value from standard normal distribution (z-value).
 *
 * @param confidence - Confidence level (0-1)
 * @returns The z-critical value
 */
function getZCritical(confidence: number): number {
  // Common z-values for confidence levels (two-tailed)
  const zTable: { [key: number]: number } = {
    0.80: 1.282,
    0.85: 1.440,
    0.90: 1.645,
    0.95: 1.960,
    0.98: 2.326,
    0.99: 2.576,
    0.995: 2.807,
    0.999: 3.291,
  };

  // Check if we have exact match (with tolerance for floating point)
  for (const conf of Object.keys(zTable).map(Number)) {
    if (Math.abs(confidence - conf) < 0.001) {
      return zTable[conf];
    }
  }

  // Find closest values for interpolation
  const confidenceLevels = Object.keys(zTable).map(Number).sort((a, b) => a - b);

  // Handle edge cases
  if (confidence <= confidenceLevels[0]) {
    return zTable[confidenceLevels[0]];
  }
  if (confidence >= confidenceLevels[confidenceLevels.length - 1]) {
    return zTable[confidenceLevels[confidenceLevels.length - 1]];
  }

  // Linear interpolation between closest values
  let lowerConf = confidenceLevels[0];
  let upperConf = confidenceLevels[confidenceLevels.length - 1];

  for (let i = 0; i < confidenceLevels.length - 1; i++) {
    if (confidence >= confidenceLevels[i] && confidence <= confidenceLevels[i + 1]) {
      lowerConf = confidenceLevels[i];
      upperConf = confidenceLevels[i + 1];
      break;
    }
  }

  const lowerZ = zTable[lowerConf];
  const upperZ = zTable[upperConf];
  const ratio = (confidence - lowerConf) / (upperConf - lowerConf);

  return lowerZ + ratio * (upperZ - lowerZ);
}

/**
 * Get critical value from t-distribution.
 *
 * @param df - Degrees of freedom
 * @param confidence - Confidence level (0-1)
 * @returns The t-critical value
 */
function getTCritical(df: number, confidence: number): number {
  // For large df (>30), t-distribution approximates normal
  if (df > 30) {
    return getZCritical(confidence);
  }

  // Table of t-critical values for common confidence levels and df
  // Two-tailed critical values
  const tTable: { [key: number]: { [key: number]: number } } = {
    1: { 0.9: 6.314, 0.95: 12.706, 0.99: 63.657 },
    2: { 0.9: 2.92, 0.95: 4.303, 0.99: 9.925 },
    3: { 0.9: 2.353, 0.95: 3.182, 0.99: 5.841 },
    4: { 0.9: 2.132, 0.95: 2.776, 0.99: 4.604 },
    5: { 0.9: 2.015, 0.95: 2.571, 0.99: 4.032 },
    6: { 0.9: 1.943, 0.95: 2.447, 0.99: 3.707 },
    7: { 0.9: 1.895, 0.95: 2.365, 0.99: 3.499 },
    8: { 0.9: 1.86, 0.95: 2.306, 0.99: 3.355 },
    9: { 0.9: 1.833, 0.95: 2.262, 0.99: 3.25 },
    10: { 0.9: 1.812, 0.95: 2.228, 0.99: 3.169 },
    15: { 0.9: 1.753, 0.95: 2.131, 0.99: 2.947 },
    20: { 0.9: 1.725, 0.95: 2.086, 0.99: 2.845 },
    25: { 0.9: 1.708, 0.95: 2.06, 0.99: 2.787 },
    30: { 0.9: 1.697, 0.95: 2.042, 0.99: 2.75 },
  };

  // Find closest df in table
  const availableDf = Object.keys(tTable).map(Number).sort((a, b) => a - b);
  let closestDf = availableDf[0];
  for (const tableDf of availableDf) {
    if (df >= tableDf) {
      closestDf = tableDf;
    }
  }

  // Get t-value for closest confidence level
  if (tTable[closestDf][confidence]) {
    return tTable[closestDf][confidence];
  }

  // Interpolate between 0.95 and 0.99 if needed
  if (confidence > 0.95) {
    const t95 = tTable[closestDf][0.95];
    const t99 = tTable[closestDf][0.99];
    const ratio = (confidence - 0.95) / (0.99 - 0.95);
    return t95 + ratio * (t99 - t95);
  }

  // Default to 0.95 for other cases
  return tTable[closestDf][0.95];
}

/**
 * Calculate confidence interval assuming normal distribution.
 *
 * Uses t-distribution for small samples (n < 30), normal for large samples.
 * Parametric method - assumes data is normally distributed.
 *
 * @param data - Array of numeric values
 * @param confidence - Confidence level (default 0.95)
 * @returns Object with lower, upper bounds and margin of error
 * @throws {Error} If data is invalid or confidence is out of range
 *
 * @example
 * ```typescript
 * confidenceIntervalNormal([1, 2, 3, 4, 5]); // 95% CI
 * // Returns { lower: 1.34, upper: 4.66, margin: 1.66 }
 *
 * confidenceIntervalNormal([1, 2, 3, 4, 5], 0.99); // 99% CI
 * // Returns wider interval
 * ```
 */
export function confidenceIntervalNormal(
  data: number[],
  confidence = 0.95
): { lower: number; upper: number; margin: number } {
  if (data.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  if (data.length < 2) {
    throw new Error('At least 2 values required for confidence interval');
  }

  if (confidence <= 0 || confidence >= 1) {
    throw new Error('Confidence level must be between 0 and 1');
  }

  const n = data.length;
  const sampleMean = mean(data);
  const sampleStd = standardDeviation(data, true); // Sample std dev
  const standardError = sampleStd / Math.sqrt(n);

  // Use t-distribution for small samples, normal for large
  const critical = n < 30 ? getTCritical(n - 1, confidence) : getZCritical(confidence);

  const margin = critical * standardError;

  return {
    lower: sampleMean - margin,
    upper: sampleMean + margin,
    margin: margin,
  };
}

/**
 * Calculate confidence interval using bootstrap resampling.
 *
 * Non-parametric method - makes no assumptions about data distribution.
 * More robust but computationally intensive.
 *
 * @param data - Array of numeric values
 * @param confidence - Confidence level (default 0.95)
 * @param iterations - Number of bootstrap samples (default 10000)
 * @param rng - Random number generator for reproducibility
 * @returns Object with lower and upper bounds
 * @throws {Error} If data is invalid or confidence is out of range
 *
 * @example
 * ```typescript
 * const rng = new SimpleRNG(12345);
 * confidenceIntervalBootstrap([1, 2, 3, 4, 5], 0.95, 10000, rng);
 * // Returns { lower: ~1.4, upper: ~4.6 }
 * ```
 */
export function confidenceIntervalBootstrap(
  data: number[],
  confidence = 0.95,
  iterations = 10000,
  rng: RandomNumberGenerator
): { lower: number; upper: number } {
  if (data.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  if (data.length < 2) {
    throw new Error('At least 2 values required for confidence interval');
  }

  if (confidence <= 0 || confidence >= 1) {
    throw new Error('Confidence level must be between 0 and 1');
  }

  const n = data.length;
  const bootstrapMeans: number[] = [];

  // Generate bootstrap samples
  for (let i = 0; i < iterations; i++) {
    // Resample with replacement
    const sample: number[] = [];
    for (let j = 0; j < n; j++) {
      const index = Math.floor(rng.next() * n);
      sample.push(data[index]);
    }

    // Calculate mean of bootstrap sample
    bootstrapMeans.push(mean(sample));
  }

  // Calculate percentiles for confidence interval
  const alpha = 1 - confidence;
  const lowerPercentile = (alpha / 2) * 100;
  const upperPercentile = (1 - alpha / 2) * 100;

  return {
    lower: percentile(bootstrapMeans, lowerPercentile),
    upper: percentile(bootstrapMeans, upperPercentile),
  };
}

/**
 * Calculate margin of error for a confidence interval.
 *
 * Margin of error is the half-width of the confidence interval.
 * It represents the maximum expected difference between the sample mean
 * and the true population mean.
 *
 * @param data - Array of numeric values
 * @param confidence - Confidence level (default 0.95)
 * @returns The margin of error
 * @throws {Error} If data is invalid or confidence is out of range
 *
 * @example
 * ```typescript
 * marginOfError([1, 2, 3, 4, 5]); // Returns ~1.66
 * marginOfError([1, 2, 3, 4, 5], 0.99); // Returns larger margin
 * ```
 */
export function marginOfError(data: number[], confidence = 0.95): number {
  const ci = confidenceIntervalNormal(data, confidence);
  return ci.margin;
}

/**
 * Calculate required sample size for desired margin of error.
 *
 * Determines how many samples are needed to achieve a specific
 * margin of error at a given confidence level.
 *
 * @param marginOfError - Desired margin of error
 * @param stdDev - Expected standard deviation
 * @param confidence - Confidence level (default 0.95)
 * @returns Required sample size (rounded up to integer)
 * @throws {Error} If parameters are invalid
 *
 * @example
 * ```typescript
 * sampleSize(1.0, 5.0, 0.95); // Returns 97
 * // Need 97 samples for margin ±1.0 with stdDev=5.0 at 95% confidence
 * ```
 */
export function sampleSize(
  marginOfError: number,
  stdDev: number,
  confidence = 0.95
): number {
  if (marginOfError <= 0) {
    throw new Error('Margin of error must be positive');
  }

  if (stdDev <= 0) {
    throw new Error('Standard deviation must be positive');
  }

  if (confidence <= 0 || confidence >= 1) {
    throw new Error('Confidence level must be between 0 and 1');
  }

  // Use z-critical value (assumes large sample)
  const z = getZCritical(confidence);

  // Formula: n = (z * σ / E)²
  // where E is margin of error, σ is standard deviation
  const n = Math.pow((z * stdDev) / marginOfError, 2);

  // Round up to next integer
  return Math.ceil(n);
}
