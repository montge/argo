import {
  percentile,
  quantile,
  quartiles,
  iqr,
  percentiles,
} from '../../src/stats/percentiles';

describe('Percentiles & Quantiles', () => {
  describe('percentile', () => {
    it('should calculate 50th percentile (median)', () => {
      expect(percentile([1, 2, 3, 4, 5], 50)).toBe(3);
    });

    it('should calculate 25th percentile', () => {
      expect(percentile([1, 2, 3, 4, 5, 6, 7, 8], 25)).toBeCloseTo(2.75, 2);
    });

    it('should calculate 75th percentile', () => {
      expect(percentile([1, 2, 3, 4, 5, 6, 7, 8], 75)).toBeCloseTo(6.25, 2);
    });

    it('should calculate 90th percentile', () => {
      expect(percentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 90)).toBeCloseTo(9.1, 1);
    });

    it('should calculate 95th percentile', () => {
      expect(percentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 95)).toBeCloseTo(9.55, 2);
    });

    it('should handle 0th percentile (minimum)', () => {
      expect(percentile([1, 2, 3, 4, 5], 0)).toBe(1);
    });

    it('should handle 100th percentile (maximum)', () => {
      expect(percentile([1, 2, 3, 4, 5], 100)).toBe(5);
    });

    it('should handle unsorted data', () => {
      expect(percentile([5, 1, 4, 2, 3], 50)).toBe(3);
    });

    it('should handle single element', () => {
      expect(percentile([42], 50)).toBe(42);
    });

    it('should handle two elements', () => {
      expect(percentile([10, 20], 50)).toBe(15);
    });

    it('should throw error for empty array', () => {
      expect(() => percentile([], 50)).toThrow('Data array cannot be empty');
    });

    it('should throw error for percentile < 0', () => {
      expect(() => percentile([1, 2, 3], -1)).toThrow('Percentile must be between 0 and 100');
    });

    it('should throw error for percentile > 100', () => {
      expect(() => percentile([1, 2, 3], 101)).toThrow('Percentile must be between 0 and 100');
    });

    it('should handle decimals', () => {
      expect(percentile([1.5, 2.5, 3.5, 4.5, 5.5], 50)).toBe(3.5);
    });

    it('should handle negative numbers', () => {
      expect(percentile([-5, -3, -1, 0, 1, 3, 5], 50)).toBe(0);
    });

    it('should use linear interpolation', () => {
      // R's Type 7 quantile method (most common)
      const data = [1, 2, 3, 4];
      const p75 = percentile(data, 75);
      expect(p75).toBeCloseTo(3.25, 2);
    });

    it('should not modify original array', () => {
      const data = [5, 1, 4, 2, 3];
      percentile(data, 50);
      expect(data).toEqual([5, 1, 4, 2, 3]);
    });
  });

  describe('quantile', () => {
    it('should be alias for percentile with proportion', () => {
      const data = [1, 2, 3, 4, 5];
      expect(quantile(data, 0.5)).toBe(percentile(data, 50));
    });

    it('should handle 0.25 quantile', () => {
      expect(quantile([1, 2, 3, 4, 5, 6, 7, 8], 0.25)).toBeCloseTo(2.75, 2);
    });

    it('should handle 0.75 quantile', () => {
      expect(quantile([1, 2, 3, 4, 5, 6, 7, 8], 0.75)).toBeCloseTo(6.25, 2);
    });

    it('should throw error for q < 0', () => {
      expect(() => quantile([1, 2, 3], -0.1)).toThrow('Quantile must be between 0 and 1');
    });

    it('should throw error for q > 1', () => {
      expect(() => quantile([1, 2, 3], 1.1)).toThrow('Quantile must be between 0 and 1');
    });

    it('should handle q = 0 (minimum)', () => {
      expect(quantile([1, 2, 3, 4, 5], 0)).toBe(1);
    });

    it('should handle q = 1 (maximum)', () => {
      expect(quantile([1, 2, 3, 4, 5], 1)).toBe(5);
    });

    it('should throw error for empty array', () => {
      expect(() => quantile([], 0.5)).toThrow('Data array cannot be empty');
    });
  });

  describe('quartiles', () => {
    it('should calculate all three quartiles', () => {
      const result = quartiles([1, 2, 3, 4, 5, 6, 7, 8]);
      expect(result.q1).toBeCloseTo(2.75, 2);
      expect(result.q2).toBeCloseTo(4.5, 2);
      expect(result.q3).toBeCloseTo(6.25, 2);
    });

    it('should handle simple dataset', () => {
      const result = quartiles([1, 2, 3, 4, 5]);
      expect(result.q1).toBeCloseTo(2, 1);
      expect(result.q2).toBe(3);
      expect(result.q3).toBeCloseTo(4, 1);
    });

    it('should handle unsorted data', () => {
      const result = quartiles([5, 1, 4, 2, 3]);
      expect(result.q2).toBe(3);
    });

    it('should throw error for empty array', () => {
      expect(() => quartiles([])).toThrow('Data array cannot be empty');
    });

    it('should handle single element', () => {
      const result = quartiles([42]);
      expect(result.q1).toBe(42);
      expect(result.q2).toBe(42);
      expect(result.q3).toBe(42);
    });

    it('should handle two elements', () => {
      const result = quartiles([10, 20]);
      expect(result.q1).toBeCloseTo(12.5, 1);
      expect(result.q2).toBe(15);
      expect(result.q3).toBeCloseTo(17.5, 1);
    });

    it('should handle negative numbers', () => {
      const result = quartiles([-5, -3, -1, 0, 1, 3, 5]);
      expect(result.q1).toBeCloseTo(-2, 1);
      expect(result.q2).toBe(0);
      expect(result.q3).toBeCloseTo(2, 1);
    });

    it('should return quartiles in order q1 < q2 < q3', () => {
      const result = quartiles([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      expect(result.q1).toBeLessThan(result.q2);
      expect(result.q2).toBeLessThan(result.q3);
    });
  });

  describe('iqr', () => {
    it('should calculate interquartile range', () => {
      // For [1,2,3,4,5,6,7,8]: Q1=2.75, Q3=6.25, IQR=3.5
      expect(iqr([1, 2, 3, 4, 5, 6, 7, 8])).toBeCloseTo(3.5, 2);
    });

    it('should handle simple dataset', () => {
      // For [1,2,3,4,5]: Q1≈2, Q3≈4, IQR≈2
      expect(iqr([1, 2, 3, 4, 5])).toBeCloseTo(2, 1);
    });

    it('should handle unsorted data', () => {
      expect(iqr([5, 1, 4, 2, 3])).toBeCloseTo(2, 1);
    });

    it('should return 0 for all same values', () => {
      expect(iqr([5, 5, 5, 5])).toBe(0);
    });

    it('should throw error for empty array', () => {
      expect(() => iqr([])).toThrow('Data array cannot be empty');
    });

    it('should handle single element (IQR = 0)', () => {
      expect(iqr([42])).toBe(0);
    });

    it('should handle negative numbers', () => {
      const result = iqr([-5, -3, -1, 0, 1, 3, 5]);
      expect(result).toBeCloseTo(4, 1);
    });

    it('should handle decimals', () => {
      expect(iqr([1.5, 2.5, 3.5, 4.5, 5.5])).toBeCloseTo(2, 1);
    });

    it('should be non-negative', () => {
      expect(iqr([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toBeGreaterThanOrEqual(0);
    });
  });

  describe('percentiles (batch)', () => {
    it('should calculate multiple percentiles at once', () => {
      const result = percentiles([1, 2, 3, 4, 5], [25, 50, 75]);
      expect(result).toHaveLength(3);
      expect(result[0]).toBeCloseTo(2, 1);
      expect(result[1]).toBe(3);
      expect(result[2]).toBeCloseTo(4, 1);
    });

    it('should handle common percentiles', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = percentiles(data, [10, 25, 50, 75, 90]);
      expect(result).toHaveLength(5);
      expect(result[0]).toBeCloseTo(1.9, 1); // P10
      expect(result[1]).toBeCloseTo(3.25, 2); // P25
      expect(result[2]).toBeCloseTo(5.5, 1); // P50
      expect(result[3]).toBeCloseTo(7.75, 2); // P75
      expect(result[4]).toBeCloseTo(9.1, 1); // P90
    });

    it('should handle empty percentiles array', () => {
      expect(percentiles([1, 2, 3], [])).toEqual([]);
    });

    it('should handle single percentile', () => {
      const result = percentiles([1, 2, 3, 4, 5], [50]);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(3);
    });

    it('should throw error for empty data array', () => {
      expect(() => percentiles([], [50])).toThrow('Data array cannot be empty');
    });

    it('should throw error for invalid percentile in array', () => {
      expect(() => percentiles([1, 2, 3], [50, 101])).toThrow('Percentile must be between 0 and 100');
    });

    it('should handle unsorted percentiles', () => {
      const result = percentiles([1, 2, 3, 4, 5], [75, 25, 50]);
      expect(result).toHaveLength(3);
      expect(result[0]).toBeCloseTo(4, 1); // 75th
      expect(result[1]).toBeCloseTo(2, 1); // 25th
      expect(result[2]).toBe(3); // 50th
    });

    it('should handle edge percentiles', () => {
      const result = percentiles([1, 2, 3, 4, 5], [0, 100]);
      expect(result[0]).toBe(1);
      expect(result[1]).toBe(5);
    });

    it('should handle decimals', () => {
      const result = percentiles([1.5, 2.5, 3.5, 4.5, 5.5], [25, 50, 75]);
      expect(result[0]).toBeCloseTo(2.5, 1);
      expect(result[1]).toBe(3.5);
      expect(result[2]).toBeCloseTo(4.5, 1);
    });
  });
});
