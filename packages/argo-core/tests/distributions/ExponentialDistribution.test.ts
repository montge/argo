import { ExponentialDistribution } from '../../src/distributions/ExponentialDistribution';
import { SimpleRNG } from '../../src/utils/SimpleRNG';

describe('ExponentialDistribution', () => {
  let rng: SimpleRNG;

  beforeEach(() => {
    rng = new SimpleRNG(42); // Seeded for reproducibility
  });

  describe('constructor', () => {
    it('should create distribution with valid parameter', () => {
      const dist = new ExponentialDistribution(2.0);
      expect(dist).toBeInstanceOf(ExponentialDistribution);
      expect(dist.lambda).toBe(2.0);
    });

    it('should throw error when lambda is zero', () => {
      expect(() => new ExponentialDistribution(0)).toThrow('Lambda (rate) must be positive');
    });

    it('should throw error when lambda is negative', () => {
      expect(() => new ExponentialDistribution(-1)).toThrow('Lambda (rate) must be positive');
    });

    it('should accept very small positive lambda', () => {
      expect(() => new ExponentialDistribution(0.001)).not.toThrow();
    });

    it('should accept very large lambda', () => {
      expect(() => new ExponentialDistribution(1000)).not.toThrow();
    });
  });

  describe('sample', () => {
    it('should generate non-negative samples only', () => {
      const dist = new ExponentialDistribution(1.0);
      const samples: number[] = [];

      for (let i = 0; i < 1000; i++) {
        samples.push(dist.sample(rng));
      }

      // All samples must be non-negative
      expect(samples.every(x => x >= 0)).toBe(true);
      expect(samples.every(x => typeof x === 'number' && !isNaN(x) && isFinite(x))).toBe(true);
    });

    it('should generate samples with correct mean', () => {
      const lambda = 2.0;
      const dist = new ExponentialDistribution(lambda);
      const samples: number[] = [];

      for (let i = 0; i < 5000; i++) {
        samples.push(dist.sample(rng));
      }

      // Expected mean: 1/lambda = 0.5
      const expectedMean = 1 / lambda;
      const sampleMean = samples.reduce((a, b) => a + b) / samples.length;

      // Allow 10% tolerance
      expect(sampleMean).toBeGreaterThan(expectedMean * 0.9);
      expect(sampleMean).toBeLessThan(expectedMean * 1.1);
    });

    it('should generate samples with correct variance', () => {
      const lambda = 1.0;
      const dist = new ExponentialDistribution(lambda);
      const samples: number[] = [];

      for (let i = 0; i < 5000; i++) {
        samples.push(dist.sample(rng));
      }

      const sampleMean = samples.reduce((a, b) => a + b) / samples.length;
      const sampleVariance = samples.reduce((sum, x) => sum + Math.pow(x - sampleMean, 2), 0) / (samples.length - 1);

      // Expected variance: 1/lambda^2 = 1
      const expectedVariance = 1 / (lambda * lambda);

      // Allow 20% tolerance for variance
      expect(sampleVariance).toBeGreaterThan(expectedVariance * 0.8);
      expect(sampleVariance).toBeLessThan(expectedVariance * 1.2);
    });

    it('should generate different values with different seeds', () => {
      const dist = new ExponentialDistribution(1.0);
      const rng1 = new SimpleRNG(42);
      const rng2 = new SimpleRNG(99);

      const sample1 = dist.sample(rng1);
      const sample2 = dist.sample(rng2);

      expect(sample1).not.toBe(sample2);
    });

    it('should generate reproducible values with same seed', () => {
      const dist = new ExponentialDistribution(1.0);
      const rng1 = new SimpleRNG(42);
      const rng2 = new SimpleRNG(42);

      const sample1 = dist.sample(rng1);
      const sample2 = dist.sample(rng2);

      expect(sample1).toBe(sample2);
    });

    it('should handle high rate (small mean)', () => {
      const dist = new ExponentialDistribution(10.0); // mean = 0.1
      const samples: number[] = [];

      for (let i = 0; i < 1000; i++) {
        samples.push(dist.sample(rng));
      }

      const sampleMean = samples.reduce((a, b) => a + b) / samples.length;
      expect(sampleMean).toBeGreaterThan(0.08);
      expect(sampleMean).toBeLessThan(0.12);
    });

    it('should handle low rate (large mean)', () => {
      const dist = new ExponentialDistribution(0.1); // mean = 10
      const samples: number[] = [];

      for (let i = 0; i < 1000; i++) {
        samples.push(dist.sample(rng));
      }

      const sampleMean = samples.reduce((a, b) => a + b) / samples.length;
      expect(sampleMean).toBeGreaterThan(8);
      expect(sampleMean).toBeLessThan(12);
    });
  });

  describe('pdf', () => {
    it('should return 0 for negative values', () => {
      const dist = new ExponentialDistribution(1.0);

      expect(dist.pdf(-1)).toBe(0);
      expect(dist.pdf(-100)).toBe(0);
    });

    it('should calculate PDF correctly at x=0', () => {
      const lambda = 2.0;
      const dist = new ExponentialDistribution(lambda);

      // PDF at x=0: lambda * exp(0) = lambda
      expect(dist.pdf(0)).toBeCloseTo(lambda, 6);
    });

    it('should calculate PDF correctly for positive values', () => {
      const lambda = 1.0;
      const dist = new ExponentialDistribution(lambda);

      // PDF(1) = 1 * exp(-1) = 0.3679
      expect(dist.pdf(1)).toBeCloseTo(0.3679, 4);

      // PDF(2) = 1 * exp(-2) = 0.1353
      expect(dist.pdf(2)).toBeCloseTo(0.1353, 4);
    });

    it('should be monotonically decreasing', () => {
      const dist = new ExponentialDistribution(1.0);

      expect(dist.pdf(0)).toBeGreaterThan(dist.pdf(1));
      expect(dist.pdf(1)).toBeGreaterThan(dist.pdf(2));
      expect(dist.pdf(2)).toBeGreaterThan(dist.pdf(5));
      expect(dist.pdf(5)).toBeGreaterThan(dist.pdf(10));
    });

    it('should have PDF integrate to approximately 1', () => {
      const dist = new ExponentialDistribution(1.0);

      // Numerical integration using trapezoidal rule
      let sum = 0;
      const dx = 0.01;
      for (let x = 0; x < 20; x += dx) {
        sum += dist.pdf(x) * dx;
      }

      // Should be close to 1
      expect(sum).toBeGreaterThan(0.98);
      expect(sum).toBeLessThan(1.02);
    });

    it('should scale correctly with lambda', () => {
      const dist1 = new ExponentialDistribution(1.0);
      const dist2 = new ExponentialDistribution(2.0);

      // At x=0, PDF = lambda
      expect(dist1.pdf(0)).toBeCloseTo(1.0, 6);
      expect(dist2.pdf(0)).toBeCloseTo(2.0, 6);
    });

    it('should handle edge cases', () => {
      const dist = new ExponentialDistribution(1.0);

      // Very small positive values
      expect(dist.pdf(0.001)).toBeGreaterThan(0);
      expect(isFinite(dist.pdf(0.001))).toBe(true);

      // Very large values
      expect(dist.pdf(100)).toBeGreaterThan(0);
      expect(dist.pdf(100)).toBeLessThan(1e-40);
    });
  });

  describe('cdf', () => {
    it('should return 0 for negative values', () => {
      const dist = new ExponentialDistribution(1.0);

      expect(dist.cdf(-1)).toBe(0);
      expect(dist.cdf(-100)).toBe(0);
    });

    it('should return 0 at x=0', () => {
      const dist = new ExponentialDistribution(1.0);
      expect(dist.cdf(0)).toBe(0);
    });

    it('should calculate CDF correctly', () => {
      const lambda = 1.0;
      const dist = new ExponentialDistribution(lambda);

      // CDF(1) = 1 - exp(-1) = 0.6321
      expect(dist.cdf(1)).toBeCloseTo(0.6321, 4);

      // CDF(2) = 1 - exp(-2) = 0.8647
      expect(dist.cdf(2)).toBeCloseTo(0.8647, 4);
    });

    it('should be monotonically increasing', () => {
      const dist = new ExponentialDistribution(1.0);

      expect(dist.cdf(0)).toBeLessThan(dist.cdf(1));
      expect(dist.cdf(1)).toBeLessThan(dist.cdf(2));
      expect(dist.cdf(2)).toBeLessThan(dist.cdf(5));
      expect(dist.cdf(5)).toBeLessThan(dist.cdf(10));
    });

    it('should approach 1 as x approaches infinity', () => {
      const dist = new ExponentialDistribution(1.0);

      expect(dist.cdf(10)).toBeGreaterThan(0.99);
      expect(dist.cdf(20)).toBeGreaterThan(0.999);
      expect(dist.cdf(100)).toBeGreaterThan(0.9999);
    });

    it('should be consistent with PDF', () => {
      const dist = new ExponentialDistribution(1.0);

      // CDF should increase where PDF is positive
      const x = 2;
      const cdf1 = dist.cdf(x);
      const cdf2 = dist.cdf(x + 0.1);

      expect(cdf2).toBeGreaterThan(cdf1);
    });

    it('should satisfy memoryless property', () => {
      const dist = new ExponentialDistribution(1.0);

      // P(X > s+t | X > s) = P(X > t)
      // Equivalently: (1 - CDF(s+t)) / (1 - CDF(s)) ≈ 1 - CDF(t)
      const s = 2;
      const t = 3;

      const conditional = (1 - dist.cdf(s + t)) / (1 - dist.cdf(s));
      const marginal = 1 - dist.cdf(t);

      expect(conditional).toBeCloseTo(marginal, 6);
    });

    it('should handle different lambda values', () => {
      const dist1 = new ExponentialDistribution(0.5);
      const dist2 = new ExponentialDistribution(2.0);

      // Higher lambda means faster convergence to 1
      expect(dist2.cdf(1)).toBeGreaterThan(dist1.cdf(1));
    });
  });

  describe('inverseCDF', () => {
    it('should throw error for p < 0', () => {
      const dist = new ExponentialDistribution(1.0);

      expect(() => dist.inverseCDF(-0.5)).toThrow('Probability must be in [0, 1)');
    });

    it('should throw error for p >= 1', () => {
      const dist = new ExponentialDistribution(1.0);

      expect(() => dist.inverseCDF(1)).toThrow('Probability must be in [0, 1)');
      expect(() => dist.inverseCDF(1.5)).toThrow('Probability must be in [0, 1)');
    });

    it('should return 0 for p=0', () => {
      const dist = new ExponentialDistribution(1.0);
      expect(dist.inverseCDF(0)).toBe(0);
    });

    it('should be consistent with CDF', () => {
      const dist = new ExponentialDistribution(1.0);
      const testValues = [0, 0.1, 0.25, 0.5, 0.75, 0.9, 0.99];

      for (const p of testValues) {
        const x = dist.inverseCDF(p);
        const pComputed = dist.cdf(x);
        expect(pComputed).toBeCloseTo(p, 6);
      }
    });

    it('should return non-negative values', () => {
      const dist = new ExponentialDistribution(1.0);

      expect(dist.inverseCDF(0)).toBe(0);
      expect(dist.inverseCDF(0.5)).toBeGreaterThan(0);
      expect(dist.inverseCDF(0.9)).toBeGreaterThan(0);
    });

    it('should calculate median correctly', () => {
      const lambda = 1.0;
      const dist = new ExponentialDistribution(lambda);

      // Median = ln(2) / lambda
      const expectedMedian = Math.log(2) / lambda;
      expect(dist.inverseCDF(0.5)).toBeCloseTo(expectedMedian, 6);
    });

    it('should handle extreme probabilities', () => {
      const dist = new ExponentialDistribution(1.0);

      // Very small probability
      const x1 = dist.inverseCDF(0.001);
      expect(x1).toBeGreaterThan(0);
      expect(x1).toBeLessThan(0.1);

      // Very large probability
      const x2 = dist.inverseCDF(0.999);
      expect(x2).toBeGreaterThan(5);
      expect(isFinite(x2)).toBe(true);
    });

    it('should work with different lambda values', () => {
      const dist1 = new ExponentialDistribution(0.5);
      const dist2 = new ExponentialDistribution(2.0);

      // For same probability, higher lambda gives smaller quantile
      expect(dist2.inverseCDF(0.5)).toBeLessThan(dist1.inverseCDF(0.5));
    });
  });

  describe('mean', () => {
    it('should calculate mean correctly', () => {
      const lambda = 2.0;
      const dist = new ExponentialDistribution(lambda);

      // Mean = 1/lambda = 0.5
      expect(dist.mean).toBeCloseTo(1 / lambda, 10);
    });

    it('should handle different lambda values', () => {
      const dist1 = new ExponentialDistribution(0.5);
      expect(dist1.mean).toBeCloseTo(2.0, 10);

      const dist2 = new ExponentialDistribution(5.0);
      expect(dist2.mean).toBeCloseTo(0.2, 10);
    });
  });

  describe('variance', () => {
    it('should calculate variance correctly', () => {
      const lambda = 2.0;
      const dist = new ExponentialDistribution(lambda);

      // Variance = 1/lambda^2 = 0.25
      expect(dist.variance).toBeCloseTo(1 / (lambda * lambda), 10);
    });

    it('should handle different lambda values', () => {
      const dist1 = new ExponentialDistribution(1.0);
      expect(dist1.variance).toBeCloseTo(1.0, 10);

      const dist2 = new ExponentialDistribution(4.0);
      expect(dist2.variance).toBeCloseTo(0.0625, 10);
    });

    it('should always be positive', () => {
      const dist1 = new ExponentialDistribution(0.1);
      const dist2 = new ExponentialDistribution(10);

      expect(dist1.variance).toBeGreaterThan(0);
      expect(dist2.variance).toBeGreaterThan(0);
    });
  });

  describe('performance', () => {
    it('should generate samples efficiently', () => {
      const dist = new ExponentialDistribution(1.0);
      const startTime = Date.now();

      for (let i = 0; i < 100000; i++) {
        dist.sample(rng);
      }

      const endTime = Date.now();
      const elapsed = endTime - startTime;

      // Should generate 100k samples in under 200ms (relaxed for CI environments)
      expect(elapsed).toBeLessThan(200);
    });
  });
});
