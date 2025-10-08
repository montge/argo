import {
  confidenceIntervalNormal,
  confidenceIntervalBootstrap,
  marginOfError,
  sampleSize,
} from '../../src/stats/intervals';
import { SimpleRNG } from '../../src/utils/SimpleRNG';

describe('Confidence Intervals', () => {
  describe('confidenceIntervalNormal', () => {
    it('should calculate 95% confidence interval', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = confidenceIntervalNormal(data);

      expect(result).toHaveProperty('lower');
      expect(result).toHaveProperty('upper');
      expect(result).toHaveProperty('margin');
      expect(result.lower).toBeLessThan(result.upper);
      expect(result.margin).toBeGreaterThan(0);
    });

    it('should calculate 90% confidence interval', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = confidenceIntervalNormal(data, 0.90);

      expect(result.lower).toBeLessThan(result.upper);
      expect(result.margin).toBeGreaterThan(0);
    });

    it('should calculate 99% confidence interval', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = confidenceIntervalNormal(data, 0.99);

      // 99% CI should be wider than 95% CI
      const result95 = confidenceIntervalNormal(data, 0.95);
      expect(result.margin).toBeGreaterThan(result95.margin);
    });

    it('should center interval around mean', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = confidenceIntervalNormal(data);
      const mean = 5.5;

      expect((result.lower + result.upper) / 2).toBeCloseTo(mean, 5);
    });

    it('should handle small samples (use t-distribution)', () => {
      const data = [1, 2, 3, 4, 5];
      const result = confidenceIntervalNormal(data);

      expect(result.lower).toBeLessThan(3);
      expect(result.upper).toBeGreaterThan(3);
    });

    it('should handle large samples', () => {
      const data = Array.from({ length: 100 }, (_, i) => i + 1);
      const result = confidenceIntervalNormal(data);

      expect(result.lower).toBeLessThan(50.5);
      expect(result.upper).toBeGreaterThan(50.5);
    });

    it('should throw error for empty array', () => {
      expect(() => confidenceIntervalNormal([])).toThrow('Data array cannot be empty');
    });

    it('should throw error for single value', () => {
      expect(() => confidenceIntervalNormal([42])).toThrow('At least 2 values required');
    });

    it('should throw error for confidence < 0', () => {
      expect(() => confidenceIntervalNormal([1, 2, 3], -0.1)).toThrow('Confidence level must be between 0 and 1');
    });

    it('should throw error for confidence > 1', () => {
      expect(() => confidenceIntervalNormal([1, 2, 3], 1.1)).toThrow('Confidence level must be between 0 and 1');
    });

    it('should handle negative numbers', () => {
      const data = [-5, -3, -1, 0, 1, 3, 5];
      const result = confidenceIntervalNormal(data);

      expect(result.lower).toBeLessThan(0);
      expect(result.upper).toBeGreaterThan(0);
    });

    it('should handle decimals', () => {
      const data = [1.5, 2.5, 3.5, 4.5, 5.5];
      const result = confidenceIntervalNormal(data);

      expect(result.lower).toBeLessThan(3.5);
      expect(result.upper).toBeGreaterThan(3.5);
    });

    it('should verify margin equals half the interval width', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = confidenceIntervalNormal(data);
      const width = result.upper - result.lower;

      expect(result.margin).toBeCloseTo(width / 2, 10);
    });
  });

  describe('confidenceIntervalBootstrap', () => {
    it('should calculate 95% bootstrap confidence interval', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const rng = new SimpleRNG(12345);
      const result = confidenceIntervalBootstrap(data, 0.95, 1000, rng);

      expect(result).toHaveProperty('lower');
      expect(result).toHaveProperty('upper');
      expect(result.lower).toBeLessThan(result.upper);
    });

    it('should produce reproducible results with same seed', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const rng1 = new SimpleRNG(12345);
      const rng2 = new SimpleRNG(12345);

      const result1 = confidenceIntervalBootstrap(data, 0.95, 1000, rng1);
      const result2 = confidenceIntervalBootstrap(data, 0.95, 1000, rng2);

      expect(result1.lower).toBeCloseTo(result2.lower, 5);
      expect(result1.upper).toBeCloseTo(result2.upper, 5);
    });

    it('should calculate 90% bootstrap confidence interval', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const rng = new SimpleRNG(12345);
      const result = confidenceIntervalBootstrap(data, 0.90, 1000, rng);

      expect(result.lower).toBeLessThan(result.upper);
    });

    it('should make 99% CI wider than 95% CI', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const rng95 = new SimpleRNG(12345);
      const rng99 = new SimpleRNG(12345);

      const result95 = confidenceIntervalBootstrap(data, 0.95, 1000, rng95);
      const result99 = confidenceIntervalBootstrap(data, 0.99, 1000, rng99);

      const width95 = result95.upper - result95.lower;
      const width99 = result99.upper - result99.lower;

      expect(width99).toBeGreaterThan(width95);
    });

    it('should use default 10000 iterations when not specified', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const rng = new SimpleRNG(12345);
      const result = confidenceIntervalBootstrap(data, 0.95, undefined, rng);

      expect(result.lower).toBeLessThan(result.upper);
    });

    it('should throw error for empty array', () => {
      const rng = new SimpleRNG(12345);
      expect(() => confidenceIntervalBootstrap([], 0.95, 1000, rng)).toThrow('Data array cannot be empty');
    });

    it('should throw error for single value', () => {
      const rng = new SimpleRNG(12345);
      expect(() => confidenceIntervalBootstrap([42], 0.95, 1000, rng)).toThrow('At least 2 values required');
    });

    it('should throw error for confidence < 0', () => {
      const rng = new SimpleRNG(12345);
      expect(() => confidenceIntervalBootstrap([1, 2, 3], -0.1, 1000, rng)).toThrow('Confidence level must be between 0 and 1');
    });

    it('should throw error for confidence > 1', () => {
      const rng = new SimpleRNG(12345);
      expect(() => confidenceIntervalBootstrap([1, 2, 3], 1.1, 1000, rng)).toThrow('Confidence level must be between 0 and 1');
    });

    it('should handle negative numbers', () => {
      const data = [-5, -3, -1, 0, 1, 3, 5];
      const rng = new SimpleRNG(12345);
      const result = confidenceIntervalBootstrap(data, 0.95, 1000, rng);

      expect(result.lower).toBeLessThan(result.upper);
    });

    it('should handle decimals', () => {
      const data = [1.5, 2.5, 3.5, 4.5, 5.5];
      const rng = new SimpleRNG(12345);
      const result = confidenceIntervalBootstrap(data, 0.95, 1000, rng);

      expect(result.lower).toBeLessThan(result.upper);
    });

    it('should handle small iteration count', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const rng = new SimpleRNG(12345);
      const result = confidenceIntervalBootstrap(data, 0.95, 100, rng);

      expect(result.lower).toBeLessThan(result.upper);
    });

    it('should produce interval around sample mean', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const rng = new SimpleRNG(12345);
      const result = confidenceIntervalBootstrap(data, 0.95, 1000, rng);
      const mean = 5.5;

      expect(result.lower).toBeLessThan(mean);
      expect(result.upper).toBeGreaterThan(mean);
    });
  });

  describe('marginOfError', () => {
    it('should calculate margin of error for 95% confidence', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const margin = marginOfError(data);

      expect(margin).toBeGreaterThan(0);
    });

    it('should calculate margin of error for 90% confidence', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const margin = marginOfError(data, 0.90);

      expect(margin).toBeGreaterThan(0);
    });

    it('should make 99% margin larger than 95% margin', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const margin95 = marginOfError(data, 0.95);
      const margin99 = marginOfError(data, 0.99);

      expect(margin99).toBeGreaterThan(margin95);
    });

    it('should match confidenceIntervalNormal margin', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const margin = marginOfError(data, 0.95);
      const ci = confidenceIntervalNormal(data, 0.95);

      expect(margin).toBeCloseTo(ci.margin, 10);
    });

    it('should throw error for empty array', () => {
      expect(() => marginOfError([])).toThrow('Data array cannot be empty');
    });

    it('should throw error for single value', () => {
      expect(() => marginOfError([42])).toThrow('At least 2 values required');
    });

    it('should throw error for confidence < 0', () => {
      expect(() => marginOfError([1, 2, 3], -0.1)).toThrow('Confidence level must be between 0 and 1');
    });

    it('should throw error for confidence > 1', () => {
      expect(() => marginOfError([1, 2, 3], 1.1)).toThrow('Confidence level must be between 0 and 1');
    });

    it('should handle negative numbers', () => {
      const data = [-5, -3, -1, 0, 1, 3, 5];
      const margin = marginOfError(data);

      expect(margin).toBeGreaterThan(0);
    });

    it('should handle decimals', () => {
      const data = [1.5, 2.5, 3.5, 4.5, 5.5];
      const margin = marginOfError(data);

      expect(margin).toBeGreaterThan(0);
    });

    it('should decrease with larger sample size', () => {
      // Use repeated samples of same data to keep std dev constant
      const baseData = [1, 2, 3, 4, 5];
      const data10 = baseData.concat(baseData); // 10 elements
      const data100 = Array(20).fill(baseData).flat(); // 100 elements

      const margin10 = marginOfError(data10);
      const margin100 = marginOfError(data100);

      expect(margin100).toBeLessThan(margin10);
    });
  });

  describe('sampleSize', () => {
    it('should calculate required sample size', () => {
      const n = sampleSize(1.0, 5.0, 0.95);

      expect(n).toBeGreaterThan(0);
      expect(Number.isInteger(n)).toBe(true);
    });

    it('should calculate sample size for 90% confidence', () => {
      const n = sampleSize(1.0, 5.0, 0.90);

      expect(n).toBeGreaterThan(0);
      expect(Number.isInteger(n)).toBe(true);
    });

    it('should calculate sample size for 99% confidence', () => {
      const n = sampleSize(1.0, 5.0, 0.99);

      expect(n).toBeGreaterThan(0);
      expect(Number.isInteger(n)).toBe(true);
    });

    it('should require larger sample for 99% than 95%', () => {
      const n95 = sampleSize(1.0, 5.0, 0.95);
      const n99 = sampleSize(1.0, 5.0, 0.99);

      expect(n99).toBeGreaterThan(n95);
    });

    it('should require larger sample for smaller margin', () => {
      const n1 = sampleSize(1.0, 5.0, 0.95);
      const n05 = sampleSize(0.5, 5.0, 0.95);

      expect(n05).toBeGreaterThan(n1);
    });

    it('should require larger sample for larger std dev', () => {
      const n5 = sampleSize(1.0, 5.0, 0.95);
      const n10 = sampleSize(1.0, 10.0, 0.95);

      expect(n10).toBeGreaterThan(n5);
    });

    it('should throw error for non-positive margin', () => {
      expect(() => sampleSize(0, 5.0, 0.95)).toThrow('Margin of error must be positive');
      expect(() => sampleSize(-1, 5.0, 0.95)).toThrow('Margin of error must be positive');
    });

    it('should throw error for non-positive std dev', () => {
      expect(() => sampleSize(1.0, 0, 0.95)).toThrow('Standard deviation must be positive');
      expect(() => sampleSize(1.0, -1, 0.95)).toThrow('Standard deviation must be positive');
    });

    it('should throw error for confidence < 0', () => {
      expect(() => sampleSize(1.0, 5.0, -0.1)).toThrow('Confidence level must be between 0 and 1');
    });

    it('should throw error for confidence > 1', () => {
      expect(() => sampleSize(1.0, 5.0, 1.1)).toThrow('Confidence level must be between 0 and 1');
    });

    it('should handle decimals', () => {
      const n = sampleSize(0.5, 2.5, 0.95);

      expect(n).toBeGreaterThan(0);
      expect(Number.isInteger(n)).toBe(true);
    });

    it('should calculate known sample size accurately', () => {
      // For margin=1, stdDev=5, confidence=0.95
      // z = 1.96, n = (1.96 * 5 / 1)^2 = 96.04
      const n = sampleSize(1.0, 5.0, 0.95);

      expect(n).toBeCloseTo(97, 0); // Rounded up
    });
  });
});
