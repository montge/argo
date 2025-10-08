import { ParetoDistribution } from '../../src/distributions/ParetoDistribution';
import { SimpleRNG } from '../../src/utils/SimpleRNG';

describe('ParetoDistribution', () => {
  let rng: SimpleRNG;

  beforeEach(() => {
    rng = new SimpleRNG(12345);
  });

  describe('constructor', () => {
    it('should create distribution with valid parameters', () => {
      const dist = new ParetoDistribution(1, 2);
      expect(dist).toBeInstanceOf(ParetoDistribution);
      expect(dist.scale).toBe(1);
      expect(dist.shape).toBe(2);
      expect(dist.name).toBe('Pareto');
    });

    it('should throw error for non-positive scale parameter', () => {
      expect(() => new ParetoDistribution(0, 2)).toThrow('Scale must be positive');
      expect(() => new ParetoDistribution(-1, 2)).toThrow('Scale must be positive');
    });

    it('should throw error for non-positive shape parameter', () => {
      expect(() => new ParetoDistribution(1, 0)).toThrow('Shape must be positive');
      expect(() => new ParetoDistribution(1, -1)).toThrow('Shape must be positive');
    });

    it('should throw error for NaN parameters', () => {
      expect(() => new ParetoDistribution(NaN, 2)).toThrow(
        'Parameters must be finite numbers'
      );
      expect(() => new ParetoDistribution(1, NaN)).toThrow(
        'Parameters must be finite numbers'
      );
    });

    it('should throw error for infinite parameters', () => {
      expect(() => new ParetoDistribution(Infinity, 2)).toThrow(
        'Parameters must be finite numbers'
      );
      expect(() => new ParetoDistribution(1, Infinity)).toThrow(
        'Parameters must be finite numbers'
      );
    });

    it('should accept very small positive scale values', () => {
      const dist = new ParetoDistribution(0.1, 2);
      expect(dist.scale).toBe(0.1);
    });

    it('should accept very large scale values', () => {
      const dist = new ParetoDistribution(1000, 2);
      expect(dist.scale).toBe(1000);
    });

    it('should accept different shape values', () => {
      const dist1 = new ParetoDistribution(1, 0.5);
      const dist2 = new ParetoDistribution(1, 5);
      expect(dist1.shape).toBe(0.5);
      expect(dist2.shape).toBe(5);
    });
  });

  describe('sample', () => {
    it('should generate samples >= scale (minimum value)', () => {
      const scale = 2;
      const dist = new ParetoDistribution(scale, 3);
      for (let i = 0; i < 100; i++) {
        const sample = dist.sample(rng);
        expect(sample).toBeGreaterThanOrEqual(scale);
        expect(isFinite(sample)).toBe(true);
      }
    });

    it('should generate different samples for different seeds', () => {
      const dist = new ParetoDistribution(1, 2);
      const rng1 = new SimpleRNG(123);
      const rng2 = new SimpleRNG(456);

      const sample1 = dist.sample(rng1);
      const sample2 = dist.sample(rng2);

      expect(sample1).not.toBe(sample2);
    });

    it('should generate reproducible samples with same seed', () => {
      const dist = new ParetoDistribution(1, 2);
      const rng1 = new SimpleRNG(12345);
      const rng2 = new SimpleRNG(12345);

      const samples1 = Array.from({ length: 10 }, () => dist.sample(rng1));
      const samples2 = Array.from({ length: 10 }, () => dist.sample(rng2));

      expect(samples1).toEqual(samples2);
    });

    it('should have mean close to theoretical value for large sample (shape > 1)', () => {
      const scale = 1;
      const shape = 3; // Must be > 1 for finite mean
      const dist = new ParetoDistribution(scale, shape);
      const samples = Array.from({ length: 10000 }, () => dist.sample(rng));
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;

      // Theoretical mean = scale * shape / (shape - 1) = 1 * 3 / 2 = 1.5
      expect(mean).toBeGreaterThan(dist.mean * 0.95);
      expect(mean).toBeLessThan(dist.mean * 1.05);
    });

    it('should have variance close to theoretical value for large sample (shape > 2)', () => {
      const scale = 1;
      const shape = 3; // Must be > 2 for finite variance
      const dist = new ParetoDistribution(scale, shape);
      const samples = Array.from({ length: 10000 }, () => dist.sample(rng));
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      const variance =
        samples.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / samples.length;

      expect(variance).toBeGreaterThan(dist.variance * 0.75); // Relaxed for heavy-tailed distribution
      expect(variance).toBeLessThan(dist.variance * 1.25);
    });

    it('should handle shape < 1 correctly (heavy tail)', () => {
      const dist = new ParetoDistribution(1, 0.5);
      const samples = Array.from({ length: 1000 }, () => dist.sample(rng));

      samples.forEach((s) => {
        expect(s).toBeGreaterThanOrEqual(1);
        expect(isFinite(s)).toBe(true);
      });
    });

    it('should handle different scale values correctly', () => {
      const dist1 = new ParetoDistribution(1, 2);
      const dist2 = new ParetoDistribution(5, 2);

      const rng1 = new SimpleRNG(777);
      const rng2 = new SimpleRNG(777);

      const samples1 = Array.from({ length: 5000 }, () => dist1.sample(rng1));
      const samples2 = Array.from({ length: 5000 }, () => dist2.sample(rng2));

      const mean1 = samples1.reduce((a, b) => a + b, 0) / samples1.length;
      const mean2 = samples2.reduce((a, b) => a + b, 0) / samples2.length;

      // dist2 should have larger mean (larger scale)
      expect(mean2).toBeGreaterThan(mean1);
    });
  });

  describe('pdf', () => {
    it('should return 0 for x < scale', () => {
      const dist = new ParetoDistribution(2, 3);
      expect(dist.pdf(1)).toBe(0);
      expect(dist.pdf(1.5)).toBe(0);
      expect(dist.pdf(-1)).toBe(0);
    });

    it('should return positive density for x >= scale', () => {
      const dist = new ParetoDistribution(1, 2);
      expect(dist.pdf(1)).toBeGreaterThan(0);
      expect(dist.pdf(2)).toBeGreaterThan(0);
      expect(dist.pdf(5)).toBeGreaterThan(0);
    });

    it('should have maximum at x = scale', () => {
      const scale = 2;
      const dist = new ParetoDistribution(scale, 3);

      const pdfAtScale = dist.pdf(scale);
      const pdfAfter = dist.pdf(scale + 1);

      expect(pdfAtScale).toBeGreaterThan(pdfAfter);
    });

    it('should integrate to approximately 1 using trapezoidal rule', () => {
      const dist = new ParetoDistribution(1, 2);
      let integral = 0;
      const dx = 0.01;
      const maxX = 100;

      for (let x = 1; x <= maxX; x += dx) {
        integral += dist.pdf(x) * dx;
      }

      expect(integral).toBeGreaterThan(0.95);
      expect(integral).toBeLessThan(1.05);
    });

    it('should return very small values for very large x', () => {
      const dist = new ParetoDistribution(1, 2);
      expect(dist.pdf(100)).toBeLessThan(0.001);
      expect(dist.pdf(1000)).toBeLessThan(0.000001);
    });

    it('should handle very small shape values (heavy tails)', () => {
      const dist = new ParetoDistribution(1, 0.5);
      expect(dist.pdf(1)).toBeGreaterThan(0);
      expect(isFinite(dist.pdf(1))).toBe(true);
      expect(isFinite(dist.pdf(10))).toBe(true);
    });

    it('should handle very large shape values (light tails)', () => {
      const dist = new ParetoDistribution(1, 100);
      expect(dist.pdf(1)).toBeGreaterThan(0);
      expect(dist.pdf(2)).toBeLessThan(dist.pdf(1)); // Should decay quickly
    });
  });

  describe('cdf', () => {
    it('should return 0 for x < scale', () => {
      const dist = new ParetoDistribution(2, 3);
      expect(dist.cdf(1)).toBe(0);
      expect(dist.cdf(1.5)).toBe(0);
      expect(dist.cdf(-1)).toBe(0);
    });

    it('should return 0 at x = scale', () => {
      const dist = new ParetoDistribution(2, 3);
      expect(dist.cdf(2)).toBe(0);
    });

    it('should be monotonically increasing for x >= scale', () => {
      const dist = new ParetoDistribution(1, 2);
      const x1 = dist.cdf(2);
      const x2 = dist.cdf(3);
      const x3 = dist.cdf(4);

      expect(x2).toBeGreaterThan(x1);
      expect(x3).toBeGreaterThan(x2);
    });

    it('should approach 1 for large x', () => {
      const dist = new ParetoDistribution(1, 2);
      expect(dist.cdf(100)).toBeGreaterThan(0.99);
      expect(dist.cdf(1000)).toBeGreaterThan(0.999);
    });

    it('should be consistent with PDF through differentiation', () => {
      const dist = new ParetoDistribution(1, 2);
      const x = 2;
      const h = 0.0001;

      // Numerical derivative of CDF should approximate PDF
      const numericalDerivative = (dist.cdf(x + h) - dist.cdf(x - h)) / (2 * h);
      const pdfValue = dist.pdf(x);

      expect(numericalDerivative).toBeCloseTo(pdfValue, 3);
    });

    it('should handle different scale values correctly', () => {
      const dist1 = new ParetoDistribution(1, 2);
      const dist2 = new ParetoDistribution(2, 2);

      // At x=3, dist1 should have higher CDF (started accumulating earlier)
      expect(dist1.cdf(3)).toBeGreaterThan(dist2.cdf(3));
    });

    it('should handle very small shape values', () => {
      const dist = new ParetoDistribution(1, 0.1);
      expect(dist.cdf(1)).toBe(0);
      expect(dist.cdf(2)).toBeGreaterThan(0);
      expect(dist.cdf(2)).toBeLessThan(1);
      expect(dist.cdf(1000)).toBeGreaterThan(0.49); // Very small shape = very heavy tail, slow accumulation
    });
  });

  describe('inverseCDF', () => {
    it('should return scale for p=0', () => {
      const dist = new ParetoDistribution(2, 3);
      expect(dist.inverseCDF(0)).toBe(2);
    });

    it('should return large value for p approaching 1', () => {
      const dist = new ParetoDistribution(1, 2);
      const result = dist.inverseCDF(0.999);
      expect(result).toBeGreaterThan(10);
      expect(isFinite(result)).toBe(true);
    });

    it('should throw error for p < 0', () => {
      const dist = new ParetoDistribution(1, 2);
      expect(() => dist.inverseCDF(-0.1)).toThrow('Probability must be between 0 and 1');
    });

    it('should throw error for p > 1', () => {
      const dist = new ParetoDistribution(1, 2);
      expect(() => dist.inverseCDF(1.1)).toThrow('Probability must be between 0 and 1');
    });

    it('should be inverse of CDF', () => {
      const dist = new ParetoDistribution(1, 2);
      const testValues = [0.1, 0.25, 0.5, 0.75, 0.9];

      testValues.forEach((p) => {
        const x = dist.inverseCDF(p);
        const computedP = dist.cdf(x);
        expect(computedP).toBeCloseTo(p, 10);
      });
    });

    it('should satisfy: CDF(inverseCDF(p)) = p', () => {
      const dist = new ParetoDistribution(2, 3);
      const probabilities = [0.01, 0.1, 0.25, 0.5, 0.75, 0.9, 0.99];

      probabilities.forEach((p) => {
        const x = dist.inverseCDF(p);
        const recoveredP = dist.cdf(x);
        expect(recoveredP).toBeCloseTo(p, 10);
      });
    });

    it('should be monotonically increasing', () => {
      const dist = new ParetoDistribution(1, 2);
      const p1 = dist.inverseCDF(0.3);
      const p2 = dist.inverseCDF(0.5);
      const p3 = dist.inverseCDF(0.7);

      expect(p2).toBeGreaterThan(p1);
      expect(p3).toBeGreaterThan(p2);
    });

    it('should handle edge case p=1', () => {
      const dist = new ParetoDistribution(1, 2);
      const result = dist.inverseCDF(1);
      expect(result).toBe(Infinity);
    });

    it('should work with different shape values', () => {
      const dist1 = new ParetoDistribution(1, 0.5);
      const dist2 = new ParetoDistribution(1, 5);

      const q1 = dist1.inverseCDF(0.5);
      const q2 = dist2.inverseCDF(0.5);

      expect(q1).toBeGreaterThan(1);
      expect(q2).toBeGreaterThan(1);
      expect(isFinite(q1)).toBe(true);
      expect(isFinite(q2)).toBe(true);
    });
  });

  describe('mean', () => {
    it('should return Infinity for shape <= 1', () => {
      const dist1 = new ParetoDistribution(1, 0.5);
      const dist2 = new ParetoDistribution(1, 1);
      expect(dist1.mean).toBe(Infinity);
      expect(dist2.mean).toBe(Infinity);
    });

    it('should return finite value for shape > 1', () => {
      const dist = new ParetoDistribution(1, 2);
      // Mean = scale * shape / (shape - 1) = 1 * 2 / 1 = 2
      expect(dist.mean).toBe(2);
    });

    it('should be consistent with sample mean for shape > 1', () => {
      const dist = new ParetoDistribution(2, 3);
      const samples = Array.from({ length: 10000 }, () => dist.sample(rng));
      const sampleMean = samples.reduce((a, b) => a + b, 0) / samples.length;

      expect(sampleMean).toBeCloseTo(dist.mean, 0);
    });

    it('should scale linearly with scale parameter', () => {
      const dist1 = new ParetoDistribution(1, 3);
      const dist2 = new ParetoDistribution(2, 3);

      expect(dist2.mean).toBeCloseTo(dist1.mean * 2, 10);
    });
  });

  describe('variance', () => {
    it('should return Infinity for shape <= 2', () => {
      const dist1 = new ParetoDistribution(1, 0.5);
      const dist2 = new ParetoDistribution(1, 1.5);
      const dist3 = new ParetoDistribution(1, 2);
      expect(dist1.variance).toBe(Infinity);
      expect(dist2.variance).toBe(Infinity);
      expect(dist3.variance).toBe(Infinity);
    });

    it('should return finite value for shape > 2', () => {
      const dist = new ParetoDistribution(1, 3);
      // Variance = scale² * shape / ((shape-1)² * (shape-2))
      expect(dist.variance).toBeGreaterThan(0);
      expect(isFinite(dist.variance)).toBe(true);
    });

    it('should be consistent with sample variance for shape > 2', () => {
      const dist = new ParetoDistribution(1, 3);
      const samples = Array.from({ length: 10000 }, () => dist.sample(rng));
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      const sampleVariance =
        samples.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / samples.length;

      expect(sampleVariance).toBeCloseTo(dist.variance, 0);
    });
  });

  describe('validateParameters', () => {
    it('should return true for valid parameters', () => {
      const dist = new ParetoDistribution(1, 2);
      expect(dist.validateParameters()).toBe(true);
    });

    it('should throw error for non-positive scale', () => {
      const dist = new ParetoDistribution(1, 2);
      (dist as any).scale = 0;
      expect(() => dist.validateParameters()).toThrow('Scale must be positive');
    });

    it('should throw error for non-positive shape', () => {
      const dist = new ParetoDistribution(1, 2);
      (dist as any).shape = -1;
      expect(() => dist.validateParameters()).toThrow('Shape must be positive');
    });

    it('should throw error for infinite parameters', () => {
      const dist = new ParetoDistribution(1, 2);
      (dist as any).scale = Infinity;
      expect(() => dist.validateParameters()).toThrow('Parameters must be finite numbers');
    });
  });

  describe('performance', () => {
    it('should generate 100k samples in reasonable time', () => {
      const dist = new ParetoDistribution(1, 2);
      const start = Date.now();

      for (let i = 0; i < 100000; i++) {
        dist.sample(rng);
      }

      const elapsed = Date.now() - start;
      // Should generate 100k samples in under 200ms (relaxed for CI environments)
      expect(elapsed).toBeLessThan(200);
    });
  });

  describe('special cases', () => {
    it('should demonstrate 80/20 rule with shape close to log(5)/log(4) ≈ 1.16', () => {
      // Pareto with shape ≈ 1.16 gives the classic 80/20 rule
      const shape = Math.log(5) / Math.log(4);
      const dist = new ParetoDistribution(1, shape);

      // 80% of values should be below the 80th percentile
      const p80 = dist.inverseCDF(0.8);
      expect(p80).toBeGreaterThan(1);
      expect(isFinite(p80)).toBe(true);
    });

    it('should handle very small shape values (extremely heavy tail)', () => {
      const dist = new ParetoDistribution(1, 0.01);
      expect(dist.mean).toBe(Infinity);
      expect(dist.variance).toBe(Infinity);
      expect(isFinite(dist.pdf(1))).toBe(true);
      expect(isFinite(dist.cdf(100))).toBe(true);
    });

    it('should handle very large shape values (light tail)', () => {
      const dist = new ParetoDistribution(1, 100);
      expect(dist.mean).toBeCloseTo(1.0101, 3);
      expect(isFinite(dist.variance)).toBe(true);
      expect(isFinite(dist.pdf(1.5))).toBe(true);
      expect(isFinite(dist.cdf(1.5))).toBe(true);
    });

    it('should verify power law relationship', () => {
      const dist = new ParetoDistribution(1, 2);

      // For Pareto, P(X > x) = (scale/x)^shape for x >= scale
      const x = 5;
      const survivalProb = 1 - dist.cdf(x);
      const expectedSurvival = Math.pow(1 / x, 2);

      expect(survivalProb).toBeCloseTo(expectedSurvival, 5);
    });
  });
});
