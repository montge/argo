import { UniformDistribution } from '../../src/distributions/UniformDistribution';
import { SimpleRNG } from '../../src/utils/SimpleRNG';

describe('UniformDistribution', () => {
  let rng: SimpleRNG;

  beforeEach(() => {
    rng = new SimpleRNG(42);
  });

  describe('constructor', () => {
    it('should create distribution with valid parameters', () => {
      const dist = new UniformDistribution(0, 10);
      expect(dist).toBeInstanceOf(UniformDistribution);
      expect(dist.min).toBe(0);
      expect(dist.max).toBe(10);
    });

    it('should throw error when min >= max', () => {
      expect(() => new UniformDistribution(10, 10)).toThrow('max must be greater than min');
      expect(() => new UniformDistribution(10, 5)).toThrow('max must be greater than min');
    });

    it('should accept negative values', () => {
      const dist = new UniformDistribution(-10, -5);
      expect(dist.min).toBe(-10);
      expect(dist.max).toBe(-5);
    });
  });

  describe('sample', () => {
    it('should generate samples between min and max', () => {
      const dist = new UniformDistribution(0, 10);
      const samples: number[] = [];

      for (let i = 0; i < 1000; i++) {
        samples.push(dist.sample(rng));
      }

      // All samples should be within [min, max)
      expect(samples.every((x) => x >= 0 && x < 10)).toBe(true);
    });

    it('should generate samples with approximately uniform distribution', () => {
      const dist = new UniformDistribution(0, 10);
      const samples: number[] = [];

      for (let i = 0; i < 10000; i++) {
        samples.push(dist.sample(rng));
      }

      // Calculate empirical mean (should be approximately (min+max)/2 = 5)
      const mean = samples.reduce((a, b) => a + b) / samples.length;
      expect(mean).toBeGreaterThan(4.5);
      expect(mean).toBeLessThan(5.5);

      // Calculate empirical variance (should be approximately (max-min)^2/12 = 100/12 = 8.33)
      const variance =
        samples.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (samples.length - 1);
      expect(variance).toBeGreaterThan(7);
      expect(variance).toBeLessThan(10);
    });

    it('should work with negative ranges', () => {
      const dist = new UniformDistribution(-5, 5);
      const samples: number[] = [];

      for (let i = 0; i < 1000; i++) {
        samples.push(dist.sample(rng));
      }

      expect(samples.every((x) => x >= -5 && x < 5)).toBe(true);
    });

    it('should generate different values with different seeds', () => {
      const dist = new UniformDistribution(0, 10);
      const rng1 = new SimpleRNG(42);
      const rng2 = new SimpleRNG(99);

      const sample1 = dist.sample(rng1);
      const sample2 = dist.sample(rng2);

      expect(sample1).not.toBe(sample2);
    });

    it('should generate reproducible values with same seed', () => {
      const dist = new UniformDistribution(0, 10);
      const rng1 = new SimpleRNG(42);
      const rng2 = new SimpleRNG(42);

      const sample1 = dist.sample(rng1);
      const sample2 = dist.sample(rng2);

      expect(sample1).toBe(sample2);
    });
  });

  describe('pdf', () => {
    it('should return constant value for x in [min, max)', () => {
      const dist = new UniformDistribution(0, 10);

      // PDF should be 1/(max-min) = 1/10 = 0.1 for all x in [min, max)
      expect(dist.pdf(0)).toBe(0.1);
      expect(dist.pdf(5)).toBe(0.1);
      expect(dist.pdf(9.9)).toBe(0.1);
    });

    it('should return 0 for x outside [min, max)', () => {
      const dist = new UniformDistribution(0, 10);

      expect(dist.pdf(-1)).toBe(0);
      expect(dist.pdf(10)).toBe(0);
      expect(dist.pdf(15)).toBe(0);
    });

    it('should work with negative ranges', () => {
      const dist = new UniformDistribution(-10, -5);

      // PDF should be 1/(max-min) = 1/5 = 0.2
      expect(dist.pdf(-7)).toBe(0.2);
      expect(dist.pdf(-11)).toBe(0);
      expect(dist.pdf(-4)).toBe(0);
    });
  });

  describe('cdf', () => {
    it('should return 0 for x < min', () => {
      const dist = new UniformDistribution(0, 10);

      expect(dist.cdf(-5)).toBe(0);
      expect(dist.cdf(-0.1)).toBe(0);
    });

    it('should return 1 for x >= max', () => {
      const dist = new UniformDistribution(0, 10);

      expect(dist.cdf(10)).toBe(1);
      expect(dist.cdf(15)).toBe(1);
    });

    it('should return linear value for x in [min, max)', () => {
      const dist = new UniformDistribution(0, 10);

      // CDF = (x - min) / (max - min)
      expect(dist.cdf(0)).toBe(0);
      expect(dist.cdf(2.5)).toBeCloseTo(0.25, 10);
      expect(dist.cdf(5)).toBeCloseTo(0.5, 10);
      expect(dist.cdf(7.5)).toBeCloseTo(0.75, 10);
    });

    it('should be monotonically increasing', () => {
      const dist = new UniformDistribution(0, 10);

      expect(dist.cdf(0)).toBeLessThan(dist.cdf(2));
      expect(dist.cdf(2)).toBeLessThan(dist.cdf(5));
      expect(dist.cdf(5)).toBeLessThan(dist.cdf(8));
      expect(dist.cdf(8)).toBeLessThan(dist.cdf(10));
    });

    it('should work with negative ranges', () => {
      const dist = new UniformDistribution(-10, 0);

      expect(dist.cdf(-10)).toBe(0);
      expect(dist.cdf(-5)).toBeCloseTo(0.5, 10);
      expect(dist.cdf(0)).toBe(1);
    });
  });

  describe('inverseCDF', () => {
    it('should return min for p=0', () => {
      const dist = new UniformDistribution(0, 10);

      expect(dist.inverseCDF(0)).toBe(0);
    });

    it('should return max for p=1', () => {
      const dist = new UniformDistribution(0, 10);

      expect(dist.inverseCDF(1)).toBe(10);
    });

    it('should return linear interpolation for p in (0, 1)', () => {
      const dist = new UniformDistribution(0, 10);

      // inverseCDF(p) = min + p * (max - min)
      expect(dist.inverseCDF(0.25)).toBeCloseTo(2.5, 10);
      expect(dist.inverseCDF(0.5)).toBeCloseTo(5, 10);
      expect(dist.inverseCDF(0.75)).toBeCloseTo(7.5, 10);
    });

    it('should throw error for invalid probabilities', () => {
      const dist = new UniformDistribution(0, 10);

      expect(() => dist.inverseCDF(-0.1)).toThrow('Probability must be between 0 and 1');
      expect(() => dist.inverseCDF(1.1)).toThrow('Probability must be between 0 and 1');
    });

    it('should be inverse of CDF', () => {
      const dist = new UniformDistribution(0, 10);

      const x = 7.5;
      const p = dist.cdf(x);
      const xRecovered = dist.inverseCDF(p);

      expect(xRecovered).toBeCloseTo(x, 10);
    });

    it('should work with negative ranges', () => {
      const dist = new UniformDistribution(-10, 10);

      expect(dist.inverseCDF(0)).toBe(-10);
      expect(dist.inverseCDF(0.5)).toBeCloseTo(0, 10);
      expect(dist.inverseCDF(1)).toBe(10);
    });
  });

  describe('validateParameters', () => {
    it('should return true for valid parameters', () => {
      const dist = new UniformDistribution(0, 10);
      expect(dist.validateParameters()).toBe(true);
    });

    it('should throw for invalid parameters in constructor', () => {
      expect(() => new UniformDistribution(10, 10)).toThrow();
      expect(() => new UniformDistribution(10, 5)).toThrow();
    });

    it('should validate finite values', () => {
      expect(() => new UniformDistribution(NaN, 10)).toThrow('min and max must be finite');
      expect(() => new UniformDistribution(0, Infinity)).toThrow('min and max must be finite');
    });
  });

  describe('properties', () => {
    it('should expose min and max properties', () => {
      const dist = new UniformDistribution(5, 15);

      expect(dist.min).toBe(5);
      expect(dist.max).toBe(15);
    });
  });
});
