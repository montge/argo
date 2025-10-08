/**
 * Risk Metrics Module
 *
 * Provides functions for risk analysis in Monte Carlo simulations.
 * Includes VaR, CVaR, and probability calculations for risk assessment.
 */

import { percentile } from './percentiles';
import { mean } from './descriptive';

/**
 * Calculate Value at Risk (VaR) at a given confidence level.
 *
 * VaR represents the threshold value such that the probability of a loss
 * greater than VaR is (1 - confidence). For example, 95% VaR is the value
 * that will be exceeded in only 5% of scenarios (worst 5%).
 *
 * @param data - Array of numeric values (simulation results)
 * @param confidence - Confidence level (default 0.95 for 95% VaR)
 * @returns The VaR threshold value
 * @throws {Error} If data is invalid or confidence is out of range
 *
 * @example
 * ```typescript
 * const returns = [-10, -5, 0, 5, 10, 15, 20];
 * valueAtRisk(returns, 0.95); // Returns -5 (worst 5% threshold)
 * ```
 */
export function valueAtRisk(data: number[], confidence = 0.95): number {
  if (data.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  if (data.length < 2) {
    throw new Error('At least 2 values required for VaR calculation');
  }

  if (confidence <= 0 || confidence >= 1) {
    throw new Error('Confidence level must be between 0 and 1');
  }

  // VaR at confidence level is the (1 - confidence) percentile
  // E.g., 95% VaR looks at the 5th percentile (worst 5%)
  const alpha = 1 - confidence;
  return percentile(data, alpha * 100);
}

/**
 * Calculate Conditional Value at Risk (CVaR), also known as Expected Shortfall.
 *
 * CVaR is the expected value of losses beyond the VaR threshold.
 * It provides a more complete picture of tail risk than VaR alone.
 * CVaR is always <= VaR (more conservative).
 *
 * @param data - Array of numeric values (simulation results)
 * @param confidence - Confidence level (default 0.95 for 95% CVaR)
 * @returns The CVaR value (expected loss in worst scenarios)
 * @throws {Error} If data is invalid or confidence is out of range
 *
 * @example
 * ```typescript
 * const returns = [-10, -5, 0, 5, 10, 15, 20];
 * conditionalVaR(returns, 0.95); // Mean of worst 5% = -10
 * ```
 */
export function conditionalVaR(data: number[], confidence = 0.95): number {
  if (data.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  if (data.length < 2) {
    throw new Error('At least 2 values required for CVaR calculation');
  }

  if (confidence <= 0 || confidence >= 1) {
    throw new Error('Confidence level must be between 0 and 1');
  }

  // Calculate VaR threshold
  const varThreshold = valueAtRisk(data, confidence);

  // CVaR is the mean of all values at or below VaR
  const tailValues = data.filter((x) => x <= varThreshold);

  if (tailValues.length === 0) {
    // If no values below VaR, return VaR itself
    return varThreshold;
  }

  return mean(tailValues);
}

/**
 * Calculate probability that a value exceeds a given threshold.
 *
 * Returns P(X > threshold) based on empirical distribution.
 * Useful for risk assessment: "What's the probability of exceeding target cost?"
 *
 * @param data - Array of numeric values (simulation results)
 * @param threshold - Threshold value to compare against
 * @returns Probability (0-1) of exceeding threshold
 * @throws {Error} If data is empty
 *
 * @example
 * ```typescript
 * const costs = [100, 110, 120, 130, 140];
 * probabilityExceeding(costs, 125); // Returns 0.4 (40% exceed 125)
 * ```
 */
export function probabilityExceeding(data: number[], threshold: number): number {
  if (data.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  const exceedingCount = data.filter((x) => x > threshold).length;
  return exceedingCount / data.length;
}

/**
 * Calculate probability that a value is below a given threshold.
 *
 * Returns P(X < threshold) based on empirical distribution.
 * Useful for opportunity assessment: "What's the probability of being under budget?"
 *
 * @param data - Array of numeric values (simulation results)
 * @param threshold - Threshold value to compare against
 * @returns Probability (0-1) of being below threshold
 * @throws {Error} If data is empty
 *
 * @example
 * ```typescript
 * const costs = [100, 110, 120, 130, 140];
 * probabilityBelow(costs, 125); // Returns 0.6 (60% below 125)
 * ```
 */
export function probabilityBelow(data: number[], threshold: number): number {
  if (data.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  const belowCount = data.filter((x) => x < threshold).length;
  return belowCount / data.length;
}

/**
 * Calculate probability that a value falls within a range [lower, upper].
 *
 * Returns P(lower <= X <= upper) based on empirical distribution.
 * Useful for range-based risk assessment: "What's the probability of staying within budget range?"
 *
 * @param data - Array of numeric values (simulation results)
 * @param lower - Lower bound (inclusive)
 * @param upper - Upper bound (inclusive)
 * @returns Probability (0-1) of being in range
 * @throws {Error} If data is empty or lower > upper
 *
 * @example
 * ```typescript
 * const costs = [100, 110, 120, 130, 140];
 * probabilityBetween(costs, 110, 130); // Returns 0.6 (60% in range)
 * ```
 */
export function probabilityBetween(data: number[], lower: number, upper: number): number {
  if (data.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  if (lower > upper) {
    throw new Error('Lower bound must be <= upper bound');
  }

  const inRangeCount = data.filter((x) => x >= lower && x <= upper).length;
  return inRangeCount / data.length;
}

/**
 * Calculate probability of hitting a target value within a tolerance.
 *
 * Returns P(|X - target| <= tolerance) based on empirical distribution.
 * Useful for target-based planning: "What's the probability of meeting schedule within 1 week?"
 *
 * @param data - Array of numeric values (simulation results)
 * @param target - Target value to hit
 * @param tolerance - Acceptable deviation from target (default 0 for exact match)
 * @returns Probability (0-1) of hitting target within tolerance
 * @throws {Error} If data is empty or tolerance is negative
 *
 * @example
 * ```typescript
 * const durations = [8, 9, 10, 11, 12];
 * probabilityOfTarget(durations, 10, 1); // Returns 0.6 (60% within 10±1)
 * ```
 */
export function probabilityOfTarget(data: number[], target: number, tolerance = 0): number {
  if (data.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  if (tolerance < 0) {
    throw new Error('Tolerance must be non-negative');
  }

  // Target within tolerance is equivalent to [target - tolerance, target + tolerance]
  return probabilityBetween(data, target - tolerance, target + tolerance);
}
