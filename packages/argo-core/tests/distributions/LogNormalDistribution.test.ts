import { LogNormalDistribution } from '../../src/distributions/LogNormalDistribution';
import { SimpleRNG } from '../../src/utils/SimpleRNG';

describe('LogNormalDistribution', () => {
  let rng: SimpleRNG;

  beforeEach(() => {
    rng = new SimpleRNG(42); // Seeded for reproducibility
  });

  describe('constructor', () => {
    it('should create distribution with valid parameters', () => {
      const dist = new LogNormalDistribution(0, 1);
      expect(dist).toBeInstanceOf(LogNormalDistribution);
      expect(dist.mu).toBe(0);
      expect(dist.sigma).toBe(1);
    });

    it('should throw error when sigma is zero', () => {
      expect(() => new LogNormalDistribution(0, 0)).toThrow('Sigma must be positive');
    });

    it('should throw error when sigma is negative', () => {
      expect(() => new LogNormalDistribution(0, -1)).toThrow('Sigma must be positive');
    });

    it('should accept any value for mu', () => {
      expect(() => new LogNormalDistribution(-5, 1)).not.toThrow();
      expect(() => new LogNormalDistribution(0, 1)).not.toThrow();
      expect(() => new LogNormalDistribution(5, 1)).not.toThrow();
    });
  });

  describe('sample', () => {
    it('should generate positive samples only', () => {
      const dist = new LogNormalDistribution(0, 1);
      const samples: number[] = [];

      for (let i = 0; i < 1000; i++) {
        samples.push(dist.sample(rng));
      }

      // All samples must be positive
      expect(samples.every(x => x > 0)).toBe(true);
      expect(samples.every(x => typeof x === 'number' && !isNaN(x) && isFinite(x))).toBe(true);
    });

    it('should generate samples with correct mean', () => {
      const mu = 0;
      const sigma = 0.5;
      const dist = new LogNormalDistribution(mu, sigma);
      const samples: number[] = [];

      for (let i = 0; i < 5000; i++) {
        samples.push(dist.sample(rng));
      }

      // Expected mean: exp(mu + sigma^2/2)
      const expectedMean = Math.exp(mu + sigma * sigma / 2);
      const sampleMean = samples.reduce((a, b) => a + b) / samples.length;

      // Allow 10% tolerance
      expect(sampleMean).toBeGreaterThan(expectedMean * 0.9);
      expect(sampleMean).toBeLessThan(expectedMean * 1.1);
    });

    it('should generate samples with correct variance', () => {
      const mu = 0;
      const sigma = 0.5;
      const dist = new LogNormalDistribution(mu, sigma);
      const samples: number[] = [];

      for (let i = 0; i < 5000; i++) {
        samples.push(dist.sample(rng));
      }

      const sampleMean = samples.reduce((a, b) => a + b) / samples.length;
      const sampleVariance = samples.reduce((sum, x) => sum + Math.pow(x - sampleMean, 2), 0) / (samples.length - 1);

      // Expected variance: (exp(sigma^2) - 1) * exp(2*mu + sigma^2)
      const expectedVariance = (Math.exp(sigma * sigma) - 1) * Math.exp(2 * mu + sigma * sigma);

      // Allow 20% tolerance for variance
      expect(sampleVariance).toBeGreaterThan(expectedVariance * 0.8);
      expect(sampleVariance).toBeLessThan(expectedVariance * 1.2);
    });

    it('should generate different values with different seeds', () => {
      const dist = new LogNormalDistribution(0, 1);
      const rng1 = new SimpleRNG(42);
      const rng2 = new SimpleRNG(99);

      const sample1 = dist.sample(rng1);
      const sample2 = dist.sample(rng2);

      expect(sample1).not.toBe(sample2);
    });

    it('should generate reproducible values with same seed', () => {
      const dist = new LogNormalDistribution(0, 1);
      const rng1 = new SimpleRNG(42);
      const rng2 = new SimpleRNG(42);

      const sample1 = dist.sample(rng1);
      const sample2 = dist.sample(rng2);

      expect(sample1).toBe(sample2);
    });

    it('should handle large mu values', () => {
      const dist = new LogNormalDistribution(5, 0.5);
      const sample = dist.sample(rng);

      expect(sample).toBeGreaterThan(0);
      expect(isFinite(sample)).toBe(true);
    });

    it('should handle small sigma values', () => {
      const dist = new LogNormalDistribution(0, 0.1);
      const samples: number[] = [];

      for (let i = 0; i < 100; i++) {
        samples.push(dist.sample(rng));
      }

      // Small sigma means less variability
      expect(samples.every(x => x > 0)).toBe(true);
      expect(samples.every(x => isFinite(x))).toBe(true);
    });
  });

  describe('pdf', () => {
    it('should return 0 for non-positive values', () => {
      const dist = new LogNormalDistribution(0, 1);

      expect(dist.pdf(0)).toBe(0);
      expect(dist.pdf(-1)).toBe(0);
      expect(dist.pdf(-100)).toBe(0);
    });

    it('should calculate PDF correctly for standard log-normal', () => {
      const dist = new LogNormalDistribution(0, 1);

      // PDF at x=1 (median): 1/(1 * 1 * sqrt(2*pi)) = 0.3989
      expect(dist.pdf(1)).toBeCloseTo(0.3989, 4);

      // PDF at x=e (mean): should be lower
      expect(dist.pdf(Math.E)).toBeGreaterThan(0);
      expect(dist.pdf(Math.E)).toBeLessThan(dist.pdf(1));
    });

    it('should calculate PDF correctly for non-standard parameters', () => {
      const dist = new LogNormalDistribution(1, 0.5);

      // PDF should be positive for positive x
      expect(dist.pdf(1)).toBeGreaterThan(0);
      expect(dist.pdf(2)).toBeGreaterThan(0);
      expect(dist.pdf(3)).toBeGreaterThan(0);
    });

    it('should have PDF integrate to approximately 1', () => {
      const dist = new LogNormalDistribution(0, 1);

      // Numerical integration using trapezoidal rule
      let sum = 0;
      const dx = 0.01;
      for (let x = dx; x < 20; x += dx) {
        sum += dist.pdf(x) * dx;
      }

      // Should be close to 1
      expect(sum).toBeGreaterThan(0.95);
      expect(sum).toBeLessThan(1.05);
    });

    it('should handle edge cases', () => {
      const dist = new LogNormalDistribution(0, 1);

      // Very small positive values
      expect(dist.pdf(0.001)).toBeGreaterThan(0);
      expect(isFinite(dist.pdf(0.001))).toBe(true);

      // Very large values
      expect(dist.pdf(100)).toBeGreaterThan(0);
      expect(dist.pdf(100)).toBeLessThan(0.001);
    });
  });

  describe('cdf', () => {
    it('should return 0 for non-positive values', () => {
      const dist = new LogNormalDistribution(0, 1);

      expect(dist.cdf(0)).toBe(0);
      expect(dist.cdf(-1)).toBe(0);
      expect(dist.cdf(-100)).toBe(0);
    });

    it('should return 0.5 at median', () => {
      const dist = new LogNormalDistribution(0, 1);

      // Median of log-normal(mu, sigma) is exp(mu) = exp(0) = 1
      expect(dist.cdf(1)).toBeCloseTo(0.5, 4);
    });

    it('should calculate CDF correctly for standard log-normal', () => {
      const dist = new LogNormalDistribution(0, 1);

      // CDF should be monotonically increasing
      expect(dist.cdf(0.5)).toBeLessThan(dist.cdf(1));
      expect(dist.cdf(1)).toBeLessThan(dist.cdf(2));
      expect(dist.cdf(2)).toBeLessThan(dist.cdf(5));
    });

    it('should approach 0 as x approaches 0 from right', () => {
      const dist = new LogNormalDistribution(0, 1);

      expect(dist.cdf(0.001)).toBeGreaterThan(0);
      expect(dist.cdf(0.001)).toBeLessThan(0.01);
    });

    it('should approach 1 as x approaches infinity', () => {
      const dist = new LogNormalDistribution(0, 1);

      expect(dist.cdf(100)).toBeGreaterThan(0.99);
      expect(dist.cdf(1000)).toBeGreaterThan(0.999);
    });

    it('should be consistent with PDF', () => {
      const dist = new LogNormalDistribution(0, 1);

      // CDF should increase where PDF is positive
      const x = 2;
      const cdf1 = dist.cdf(x);
      const cdf2 = dist.cdf(x + 0.1);

      expect(cdf2).toBeGreaterThan(cdf1);
    });

    it('should handle different parameter combinations', () => {
      const dist1 = new LogNormalDistribution(1, 0.5);
      const dist2 = new LogNormalDistribution(-1, 2);

      // Both should return valid CDFs
      expect(dist1.cdf(1)).toBeGreaterThan(0);
      expect(dist1.cdf(1)).toBeLessThan(1);
      expect(dist2.cdf(1)).toBeGreaterThan(0);
      expect(dist2.cdf(1)).toBeLessThan(1);
    });
  });

  describe('inverseCDF', () => {
    it('should throw error for p <= 0', () => {
      const dist = new LogNormalDistribution(0, 1);

      expect(() => dist.inverseCDF(0)).toThrow('Probability must be in (0, 1)');
      expect(() => dist.inverseCDF(-0.5)).toThrow('Probability must be in (0, 1)');
    });

    it('should throw error for p >= 1', () => {
      const dist = new LogNormalDistribution(0, 1);

      expect(() => dist.inverseCDF(1)).toThrow('Probability must be in (0, 1)');
      expect(() => dist.inverseCDF(1.5)).toThrow('Probability must be in (0, 1)');
    });

    it('should return median for p=0.5', () => {
      const dist = new LogNormalDistribution(0, 1);

      // Median is exp(mu) = exp(0) = 1
      expect(dist.inverseCDF(0.5)).toBeCloseTo(1, 6);
    });

    it('should be consistent with CDF', () => {
      const dist = new LogNormalDistribution(0, 1);
      const testValues = [0.1, 0.25, 0.5, 0.75, 0.9];

      for (const p of testValues) {
        const x = dist.inverseCDF(p);
        const pComputed = dist.cdf(x);
        expect(pComputed).toBeCloseTo(p, 4);
      }
    });

    it('should return positive values', () => {
      const dist = new LogNormalDistribution(0, 1);

      expect(dist.inverseCDF(0.01)).toBeGreaterThan(0);
      expect(dist.inverseCDF(0.5)).toBeGreaterThan(0);
      expect(dist.inverseCDF(0.99)).toBeGreaterThan(0);
    });

    it('should handle extreme probabilities', () => {
      const dist = new LogNormalDistribution(0, 1);

      // Very small probability
      const x1 = dist.inverseCDF(0.001);
      expect(x1).toBeGreaterThan(0);
      expect(x1).toBeLessThan(0.1);

      // Very large probability
      const x2 = dist.inverseCDF(0.999);
      expect(x2).toBeGreaterThan(10);
      expect(isFinite(x2)).toBe(true);
    });

    it('should work with different parameters', () => {
      const dist = new LogNormalDistribution(2, 0.5);

      const median = dist.inverseCDF(0.5);
      expect(median).toBeCloseTo(Math.exp(2), 4);
    });
  });

  describe('mean', () => {
    it('should calculate mean correctly', () => {
      const mu = 0;
      const sigma = 1;
      const dist = new LogNormalDistribution(mu, sigma);

      // Mean = exp(mu + sigma^2/2)
      const expectedMean = Math.exp(mu + sigma * sigma / 2);
      expect(dist.mean).toBeCloseTo(expectedMean, 6);
    });

    it('should handle different parameter values', () => {
      const dist1 = new LogNormalDistribution(1, 0.5);
      const expectedMean1 = Math.exp(1 + 0.5 * 0.5 / 2);
      expect(dist1.mean).toBeCloseTo(expectedMean1, 6);

      const dist2 = new LogNormalDistribution(-1, 2);
      const expectedMean2 = Math.exp(-1 + 2 * 2 / 2);
      expect(dist2.mean).toBeCloseTo(expectedMean2, 6);
    });
  });

  describe('variance', () => {
    it('should calculate variance correctly', () => {
      const mu = 0;
      const sigma = 1;
      const dist = new LogNormalDistribution(mu, sigma);

      // Variance = (exp(sigma^2) - 1) * exp(2*mu + sigma^2)
      const expectedVariance = (Math.exp(sigma * sigma) - 1) * Math.exp(2 * mu + sigma * sigma);
      expect(dist.variance).toBeCloseTo(expectedVariance, 6);
    });

    it('should handle different parameter values', () => {
      const mu = 1;
      const sigma = 0.5;
      const dist = new LogNormalDistribution(mu, sigma);

      const expectedVariance = (Math.exp(sigma * sigma) - 1) * Math.exp(2 * mu + sigma * sigma);
      expect(dist.variance).toBeCloseTo(expectedVariance, 6);
    });

    it('should always be positive', () => {
      const dist1 = new LogNormalDistribution(0, 0.5);
      const dist2 = new LogNormalDistribution(-2, 1);
      const dist3 = new LogNormalDistribution(5, 2);

      expect(dist1.variance).toBeGreaterThan(0);
      expect(dist2.variance).toBeGreaterThan(0);
      expect(dist3.variance).toBeGreaterThan(0);
    });
  });

  describe('performance', () => {
    it('should generate samples efficiently', () => {
      const dist = new LogNormalDistribution(0, 1);
      const startTime = Date.now();

      for (let i = 0; i < 100000; i++) {
        dist.sample(rng);
      }

      const endTime = Date.now();
      const elapsed = endTime - startTime;

      // Should generate 100k samples in under 100ms
      expect(elapsed).toBeLessThan(100);
    });
  });
});
