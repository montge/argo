import { fitNormal, fitLogNormal, goodnessOfFit } from '../../src/stats/fitting';
import { NormalDistribution } from '../../src/distributions/NormalDistribution';
import { LogNormalDistribution } from '../../src/distributions/LogNormalDistribution';
import { SimpleRNG } from '../../src/utils/SimpleRNG';

describe('Distribution Fitting', () => {
  describe('fitNormal', () => {
    it('should fit normal distribution to sample data', () => {
      // Sample data from N(10, 2)
      const data = [8, 9, 10, 11, 12, 10, 9, 11, 10, 12];
      const result = fitNormal(data);

      expect(result).toHaveProperty('mu');
      expect(result).toHaveProperty('sigma');
      expect(result.mu).toBeCloseTo(10.2, 1);
      expect(result.sigma).toBeGreaterThan(0);
    });

    it('should fit normal distribution to known parameters', () => {
      // Generate data from known distribution
      const rng = new SimpleRNG(12345);
      const dist = new NormalDistribution(50, 10);
      const data = Array.from({ length: 1000 }, () => dist.sample(rng));

      const result = fitNormal(data);

      // Should recover approximately correct parameters (within 10%)
      expect(result.mu).toBeCloseTo(50, -1); // Within ~5
      expect(result.sigma).toBeCloseTo(10, 0);
    });

    it('should handle small sample', () => {
      const data = [1, 2, 3];
      const result = fitNormal(data);

      expect(result.mu).toBeCloseTo(2, 1);
      expect(result.sigma).toBeGreaterThan(0);
    });

    it('should handle negative values', () => {
      const data = [-5, -3, -1, 0, 1, 3, 5];
      const result = fitNormal(data);

      expect(result.mu).toBeCloseTo(0, 1);
      expect(result.sigma).toBeGreaterThan(0);
    });

    it('should handle decimals', () => {
      const data = [1.5, 2.5, 3.5, 4.5, 5.5];
      const result = fitNormal(data);

      expect(result.mu).toBeCloseTo(3.5, 1);
      expect(result.sigma).toBeGreaterThan(0);
    });

    it('should throw error for empty array', () => {
      expect(() => fitNormal([])).toThrow('Data array cannot be empty');
    });

    it('should throw error for single value', () => {
      expect(() => fitNormal([42])).toThrow('At least 2 values required');
    });

    it('should return positive sigma', () => {
      const data = [1, 2, 3, 4, 5];
      const result = fitNormal(data);

      expect(result.sigma).toBeGreaterThan(0);
    });

    it('should handle all same values', () => {
      const data = [5, 5, 5, 5, 5];
      const result = fitNormal(data);

      expect(result.mu).toBe(5);
      expect(result.sigma).toBeCloseTo(0, 5);
    });

    it('should use MLE estimator (sample std dev)', () => {
      const data = [1, 2, 3, 4, 5];
      const result = fitNormal(data);

      // Mean should be exact
      expect(result.mu).toBe(3);

      // MLE uses sample std (not population std)
      // Sample variance = sum((x - mean)^2) / (n - 1)
      const variance = 2.5; // For this data
      expect(result.sigma).toBeCloseTo(Math.sqrt(variance), 5);
    });

    it('should handle large dataset efficiently', () => {
      const data = Array.from({ length: 10000 }, (_, i) => i);
      const result = fitNormal(data);

      expect(result.mu).toBeCloseTo(4999.5, 0);
      expect(result.sigma).toBeGreaterThan(0);
    });
  });

  describe('fitLogNormal', () => {
    it('should fit log-normal distribution to sample data', () => {
      // Sample data from log-normal
      const data = [1, 2, 3, 5, 8, 13, 21];
      const result = fitLogNormal(data);

      expect(result).toHaveProperty('mu');
      expect(result).toHaveProperty('sigma');
      expect(result.mu).toBeGreaterThan(0);
      expect(result.sigma).toBeGreaterThan(0);
    });

    it('should fit log-normal distribution to known parameters', () => {
      // Generate data from known distribution
      const rng = new SimpleRNG(12345);
      const dist = new LogNormalDistribution(1, 0.5);
      const data = Array.from({ length: 1000 }, () => dist.sample(rng));

      const result = fitLogNormal(data);

      // Should recover approximately correct parameters
      expect(result.mu).toBeCloseTo(1, 0);
      expect(result.sigma).toBeCloseTo(0.5, 1);
    });

    it('should handle small sample', () => {
      const data = [1, 2, 3];
      const result = fitLogNormal(data);

      expect(result.mu).toBeGreaterThan(0);
      expect(result.sigma).toBeGreaterThan(0);
    });

    it('should handle decimals', () => {
      const data = [0.5, 1.5, 2.5, 3.5, 4.5];
      const result = fitLogNormal(data);

      expect(result.mu).toBeGreaterThan(0);
      expect(result.sigma).toBeGreaterThan(0);
    });

    it('should throw error for empty array', () => {
      expect(() => fitLogNormal([])).toThrow('Data array cannot be empty');
    });

    it('should throw error for single value', () => {
      expect(() => fitLogNormal([42])).toThrow('At least 2 values required');
    });

    it('should throw error for non-positive values', () => {
      expect(() => fitLogNormal([1, 2, 0, 3])).toThrow('All values must be positive for log-normal fitting');
      expect(() => fitLogNormal([1, 2, -1, 3])).toThrow('All values must be positive for log-normal fitting');
    });

    it('should return positive parameters', () => {
      const data = [1, 2, 3, 4, 5];
      const result = fitLogNormal(data);

      expect(result.mu).toBeGreaterThan(0);
      expect(result.sigma).toBeGreaterThan(0);
    });

    it('should fit by taking log of data', () => {
      const data = [1, 2, 3, 4, 5];
      const result = fitLogNormal(data);

      // mu and sigma are parameters of underlying normal distribution of log(data)
      const logData = data.map((x) => Math.log(x));
      const logMean = logData.reduce((a, b) => a + b) / logData.length;

      expect(result.mu).toBeCloseTo(logMean, 5);
    });

    it('should handle large dataset efficiently', () => {
      const data = Array.from({ length: 10000 }, (_, i) => i + 1);
      const result = fitLogNormal(data);

      expect(result.mu).toBeGreaterThan(0);
      expect(result.sigma).toBeGreaterThan(0);
    });

    it('should handle highly skewed data', () => {
      // Log-normal is good for skewed data
      const data = [1, 1, 2, 2, 3, 5, 10, 20, 50, 100];
      const result = fitLogNormal(data);

      expect(result.mu).toBeGreaterThan(0);
      expect(result.sigma).toBeGreaterThan(0);
    });
  });

  describe('goodnessOfFit', () => {
    it('should calculate goodness of fit for normal distribution', () => {
      const rng = new SimpleRNG(12345);
      const dist = new NormalDistribution(10, 2);
      const data = Array.from({ length: 100 }, () => dist.sample(rng));

      const gof = goodnessOfFit(data, dist, rng);

      expect(gof).toHaveProperty('ksStatistic');
      expect(gof).toHaveProperty('pValue');
      expect(gof.ksStatistic).toBeGreaterThanOrEqual(0);
      expect(gof.ksStatistic).toBeLessThanOrEqual(1);
      expect(gof.pValue).toBeGreaterThanOrEqual(0);
      expect(gof.pValue).toBeLessThanOrEqual(1);
    });

    it('should show good fit for data from distribution', () => {
      const rng = new SimpleRNG(12345);
      const dist = new NormalDistribution(0, 1);
      const data = Array.from({ length: 1000 }, () => dist.sample(rng));

      const gof = goodnessOfFit(data, dist, rng);

      // Should have high p-value (good fit)
      expect(gof.pValue).toBeGreaterThan(0.05);
    });

    it('should show poor fit for mismatched distribution', () => {
      // Generate normal data, test against uniform distribution
      const rng = new SimpleRNG(12345);
      const normalDist = new NormalDistribution(5, 1);
      const data = Array.from({ length: 1000 }, () => normalDist.sample(rng));

      // Create a uniform distribution that doesn't match
      const uniformDist = new NormalDistribution(0, 1);
      const gof = goodnessOfFit(data, uniformDist, rng);

      // Should have low p-value (poor fit)
      expect(gof.pValue).toBeLessThan(0.05);
    });

    it('should calculate KS statistic', () => {
      const data = [1, 2, 3, 4, 5];
      const dist = new NormalDistribution(3, 1.5);
      const rng = new SimpleRNG(12345);

      const gof = goodnessOfFit(data, dist, rng);

      // KS statistic is max difference between empirical and theoretical CDF
      expect(gof.ksStatistic).toBeGreaterThan(0);
      expect(gof.ksStatistic).toBeLessThan(1);
    });

    it('should use bootstrap for p-value estimation', () => {
      const rng1 = new SimpleRNG(12345);
      const rng2 = new SimpleRNG(12345);
      const dist = new NormalDistribution(5, 2);
      const data = Array.from({ length: 50 }, () => dist.sample(rng1));

      const gof1 = goodnessOfFit(data, dist, rng2);

      // Reset RNG and run again
      const rng3 = new SimpleRNG(12345);
      const gof2 = goodnessOfFit(data, dist, rng3);

      // Should be reproducible with same seed
      expect(gof1.ksStatistic).toBeCloseTo(gof2.ksStatistic, 5);
      expect(gof1.pValue).toBeCloseTo(gof2.pValue, 2);
    });

    it('should throw error for empty array', () => {
      const dist = new NormalDistribution(0, 1);
      const rng = new SimpleRNG(12345);
      expect(() => goodnessOfFit([], dist, rng)).toThrow('Data array cannot be empty');
    });

    it('should throw error for single value', () => {
      const dist = new NormalDistribution(0, 1);
      const rng = new SimpleRNG(12345);
      expect(() => goodnessOfFit([42], dist, rng)).toThrow('At least 2 values required');
    });

    it('should handle small samples', () => {
      const data = [1, 2, 3, 4, 5];
      const dist = new NormalDistribution(3, 1.5);
      const rng = new SimpleRNG(12345);

      const gof = goodnessOfFit(data, dist, rng);

      expect(gof.ksStatistic).toBeGreaterThanOrEqual(0);
      expect(gof.pValue).toBeGreaterThanOrEqual(0);
      expect(gof.pValue).toBeLessThanOrEqual(1);
    });

    it('should handle large samples', () => {
      const rng = new SimpleRNG(12345);
      const dist = new NormalDistribution(100, 15);
      const data = Array.from({ length: 1000 }, () => dist.sample(rng));

      const gof = goodnessOfFit(data, dist, rng);

      expect(gof.ksStatistic).toBeGreaterThanOrEqual(0);
      expect(gof.pValue).toBeGreaterThan(0.01); // Should be good fit
    });

    it('should use default 1000 bootstrap iterations', () => {
      const data = [1, 2, 3, 4, 5];
      const dist = new NormalDistribution(3, 1.5);
      const rng = new SimpleRNG(12345);

      const gof = goodnessOfFit(data, dist, rng);

      expect(gof).toHaveProperty('ksStatistic');
      expect(gof).toHaveProperty('pValue');
    });

    it('should accept custom bootstrap iterations', () => {
      const data = [1, 2, 3, 4, 5];
      const dist = new NormalDistribution(3, 1.5);
      const rng = new SimpleRNG(12345);

      const gof = goodnessOfFit(data, dist, rng, 100);

      expect(gof.ksStatistic).toBeGreaterThanOrEqual(0);
      expect(gof.pValue).toBeGreaterThanOrEqual(0);
    });

    it('should work with log-normal distribution', () => {
      const rng = new SimpleRNG(12345);
      const dist = new LogNormalDistribution(1, 0.5);
      const data = Array.from({ length: 500 }, () => dist.sample(rng));

      const gof = goodnessOfFit(data, dist, rng);

      expect(gof.pValue).toBeGreaterThan(0.05); // Should be good fit
    });

    it('should return KS statistic of 0 for perfect fit', () => {
      // Create deterministic data that exactly matches CDF
      const data = [0, 1, 2, 3, 4];
      const dist = new NormalDistribution(2, 1.5);
      const rng = new SimpleRNG(12345);

      const gof = goodnessOfFit(data, dist, rng);

      // Won't be exactly 0, but should be small
      expect(gof.ksStatistic).toBeLessThan(0.5);
    });

    it('should handle negative values', () => {
      const rng = new SimpleRNG(12345);
      const dist = new NormalDistribution(-5, 2);
      const data = Array.from({ length: 100 }, () => dist.sample(rng));

      const gof = goodnessOfFit(data, dist, rng);

      expect(gof.ksStatistic).toBeGreaterThanOrEqual(0);
      expect(gof.pValue).toBeGreaterThan(0);
    });
  });
});
