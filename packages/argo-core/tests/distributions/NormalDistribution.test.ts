import { NormalDistribution } from '../../src/distributions/NormalDistribution';
import { SimpleRNG } from '../../src/utils/SimpleRNG';

describe('NormalDistribution', () => {
  let rng: SimpleRNG;

  beforeEach(() => {
    rng = new SimpleRNG(42); // Seeded for reproducibility
  });

  describe('constructor', () => {
    it('should create distribution with valid parameters', () => {
      const dist = new NormalDistribution(100, 15);
      expect(dist).toBeInstanceOf(NormalDistribution);
      expect(dist.mean).toBe(100);
      expect(dist.stddev).toBe(15);
    });

    it('should throw error when stddev is zero', () => {
      expect(() => new NormalDistribution(100, 0)).toThrow('Standard deviation must be positive');
    });

    it('should throw error when stddev is negative', () => {
      expect(() => new NormalDistribution(100, -5)).toThrow('Standard deviation must be positive');
    });
  });

  describe('sample', () => {
    it('should generate samples within reasonable range', () => {
      const dist = new NormalDistribution(100, 15);
      const samples: number[] = [];

      for (let i = 0; i < 1000; i++) {
        samples.push(dist.sample(rng));
      }

      // All samples should be numbers
      expect(samples.every(x => typeof x === 'number' && !isNaN(x))).toBe(true);

      // Mean should be approximately 100 (within 3 std errors)
      const sampleMean = samples.reduce((a, b) => a + b) / samples.length;
      const stdError = 15 / Math.sqrt(1000); // ~0.47
      expect(sampleMean).toBeGreaterThan(100 - 3 * stdError);
      expect(sampleMean).toBeLessThan(100 + 3 * stdError);

      // Standard deviation should be approximately 15
      const sampleVariance = samples.reduce((sum, x) => sum + Math.pow(x - sampleMean, 2), 0) / (samples.length - 1);
      const sampleStdDev = Math.sqrt(sampleVariance);
      expect(sampleStdDev).toBeGreaterThan(13);
      expect(sampleStdDev).toBeLessThan(17);
    });

    it('should generate different values with different seeds', () => {
      const dist = new NormalDistribution(0, 1);
      const rng1 = new SimpleRNG(42);
      const rng2 = new SimpleRNG(99);

      const sample1 = dist.sample(rng1);
      const sample2 = dist.sample(rng2);

      expect(sample1).not.toBe(sample2);
    });

    it('should generate reproducible values with same seed', () => {
      const dist = new NormalDistribution(0, 1);
      const rng1 = new SimpleRNG(42);
      const rng2 = new SimpleRNG(42);

      const sample1 = dist.sample(rng1);
      const sample2 = dist.sample(rng2);

      expect(sample1).toBe(sample2);
    });
  });

  describe('pdf', () => {
    it('should calculate PDF correctly for standard normal', () => {
      const dist = new NormalDistribution(0, 1);

      // PDF at mean should be ~0.3989 (1/sqrt(2*pi))
      expect(dist.pdf(0)).toBeCloseTo(0.3989, 4);

      // PDF at mean +/- 1 stddev should be ~0.242
      expect(dist.pdf(1)).toBeCloseTo(0.242, 3);
      expect(dist.pdf(-1)).toBeCloseTo(0.242, 3);

      // PDF should be symmetric
      expect(dist.pdf(2)).toBeCloseTo(dist.pdf(-2), 6);
    });

    it('should calculate PDF correctly for non-standard normal', () => {
      const dist = new NormalDistribution(100, 15);

      // PDF at mean should be 1/(stddev * sqrt(2*pi))
      const expected = 1 / (15 * Math.sqrt(2 * Math.PI));
      expect(dist.pdf(100)).toBeCloseTo(expected, 6);
    });

    it('should return values greater than zero', () => {
      const dist = new NormalDistribution(0, 1);

      expect(dist.pdf(-3)).toBeGreaterThan(0);
      expect(dist.pdf(0)).toBeGreaterThan(0);
      expect(dist.pdf(3)).toBeGreaterThan(0);
    });
  });

  describe('cdf', () => {
    it('should calculate CDF correctly for standard normal', () => {
      const dist = new NormalDistribution(0, 1);

      // CDF at mean should be 0.5
      expect(dist.cdf(0)).toBeCloseTo(0.5, 6);

      // CDF at mean + 1 stddev should be ~0.8413
      expect(dist.cdf(1)).toBeCloseTo(0.8413, 4);

      // CDF at mean - 1 stddev should be ~0.1587
      expect(dist.cdf(-1)).toBeCloseTo(0.1587, 4);

      // CDF at mean + 2 stddev should be ~0.9772
      expect(dist.cdf(2)).toBeCloseTo(0.9772, 4);
    });

    it('should return values between 0 and 1', () => {
      const dist = new NormalDistribution(0, 1);

      expect(dist.cdf(-5)).toBeGreaterThan(0);
      expect(dist.cdf(-5)).toBeLessThan(1);
      expect(dist.cdf(5)).toBeGreaterThan(0);
      expect(dist.cdf(5)).toBeLessThan(1);
    });

    it('should be monotonically increasing', () => {
      const dist = new NormalDistribution(0, 1);

      expect(dist.cdf(-2)).toBeLessThan(dist.cdf(-1));
      expect(dist.cdf(-1)).toBeLessThan(dist.cdf(0));
      expect(dist.cdf(0)).toBeLessThan(dist.cdf(1));
      expect(dist.cdf(1)).toBeLessThan(dist.cdf(2));
    });
  });

  describe('inverseCDF', () => {
    it('should calculate inverse CDF correctly for standard normal', () => {
      const dist = new NormalDistribution(0, 1);

      // inverseCDF(0.5) should be mean (0)
      expect(dist.inverseCDF(0.5)).toBeCloseTo(0, 6);

      // inverseCDF(0.8413) should be ~1
      expect(dist.inverseCDF(0.8413)).toBeCloseTo(1, 2);

      // inverseCDF(0.1587) should be ~-1
      expect(dist.inverseCDF(0.1587)).toBeCloseTo(-1, 2);
    });

    it('should throw error for invalid probabilities', () => {
      const dist = new NormalDistribution(0, 1);

      expect(() => dist.inverseCDF(-0.1)).toThrow('Probability must be between 0 and 1');
      expect(() => dist.inverseCDF(1.1)).toThrow('Probability must be between 0 and 1');
    });

    it('should be inverse of CDF', () => {
      const dist = new NormalDistribution(100, 15);

      const x = 110;
      const p = dist.cdf(x);
      const xRecovered = dist.inverseCDF(p);

      expect(xRecovered).toBeCloseTo(x, 4);
    });
  });

  describe('validateParameters', () => {
    it('should return true for valid parameters', () => {
      const dist = new NormalDistribution(100, 15);
      expect(dist.validateParameters()).toBe(true);
    });

    it('should throw for invalid parameters in constructor', () => {
      expect(() => new NormalDistribution(100, 0)).toThrow();
      expect(() => new NormalDistribution(100, -5)).toThrow();
    });

    it('should throw for non-finite mean', () => {
      expect(() => new NormalDistribution(NaN, 1)).toThrow('Mean must be finite');
      expect(() => new NormalDistribution(Infinity, 1)).toThrow('Mean must be finite');
      expect(() => new NormalDistribution(-Infinity, 1)).toThrow('Mean must be finite');
    });

    it('should throw for non-finite stddev', () => {
      expect(() => new NormalDistribution(0, NaN)).toThrow('Standard deviation must be finite');
      expect(() => new NormalDistribution(0, Infinity)).toThrow('Standard deviation must be finite');
    });
  });

  describe('properties', () => {
    it('should expose mean and stddev properties', () => {
      const dist = new NormalDistribution(100, 15);

      expect(dist.mean).toBe(100);
      expect(dist.stddev).toBe(15);
    });
  });

  describe('inverseCDF edge cases', () => {
    it('should return -Infinity for p=0', () => {
      const dist = new NormalDistribution(0, 1);
      expect(dist.inverseCDF(0)).toBe(-Infinity);
    });

    it('should return Infinity for p=1', () => {
      const dist = new NormalDistribution(0, 1);
      expect(dist.inverseCDF(1)).toBe(Infinity);
    });
  });
});
