/**
 * Percentiles & Quantiles Module
 *
 * Provides functions for calculating percentiles and quantiles of numeric data.
 * Uses linear interpolation method (R's Type 7 - most common).
 */

/**
 * Calculate a specific percentile of an array of numbers.
 *
 * Uses linear interpolation (R's Type 7 quantile method, most common).
 * Percentile is a value below which a given percentage of observations fall.
 *
 * @param data - Array of numeric values
 * @param p - Percentile to calculate (0-100)
 * @returns The percentile value
 * @throws {Error} If array is empty or percentile is out of range
 *
 * @example
 * ```typescript
 * percentile([1, 2, 3, 4, 5], 50); // Returns 3 (median)
 * percentile([1, 2, 3, 4, 5], 25); // Returns 2 (first quartile)
 * percentile([1, 2, 3, 4, 5], 75); // Returns 4 (third quartile)
 * ```
 */
export function percentile(data: number[], p: number): number {
  if (data.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  if (p < 0 || p > 100) {
    throw new Error('Percentile must be between 0 and 100');
  }

  // Sort data (create copy to avoid modifying original)
  const sorted = [...data].sort((a, b) => a - b);
  const n = sorted.length;

  // Handle edge cases
  if (p === 0) return sorted[0];
  if (p === 100) return sorted[n - 1];

  // Convert percentile to position using linear interpolation (R Type 7)
  // Position = (n - 1) * (p / 100)
  const position = ((n - 1) * p) / 100;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);

  // If position is exactly an integer, return that element
  if (lower === upper) {
    return sorted[lower];
  }

  // Linear interpolation between lower and upper
  const fraction = position - lower;
  return sorted[lower] + fraction * (sorted[upper] - sorted[lower]);
}

/**
 * Calculate a quantile (percentile expressed as proportion 0-1).
 *
 * Quantile is equivalent to percentile but uses 0-1 scale instead of 0-100.
 * For example, 0.5 quantile = 50th percentile.
 *
 * @param data - Array of numeric values
 * @param q - Quantile to calculate (0-1)
 * @returns The quantile value
 * @throws {Error} If array is empty or quantile is out of range
 *
 * @example
 * ```typescript
 * quantile([1, 2, 3, 4, 5], 0.5); // Returns 3 (median)
 * quantile([1, 2, 3, 4, 5], 0.25); // Returns 2 (first quartile)
 * quantile([1, 2, 3, 4, 5], 0.75); // Returns 4 (third quartile)
 * ```
 */
export function quantile(data: number[], q: number): number {
  if (q < 0 || q > 1) {
    throw new Error('Quantile must be between 0 and 1');
  }

  return percentile(data, q * 100);
}

/**
 * Calculate the three quartiles (Q1, Q2, Q3) of an array.
 *
 * - Q1 (25th percentile): First quartile
 * - Q2 (50th percentile): Second quartile (median)
 * - Q3 (75th percentile): Third quartile
 *
 * @param data - Array of numeric values
 * @returns Object with q1, q2, and q3 values
 * @throws {Error} If array is empty
 *
 * @example
 * ```typescript
 * quartiles([1, 2, 3, 4, 5]); // Returns { q1: 2, q2: 3, q3: 4 }
 * quartiles([1, 2, 3, 4, 5, 6, 7, 8]); // Returns { q1: 2.75, q2: 4.5, q3: 6.25 }
 * ```
 */
export function quartiles(data: number[]): { q1: number; q2: number; q3: number } {
  if (data.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  return {
    q1: percentile(data, 25),
    q2: percentile(data, 50),
    q3: percentile(data, 75),
  };
}

/**
 * Calculate the interquartile range (IQR) of an array.
 *
 * IQR = Q3 - Q1
 * The IQR represents the range of the middle 50% of the data.
 * It is a robust measure of statistical dispersion.
 *
 * @param data - Array of numeric values
 * @returns The interquartile range (Q3 - Q1)
 * @throws {Error} If array is empty
 *
 * @example
 * ```typescript
 * iqr([1, 2, 3, 4, 5]); // Returns ~2
 * iqr([1, 2, 3, 4, 5, 6, 7, 8]); // Returns 3.5 (6.25 - 2.75)
 * ```
 */
export function iqr(data: number[]): number {
  if (data.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  const q = quartiles(data);
  return q.q3 - q.q1;
}

/**
 * Calculate multiple percentiles at once.
 *
 * More efficient than calling percentile() multiple times when you need
 * several percentiles of the same dataset (sorts data only once).
 *
 * @param data - Array of numeric values
 * @param ps - Array of percentiles to calculate (0-100)
 * @returns Array of percentile values in same order as ps
 * @throws {Error} If data array is empty or any percentile is out of range
 *
 * @example
 * ```typescript
 * percentiles([1, 2, 3, 4, 5], [25, 50, 75]); // Returns [2, 3, 4]
 * percentiles([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [10, 90]); // Returns [1.9, 9.1]
 * ```
 */
export function percentiles(data: number[], ps: number[]): number[] {
  if (data.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  // Validate all percentiles first
  for (const p of ps) {
    if (p < 0 || p > 100) {
      throw new Error('Percentile must be between 0 and 100');
    }
  }

  // Sort data once
  const sorted = [...data].sort((a, b) => a - b);
  const n = sorted.length;

  // Calculate each percentile
  return ps.map((p) => {
    // Handle edge cases
    if (p === 0) return sorted[0];
    if (p === 100) return sorted[n - 1];

    // Linear interpolation (R Type 7)
    const position = ((n - 1) * p) / 100;
    const lower = Math.floor(position);
    const upper = Math.ceil(position);

    if (lower === upper) {
      return sorted[lower];
    }

    const fraction = position - lower;
    return sorted[lower] + fraction * (sorted[upper] - sorted[lower]);
  });
}
