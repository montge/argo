/**
 * Descriptive Statistics Module
 *
 * Provides functions for calculating descriptive statistics on numeric data arrays.
 * Used for analyzing Monte Carlo simulation results.
 */

/**
 * Calculate the arithmetic mean (average) of an array of numbers.
 *
 * The arithmetic mean is the sum of all values divided by the count of values.
 *
 * @param data - Array of numeric values
 * @returns The arithmetic mean
 * @throws {Error} If array is empty
 *
 * @example
 * ```typescript
 * mean([1, 2, 3, 4, 5]); // Returns 3
 * mean([10, 20, 30]); // Returns 20
 * mean([-5, 0, 5]); // Returns 0
 * ```
 */
export function mean(data: number[]): number {
  if (data.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  const sum = data.reduce((acc, val) => acc + val, 0);
  return sum / data.length;
}

/**
 * Calculate the median (middle value) of an array of numbers.
 *
 * For odd-length arrays, returns the middle element.
 * For even-length arrays, returns the average of the two middle elements.
 *
 * @param data - Array of numeric values
 * @returns The median value
 * @throws {Error} If array is empty
 *
 * @example
 * ```typescript
 * median([1, 2, 3, 4, 5]); // Returns 3
 * median([1, 2, 3, 4]); // Returns 2.5
 * median([5, 1, 4, 2, 3]); // Returns 3 (unsorted input)
 * ```
 */
export function median(data: number[]): number {
  if (data.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  // Create sorted copy to avoid modifying original array
  const sorted = [...data].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    // Even length: average of two middle values
    return (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    // Odd length: middle value
    return sorted[mid];
  }
}

/**
 * Find the minimum value in an array of numbers.
 *
 * @param data - Array of numeric values
 * @returns The minimum value
 * @throws {Error} If array is empty
 *
 * @example
 * ```typescript
 * min([5, 2, 8, 1, 9]); // Returns 1
 * min([-5, -3, -10]); // Returns -10
 * ```
 */
export function min(data: number[]): number {
  if (data.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  return Math.min(...data);
}

/**
 * Find the maximum value in an array of numbers.
 *
 * @param data - Array of numeric values
 * @returns The maximum value
 * @throws {Error} If array is empty
 *
 * @example
 * ```typescript
 * max([5, 2, 8, 1, 9]); // Returns 9
 * max([-5, -3, -10]); // Returns -3
 * ```
 */
export function max(data: number[]): number {
  if (data.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  return Math.max(...data);
}

/**
 * Calculate the range (difference between max and min) of an array.
 *
 * @param data - Array of numeric values
 * @returns The range (max - min)
 * @throws {Error} If array is empty
 *
 * @example
 * ```typescript
 * range([1, 2, 3, 4, 5]); // Returns 4
 * range([-10, 0, 10]); // Returns 20
 * ```
 */
export function range(data: number[]): number {
  if (data.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  return max(data) - min(data);
}

/**
 * Calculate the variance of an array of numbers.
 *
 * By default calculates sample variance (using n-1 denominator).
 * Set sample=false for population variance (using n denominator).
 *
 * Variance measures how spread out the data is from the mean.
 *
 * @param data - Array of numeric values
 * @param sample - If true, calculates sample variance (default); if false, calculates population variance
 * @returns The variance
 * @throws {Error} If array is empty or has insufficient values for sample variance
 *
 * @example
 * ```typescript
 * variance([1, 2, 3, 4, 5]); // Returns 2.5 (sample variance)
 * variance([1, 2, 3, 4, 5], false); // Returns 2.0 (population variance)
 * variance([5, 5, 5]); // Returns 0 (no variation)
 * ```
 */
export function variance(data: number[], sample = true): number {
  if (data.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  if (sample && data.length < 2) {
    throw new Error('Sample variance requires at least 2 values');
  }

  const m = mean(data);
  const squaredDiffs = data.map((x) => Math.pow(x - m, 2));
  const sumSquaredDiffs = squaredDiffs.reduce((acc, val) => acc + val, 0);

  const denominator = sample ? data.length - 1 : data.length;
  return sumSquaredDiffs / denominator;
}

/**
 * Calculate the standard deviation of an array of numbers.
 *
 * By default calculates sample standard deviation (using n-1 denominator).
 * Set sample=false for population standard deviation (using n denominator).
 *
 * Standard deviation is the square root of variance and measures dispersion
 * in the same units as the original data.
 *
 * @param data - Array of numeric values
 * @param sample - If true, calculates sample std dev (default); if false, calculates population std dev
 * @returns The standard deviation
 * @throws {Error} If array is empty or has insufficient values for sample calculation
 *
 * @example
 * ```typescript
 * standardDeviation([1, 2, 3, 4, 5]); // Returns ~1.58 (sample std dev)
 * standardDeviation([1, 2, 3, 4, 5], false); // Returns ~1.41 (population std dev)
 * standardDeviation([5, 5, 5]); // Returns 0 (no variation)
 * ```
 */
export function standardDeviation(data: number[], sample = true): number {
  return Math.sqrt(variance(data, sample));
}

/**
 * Find the mode (most frequently occurring value(s)) in an array.
 *
 * Returns an array of values that appear most frequently.
 * If multiple values tie for highest frequency, all are returned (sorted).
 * If all values appear with equal frequency (all unique), returns empty array.
 *
 * @param data - Array of numeric values
 * @returns Array of mode values (sorted), or empty array if no mode exists
 * @throws {Error} If array is empty
 *
 * @example
 * ```typescript
 * mode([1, 2, 2, 3, 4]); // Returns [2]
 * mode([1, 2, 2, 3, 3, 4]); // Returns [2, 3] (bimodal)
 * mode([1, 2, 3, 4, 5]); // Returns [] (no mode - all unique)
 * mode([5, 5, 5]); // Returns [5]
 * ```
 */
export function mode(data: number[]): number[] {
  if (data.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  // Count frequency of each value
  const frequencyMap = new Map<number, number>();
  for (const value of data) {
    frequencyMap.set(value, (frequencyMap.get(value) || 0) + 1);
  }

  // Find maximum frequency
  let maxFrequency = 0;
  for (const frequency of frequencyMap.values()) {
    if (frequency > maxFrequency) {
      maxFrequency = frequency;
    }
  }

  // If all values appear once, no mode exists
  if (maxFrequency === 1) {
    return [];
  }

  // Collect all values with maximum frequency
  const modes: number[] = [];
  for (const [value, frequency] of frequencyMap.entries()) {
    if (frequency === maxFrequency) {
      modes.push(value);
    }
  }

  // Sort modes in ascending order
  return modes.sort((a, b) => a - b);
}

/**
 * Calculate the geometric mean of an array of positive numbers.
 *
 * The geometric mean is the nth root of the product of n values.
 * It is always less than or equal to the arithmetic mean.
 * Useful for growth rates, ratios, and multiplicative data.
 *
 * @param data - Array of positive numeric values
 * @returns The geometric mean
 * @throws {Error} If array is empty or contains non-positive values
 *
 * @example
 * ```typescript
 * geometricMean([1, 2, 3, 4]); // Returns ~2.213
 * geometricMean([4, 9]); // Returns 6 (sqrt of 36)
 * geometricMean([2, 8]); // Returns 4 (useful for average growth rate)
 * ```
 */
export function geometricMean(data: number[]): number {
  if (data.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  // Check for non-positive values
  for (const value of data) {
    if (value <= 0) {
      throw new Error('Geometric mean requires all positive values');
    }
  }

  // Calculate using logarithms to avoid overflow with large products
  const sumLogs = data.reduce((acc, val) => acc + Math.log(val), 0);
  return Math.exp(sumLogs / data.length);
}

/**
 * Calculate the harmonic mean of an array of positive numbers.
 *
 * The harmonic mean is the reciprocal of the arithmetic mean of reciprocals.
 * It is always less than or equal to the geometric mean.
 * Useful for rates, ratios, and averaging speeds.
 *
 * @param data - Array of positive numeric values
 * @returns The harmonic mean
 * @throws {Error} If array is empty or contains non-positive values
 *
 * @example
 * ```typescript
 * harmonicMean([1, 2, 4]); // Returns ~1.714
 * harmonicMean([2, 3]); // Returns 2.4
 * harmonicMean([60, 40]); // Returns 48 (useful for average speed)
 * ```
 */
export function harmonicMean(data: number[]): number {
  if (data.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  // Check for non-positive values
  for (const value of data) {
    if (value <= 0) {
      throw new Error('Harmonic mean requires all positive values');
    }
  }

  // Calculate sum of reciprocals
  const sumReciprocals = data.reduce((acc, val) => acc + 1 / val, 0);
  return data.length / sumReciprocals;
}

/**
 * Calculate the skewness of an array of numbers.
 *
 * Skewness measures the asymmetry of the distribution.
 * Uses Fisher's moment coefficient (sample skewness).
 *
 * - Skewness = 0: Symmetric distribution
 * - Skewness > 0: Right-skewed (tail extends to the right)
 * - Skewness < 0: Left-skewed (tail extends to the left)
 *
 * @param data - Array of numeric values
 * @returns The skewness coefficient
 * @throws {Error} If array is empty or has fewer than 3 values
 *
 * @example
 * ```typescript
 * skewness([1, 2, 3, 4, 5]); // Returns ~0 (symmetric)
 * skewness([1, 1, 1, 2, 3, 10]); // Returns positive (right-skewed)
 * skewness([1, 8, 9, 10, 10, 10]); // Returns negative (left-skewed)
 * ```
 */
export function skewness(data: number[]): number {
  if (data.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  if (data.length < 3) {
    throw new Error('Skewness requires at least 3 values');
  }

  const n = data.length;
  const m = mean(data);
  const sd = standardDeviation(data, true);

  // Handle zero variance case
  if (sd === 0) {
    return 0;
  }

  // Calculate third moment (cubed deviations from mean)
  const cubedDeviations = data.map((x) => Math.pow((x - m) / sd, 3));
  const sumCubedDeviations = cubedDeviations.reduce((acc, val) => acc + val, 0);

  // Apply bias correction for sample skewness
  const adjustment = (n / ((n - 1) * (n - 2)));
  return adjustment * sumCubedDeviations;
}

/**
 * Calculate the kurtosis of an array of numbers.
 *
 * Kurtosis measures the "tailedness" of the distribution.
 * Uses Fisher's definition (excess kurtosis = kurtosis - 3).
 *
 * - Kurtosis = 0: Normal distribution (mesokurtic)
 * - Kurtosis > 0: Heavy tails (leptokurtic) - more outliers
 * - Kurtosis < 0: Light tails (platykurtic) - fewer outliers
 *
 * @param data - Array of numeric values
 * @returns The excess kurtosis coefficient
 * @throws {Error} If array is empty or has fewer than 4 values
 *
 * @example
 * ```typescript
 * kurtosis([1, 2, 3, 4, 5]); // Returns negative (uniform-like)
 * kurtosis([1, 1, 5, 5, 5, 9, 9]); // Returns positive (heavy tails)
 * ```
 */
export function kurtosis(data: number[]): number {
  if (data.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  if (data.length < 4) {
    throw new Error('Kurtosis requires at least 4 values');
  }

  const n = data.length;
  const m = mean(data);
  const sd = standardDeviation(data, true);

  // Handle zero variance case
  if (sd === 0) {
    return 0;
  }

  // Calculate fourth moment (fourth power deviations from mean)
  const fourthPowerDeviations = data.map((x) => Math.pow((x - m) / sd, 4));
  const sumFourthPowerDeviations = fourthPowerDeviations.reduce((acc, val) => acc + val, 0);

  // Apply bias correction for sample kurtosis
  const adjustment = ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3)));
  const correction = (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));

  // Return excess kurtosis (Fisher's definition: kurtosis - 3)
  return adjustment * sumFourthPowerDeviations - correction;
}
