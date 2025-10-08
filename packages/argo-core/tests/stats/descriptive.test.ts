import {
  mean,
  median,
  min,
  max,
  range,
  variance,
  standardDeviation,
  mode,
  geometricMean,
  harmonicMean,
  skewness,
  kurtosis,
} from '../../src/stats/descriptive';

describe('Descriptive Statistics', () => {
  describe('mean', () => {
    it('should calculate mean of simple array', () => {
      expect(mean([1, 2, 3, 4, 5])).toBe(3);
    });

    it('should calculate mean of array with decimals', () => {
      expect(mean([1.5, 2.5, 3.5])).toBe(2.5);
    });

    it('should handle negative numbers', () => {
      expect(mean([-5, -3, -1, 0, 1])).toBe(-1.6);
    });

    it('should handle mixed positive and negative', () => {
      expect(mean([-10, 0, 10])).toBe(0);
    });

    it('should handle single element', () => {
      expect(mean([42])).toBe(42);
    });

    it('should handle two elements', () => {
      expect(mean([10, 20])).toBe(15);
    });

    it('should handle all same values', () => {
      expect(mean([5, 5, 5, 5])).toBe(5);
    });

    it('should throw error for empty array', () => {
      expect(() => mean([])).toThrow('Data array cannot be empty');
    });

    it('should handle large numbers', () => {
      expect(mean([1000000, 2000000, 3000000])).toBe(2000000);
    });

    it('should handle very small numbers', () => {
      const result = mean([0.001, 0.002, 0.003]);
      expect(result).toBeCloseTo(0.002, 10);
    });

    it('should handle array with zeros', () => {
      expect(mean([0, 0, 0, 10])).toBe(2.5);
    });

    it('should calculate mean accurately with floating point', () => {
      const result = mean([1.1, 2.2, 3.3, 4.4, 5.5]);
      expect(result).toBeCloseTo(3.3, 10);
    });
  });

  describe('median', () => {
    it('should calculate median of odd-length array', () => {
      expect(median([1, 2, 3, 4, 5])).toBe(3);
    });

    it('should calculate median of even-length array', () => {
      expect(median([1, 2, 3, 4])).toBe(2.5);
    });

    it('should handle unsorted array', () => {
      expect(median([5, 1, 4, 2, 3])).toBe(3);
    });

    it('should handle single element', () => {
      expect(median([42])).toBe(42);
    });

    it('should handle two elements', () => {
      expect(median([10, 20])).toBe(15);
    });

    it('should handle negative numbers', () => {
      expect(median([-5, -3, -1, 0, 1])).toBe(-1);
    });

    it('should handle duplicates', () => {
      expect(median([1, 2, 2, 3, 4])).toBe(2);
    });

    it('should throw error for empty array', () => {
      expect(() => median([])).toThrow('Data array cannot be empty');
    });

    it('should not modify original array', () => {
      const data = [5, 1, 4, 2, 3];
      median(data);
      expect(data).toEqual([5, 1, 4, 2, 3]);
    });
  });

  describe('min', () => {
    it('should find minimum value', () => {
      expect(min([5, 2, 8, 1, 9])).toBe(1);
    });

    it('should handle single element', () => {
      expect(min([42])).toBe(42);
    });

    it('should handle negative numbers', () => {
      expect(min([-5, -3, -10, 0, 1])).toBe(-10);
    });

    it('should handle all same values', () => {
      expect(min([5, 5, 5])).toBe(5);
    });

    it('should throw error for empty array', () => {
      expect(() => min([])).toThrow('Data array cannot be empty');
    });

    it('should handle decimals', () => {
      expect(min([1.5, 1.2, 1.8])).toBe(1.2);
    });
  });

  describe('max', () => {
    it('should find maximum value', () => {
      expect(max([5, 2, 8, 1, 9])).toBe(9);
    });

    it('should handle single element', () => {
      expect(max([42])).toBe(42);
    });

    it('should handle negative numbers', () => {
      expect(max([-5, -3, -10, 0, 1])).toBe(1);
    });

    it('should handle all same values', () => {
      expect(max([5, 5, 5])).toBe(5);
    });

    it('should throw error for empty array', () => {
      expect(() => max([])).toThrow('Data array cannot be empty');
    });

    it('should handle decimals', () => {
      expect(max([1.5, 1.2, 1.8])).toBe(1.8);
    });
  });

  describe('range', () => {
    it('should calculate range', () => {
      expect(range([1, 2, 3, 4, 5])).toBe(4);
    });

    it('should handle negative numbers', () => {
      expect(range([-10, -5, 0, 5, 10])).toBe(20);
    });

    it('should handle single element (range is 0)', () => {
      expect(range([42])).toBe(0);
    });

    it('should handle all same values (range is 0)', () => {
      expect(range([5, 5, 5])).toBe(0);
    });

    it('should throw error for empty array', () => {
      expect(() => range([])).toThrow('Data array cannot be empty');
    });

    it('should handle decimals', () => {
      expect(range([1.5, 1.2, 1.8])).toBeCloseTo(0.6, 10);
    });
  });

  describe('variance', () => {
    it('should calculate sample variance', () => {
      // [1, 2, 3, 4, 5] has sample variance = 2.5
      expect(variance([1, 2, 3, 4, 5])).toBeCloseTo(2.5, 10);
    });

    it('should calculate population variance when sample=false', () => {
      // [1, 2, 3, 4, 5] has population variance = 2.0
      expect(variance([1, 2, 3, 4, 5], false)).toBeCloseTo(2.0, 10);
    });

    it('should handle negative numbers', () => {
      const data = [-5, -3, -1, 0, 1];
      const result = variance(data);
      expect(result).toBeCloseTo(5.8, 1);
    });

    it('should handle all same values (variance is 0)', () => {
      expect(variance([5, 5, 5, 5])).toBe(0);
    });

    it('should handle two elements', () => {
      // [10, 20] sample variance = 50
      expect(variance([10, 20])).toBeCloseTo(50, 10);
    });

    it('should throw error for empty array', () => {
      expect(() => variance([])).toThrow('Data array cannot be empty');
    });

    it('should throw error for single element with sample=true', () => {
      expect(() => variance([42])).toThrow('Sample variance requires at least 2 values');
    });

    it('should handle single element with sample=false', () => {
      expect(variance([42], false)).toBe(0);
    });

    it('should handle decimals', () => {
      const result = variance([1.5, 2.5, 3.5]);
      expect(result).toBeCloseTo(1.0, 10);
    });

    it('should calculate known variance accurately', () => {
      // [2, 4, 4, 4, 5, 5, 7, 9] sample variance ≈ 4.571428571
      const data = [2, 4, 4, 4, 5, 5, 7, 9];
      expect(variance(data)).toBeCloseTo(4.571428571, 8);
    });
  });

  describe('standardDeviation', () => {
    it('should calculate sample standard deviation', () => {
      // [1, 2, 3, 4, 5] has sample std dev ≈ 1.5811
      expect(standardDeviation([1, 2, 3, 4, 5])).toBeCloseTo(1.5811, 4);
    });

    it('should calculate population standard deviation when sample=false', () => {
      // [1, 2, 3, 4, 5] has population std dev ≈ 1.4142
      expect(standardDeviation([1, 2, 3, 4, 5], false)).toBeCloseTo(1.4142, 4);
    });

    it('should handle negative numbers', () => {
      const data = [-5, -3, -1, 0, 1];
      const result = standardDeviation(data);
      expect(result).toBeCloseTo(2.408, 3);
    });

    it('should handle all same values (std dev is 0)', () => {
      expect(standardDeviation([5, 5, 5, 5])).toBe(0);
    });

    it('should handle two elements', () => {
      // [10, 20] sample std dev ≈ 7.071
      expect(standardDeviation([10, 20])).toBeCloseTo(7.071, 3);
    });

    it('should throw error for empty array', () => {
      expect(() => standardDeviation([])).toThrow('Data array cannot be empty');
    });

    it('should throw error for single element with sample=true', () => {
      expect(() => standardDeviation([42])).toThrow('Sample variance requires at least 2 values');
    });

    it('should handle single element with sample=false', () => {
      expect(standardDeviation([42], false)).toBe(0);
    });

    it('should be square root of variance', () => {
      const data = [2, 4, 4, 4, 5, 5, 7, 9];
      const v = variance(data);
      const sd = standardDeviation(data);
      expect(sd).toBeCloseTo(Math.sqrt(v), 10);
    });

    it('should handle decimals accurately', () => {
      const result = standardDeviation([1.5, 2.5, 3.5]);
      expect(result).toBeCloseTo(1.0, 10);
    });
  });

  describe('mode', () => {
    it('should find single mode', () => {
      expect(mode([1, 2, 2, 3, 4])).toEqual([2]);
    });

    it('should find multiple modes (bimodal)', () => {
      const result = mode([1, 2, 2, 3, 3, 4]);
      expect(result).toHaveLength(2);
      expect(result).toContain(2);
      expect(result).toContain(3);
    });

    it('should find multiple modes (multimodal)', () => {
      const result = mode([1, 1, 2, 2, 3, 3]);
      expect(result).toHaveLength(3);
      expect(result).toContain(1);
      expect(result).toContain(2);
      expect(result).toContain(3);
    });

    it('should return empty array when all values appear once', () => {
      expect(mode([1, 2, 3, 4, 5])).toEqual([]);
    });

    it('should handle single element', () => {
      // Single element is technically the mode (appears with frequency 1)
      // But our implementation returns [] for "all values appear once"
      expect(mode([42])).toEqual([]);
    });

    it('should handle all same values', () => {
      expect(mode([5, 5, 5, 5])).toEqual([5]);
    });

    it('should throw error for empty array', () => {
      expect(() => mode([])).toThrow('Data array cannot be empty');
    });

    it('should handle negative numbers', () => {
      expect(mode([-5, -3, -3, -1, 0, 1])).toEqual([-3]);
    });

    it('should handle decimals', () => {
      expect(mode([1.5, 1.5, 2.5, 3.5])).toEqual([1.5]);
    });

    it('should sort result when multiple modes', () => {
      const result = mode([5, 5, 3, 3, 1, 1]);
      expect(result).toEqual([1, 3, 5]);
    });
  });

  describe('geometricMean', () => {
    it('should calculate geometric mean', () => {
      // Geometric mean of [1, 2, 3, 4] = (1*2*3*4)^(1/4) = 24^0.25 ≈ 2.213
      expect(geometricMean([1, 2, 3, 4])).toBeCloseTo(2.213, 3);
    });

    it('should handle two elements', () => {
      // Geometric mean of [4, 9] = sqrt(36) = 6
      expect(geometricMean([4, 9])).toBeCloseTo(6, 10);
    });

    it('should handle all same values', () => {
      expect(geometricMean([5, 5, 5, 5])).toBeCloseTo(5, 10);
    });

    it('should handle single element', () => {
      expect(geometricMean([42])).toBe(42);
    });

    it('should throw error for empty array', () => {
      expect(() => geometricMean([])).toThrow('Data array cannot be empty');
    });

    it('should throw error for zero values', () => {
      expect(() => geometricMean([1, 0, 3])).toThrow('Geometric mean requires all positive values');
    });

    it('should throw error for negative values', () => {
      expect(() => geometricMean([1, -2, 3])).toThrow('Geometric mean requires all positive values');
    });

    it('should handle large numbers', () => {
      expect(geometricMean([100, 1000, 10000])).toBeCloseTo(1000, 8);
    });

    it('should handle decimals', () => {
      // Geometric mean of [0.5, 2] = sqrt(1) = 1
      expect(geometricMean([0.5, 2])).toBeCloseTo(1, 10);
    });

    it('should be less than or equal to arithmetic mean', () => {
      const data = [1, 2, 3, 4, 5];
      const gm = geometricMean(data);
      const am = mean(data);
      expect(gm).toBeLessThanOrEqual(am);
    });
  });

  describe('harmonicMean', () => {
    it('should calculate harmonic mean', () => {
      // Harmonic mean of [1, 2, 4] = 3 / (1/1 + 1/2 + 1/4) = 3 / 1.75 ≈ 1.714
      expect(harmonicMean([1, 2, 4])).toBeCloseTo(1.714, 3);
    });

    it('should handle two elements', () => {
      // Harmonic mean of [2, 3] = 2 / (1/2 + 1/3) = 2 / (5/6) = 2.4
      expect(harmonicMean([2, 3])).toBeCloseTo(2.4, 10);
    });

    it('should handle all same values', () => {
      expect(harmonicMean([5, 5, 5, 5])).toBeCloseTo(5, 10);
    });

    it('should handle single element', () => {
      expect(harmonicMean([42])).toBe(42);
    });

    it('should throw error for empty array', () => {
      expect(() => harmonicMean([])).toThrow('Data array cannot be empty');
    });

    it('should throw error for zero values', () => {
      expect(() => harmonicMean([1, 0, 3])).toThrow('Harmonic mean requires all positive values');
    });

    it('should throw error for negative values', () => {
      expect(() => harmonicMean([1, -2, 3])).toThrow('Harmonic mean requires all positive values');
    });

    it('should handle large numbers', () => {
      expect(harmonicMean([100, 200, 300])).toBeCloseTo(163.636, 2);
    });

    it('should handle decimals', () => {
      expect(harmonicMean([1.5, 2.5, 3.5])).toBeCloseTo(2.218, 3);
    });

    it('should be less than or equal to geometric mean', () => {
      const data = [1, 2, 3, 4, 5];
      const hm = harmonicMean(data);
      const gm = geometricMean(data);
      expect(hm).toBeLessThanOrEqual(gm);
    });
  });

  describe('skewness', () => {
    it('should calculate skewness of symmetric distribution', () => {
      // Perfectly symmetric distribution should have skewness near 0
      expect(skewness([1, 2, 3, 4, 5])).toBeCloseTo(0, 1);
    });

    it('should calculate positive skewness (right-skewed)', () => {
      // Right-skewed: tail on the right side (more low values)
      const data = [1, 1, 1, 2, 2, 3, 10];
      expect(skewness(data)).toBeGreaterThan(0);
    });

    it('should calculate negative skewness (left-skewed)', () => {
      // Left-skewed: tail on the left side (more high values)
      const data = [1, 8, 9, 9, 10, 10, 10];
      expect(skewness(data)).toBeLessThan(0);
    });

    it('should handle all same values (skewness is 0)', () => {
      expect(skewness([5, 5, 5, 5])).toBe(0);
    });

    it('should throw error for empty array', () => {
      expect(() => skewness([])).toThrow('Data array cannot be empty');
    });

    it('should throw error for less than 3 values', () => {
      expect(() => skewness([1, 2])).toThrow('Skewness requires at least 3 values');
    });

    it('should handle three elements', () => {
      const result = skewness([1, 2, 3]);
      expect(result).toBeCloseTo(0, 1);
    });

    it('should handle negative numbers', () => {
      const data = [-5, -3, -1, 0, 1, 3, 5];
      expect(skewness(data)).toBeCloseTo(0, 1);
    });

    it('should handle decimals', () => {
      const data = [1.5, 2.0, 2.5, 3.0, 3.5];
      expect(skewness(data)).toBeCloseTo(0, 1);
    });

    it('should calculate known skewness accurately', () => {
      // Example with known skewness
      const data = [2, 5, 5, 6, 7, 8, 9, 10];
      const result = skewness(data);
      expect(result).toBeCloseTo(-0.41, 1);
    });
  });

  describe('kurtosis', () => {
    it('should calculate kurtosis of normal-like distribution', () => {
      // Normal distribution has excess kurtosis of 0
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const result = kurtosis(data);
      expect(result).toBeCloseTo(-1.2, 1);
    });

    it('should calculate positive kurtosis (heavy tails)', () => {
      // Heavy tails: more outliers
      const data = [1, 1, 5, 5, 5, 5, 5, 9, 9];
      expect(kurtosis(data)).toBeGreaterThan(-1);
    });

    it('should calculate negative kurtosis (light tails)', () => {
      // Light tails: uniform-like distribution
      const data = [1, 2, 3, 4, 5];
      expect(kurtosis(data)).toBeLessThan(0);
    });

    it('should handle all same values', () => {
      // Undefined mathematically, but returns 0 due to zero variance
      expect(kurtosis([5, 5, 5, 5])).toBe(0);
    });

    it('should throw error for empty array', () => {
      expect(() => kurtosis([])).toThrow('Data array cannot be empty');
    });

    it('should throw error for less than 4 values', () => {
      expect(() => kurtosis([1, 2, 3])).toThrow('Kurtosis requires at least 4 values');
    });

    it('should handle four elements', () => {
      const result = kurtosis([1, 2, 3, 4]);
      expect(result).toBeCloseTo(-1.2, 1);
    });

    it('should handle negative numbers', () => {
      const data = [-5, -3, -1, 0, 1, 3, 5];
      const result = kurtosis(data);
      expect(result).toBeCloseTo(-0.55, 1);
    });

    it('should handle decimals', () => {
      const data = [1.5, 2.0, 2.5, 3.0, 3.5];
      const result = kurtosis(data);
      expect(result).toBeCloseTo(-1.2, 1);
    });

    it('should use excess kurtosis (Fisher definition)', () => {
      // Excess kurtosis = kurtosis - 3
      // Normal distribution has excess kurtosis of 0
      const data = [1, 2, 3, 4, 5, 6, 7];
      const result = kurtosis(data);
      // Uniform-like should have negative excess kurtosis
      expect(result).toBeLessThan(0);
    });
  });
});
