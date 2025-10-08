import { PoissonDistribution } from '../../src/distributions/PoissonDistribution';
import { SimpleRNG } from '../../src/utils/SimpleRNG';

describe('PoissonDistribution', () => {
  let rng: SimpleRNG;

  beforeEach(() => {
    rng = new SimpleRNG(42); // Seeded for reproducibility
  });

  describe('constructor', () => {
    it('should create distribution with valid parameter', () => {
      const dist = new PoissonDistribution(5);
      expect(dist).toBeInstanceOf(PoissonDistribution);
      expect(dist.lambda).toBe(5);
    });

    it('should throw error when lambda is zero', () => {
      expect(() => new PoissonDistribution(0)).toThrow('Lambda must be positive');
    });

    it('should throw error when lambda is negative', () => {
      expect(() => new PoissonDistribution(-2)).toThrow('Lambda must be positive');
    });

    it('should throw error for NaN parameter', () => {
      expect(() => new PoissonDistribution(NaN)).toThrow('Lambda must be a finite number');
    });

    it('should throw error for infinite parameter', () => {
      expect(() => new PoissonDistribution(Infinity)).toThrow('Lambda must be a finite number');
    });

    it('should accept very small positive lambda', () => {
      const dist = new PoissonDistribution(0.001);
      expect(dist.lambda).toBe(0.001);
    });

    it('should accept large lambda values', () => {
      const dist = new PoissonDistribution(100);
      expect(dist.lambda).toBe(100);
    });
  });

  describe('sample', () => {
    it('should return non-negative integer values', () => {
      const dist = new PoissonDistribution(3);
      const rng1 = new SimpleRNG(123);

      for (let i = 0; i < 100; i++) {
        const sample = dist.sample(rng1);
        expect(Number.isInteger(sample)).toBe(true);
        expect(sample).toBeGreaterThanOrEqual(0);
      }
    });

    it('should produce samples with mean close to lambda', () => {
      const lambda = 10;
      const dist = new PoissonDistribution(lambda);
      const rng1 = new SimpleRNG(456);

      const samples = Array.from({ length: 5000 }, () => dist.sample(rng1));
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;

      expect(mean).toBeGreaterThan(lambda * 0.95);
      expect(mean).toBeLessThan(lambda * 1.05);
    });

    it('should produce samples with variance close to lambda', () => {
      const lambda = 15;
      const dist = new PoissonDistribution(lambda);
      const rng1 = new SimpleRNG(789);

      const samples = Array.from({ length: 5000 }, () => dist.sample(rng1));
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      const variance =
        samples.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / samples.length;

      expect(variance).toBeGreaterThan(lambda * 0.9);
      expect(variance).toBeLessThan(lambda * 1.1);
    });

    it('should mostly return 0 for very small lambda', () => {
      const dist = new PoissonDistribution(0.01);
      const rng1 = new SimpleRNG(111);

      const samples = Array.from({ length: 100 }, () => dist.sample(rng1));
      const zeros = samples.filter(x => x === 0).length;

      expect(zeros).toBeGreaterThan(95); // Should be ~99%
    });

    it('should be reproducible with same seed', () => {
      const dist = new PoissonDistribution(5);

      const rng1 = new SimpleRNG(999);
      const rng2 = new SimpleRNG(999);

      const samples1 = Array.from({ length: 10 }, () => dist.sample(rng1));
      const samples2 = Array.from({ length: 10 }, () => dist.sample(rng2));

      expect(samples1).toEqual(samples2);
    });

    it('should produce different samples with different seeds', () => {
      const dist = new PoissonDistribution(5);

      const rng1 = new SimpleRNG(111);
      const rng2 = new SimpleRNG(222);

      const samples1 = Array.from({ length: 10 }, () => dist.sample(rng1));
      const samples2 = Array.from({ length: 10 }, () => dist.sample(rng2));

      expect(samples1).not.toEqual(samples2);
    });
  });

  describe('pmf (probability mass function)', () => {
    it('should return 0 for negative k', () => {
      const dist = new PoissonDistribution(5);
      expect(dist.pmf(-1)).toBe(0);
      expect(dist.pmf(-10)).toBe(0);
    });

    it('should return 0 for non-integer k', () => {
      const dist = new PoissonDistribution(5);
      expect(dist.pmf(2.5)).toBe(0);
      expect(dist.pmf(7.3)).toBe(0);
    });

    it('should calculate correct PMF for lambda=1', () => {
      const dist = new PoissonDistribution(1);

      // Poisson(1) probabilities: e^-1, e^-1, e^-1/2, e^-1/6, ...
      const e = Math.E;
      expect(dist.pmf(0)).toBeCloseTo(1 / e, 10);
      expect(dist.pmf(1)).toBeCloseTo(1 / e, 10);
      expect(dist.pmf(2)).toBeCloseTo(1 / (2 * e), 10);
      expect(dist.pmf(3)).toBeCloseTo(1 / (6 * e), 10);
    });

    it('should have maximum probability near lambda', () => {
      const lambda = 10;
      const dist = new PoissonDistribution(lambda);

      const probAtLambda = dist.pmf(lambda);
      expect(probAtLambda).toBeGreaterThan(dist.pmf(0));
      expect(probAtLambda).toBeGreaterThan(dist.pmf(5));
      expect(probAtLambda).toBeGreaterThan(dist.pmf(15));
      expect(probAtLambda).toBeGreaterThan(dist.pmf(20));
    });

    it('should return probabilities that sum close to 1', () => {
      const dist = new PoissonDistribution(5);

      let sum = 0;
      // Sum first 30 terms (should cover >99.99% of probability mass)
      for (let k = 0; k < 30; k++) {
        sum += dist.pmf(k);
      }

      expect(sum).toBeGreaterThan(0.999);
      expect(sum).toBeLessThan(1.001); // Allow small numerical error
    });

    it('should return non-negative probabilities', () => {
      const dist = new PoissonDistribution(7);

      for (let k = 0; k < 30; k++) {
        expect(dist.pmf(k)).toBeGreaterThanOrEqual(0);
      }
    });

    it('should handle very small lambda', () => {
      const dist = new PoissonDistribution(0.1);

      // Most probability at k=0
      expect(dist.pmf(0)).toBeGreaterThan(0.9);
      expect(dist.pmf(1)).toBeLessThan(0.1);
    });

    it('should handle large lambda with large k', () => {
      const dist = new PoissonDistribution(50);

      // Should not overflow/underflow
      const prob = dist.pmf(50);
      expect(isFinite(prob)).toBe(true);
      expect(prob).toBeGreaterThan(0);
    });
  });

  describe('cdf (cumulative distribution function)', () => {
    it('should return 0 for k < 0', () => {
      const dist = new PoissonDistribution(5);
      expect(dist.cdf(-1)).toBe(0);
      expect(dist.cdf(-10)).toBe(0);
    });

    it('should approach 1 for large k', () => {
      const dist = new PoissonDistribution(5);
      expect(dist.cdf(20)).toBeGreaterThan(0.9999);
      expect(dist.cdf(30)).toBeGreaterThan(0.99999);
    });

    it('should be monotonically increasing', () => {
      const dist = new PoissonDistribution(8);

      for (let k = 0; k < 30; k++) {
        expect(dist.cdf(k + 1)).toBeGreaterThanOrEqual(dist.cdf(k));
      }
    });

    it('should equal sum of PMF up to k', () => {
      const dist = new PoissonDistribution(6);

      for (let k = 0; k < 20; k++) {
        let sum = 0;
        for (let i = 0; i <= k; i++) {
          sum += dist.pmf(i);
        }
        expect(dist.cdf(k)).toBeCloseTo(sum, 10);
      }
    });

    it('should calculate CDF for lambda=1', () => {
      const dist = new PoissonDistribution(1);
      const e = Math.E;

      // CDF(0) = e^-1
      expect(dist.cdf(0)).toBeCloseTo(1 / e, 10);

      // CDF(1) = e^-1 × (1 + 1) = 2/e
      expect(dist.cdf(1)).toBeCloseTo(2 / e, 10);
    });

    it('should handle non-integer k by flooring', () => {
      const dist = new PoissonDistribution(5);

      // CDF(5.7) should equal CDF(5)
      expect(dist.cdf(5.7)).toBeCloseTo(dist.cdf(5), 10);
      expect(dist.cdf(2.3)).toBeCloseTo(dist.cdf(2), 10);
    });

    it('should handle very small lambda', () => {
      const dist = new PoissonDistribution(0.01);
      expect(dist.cdf(0)).toBeGreaterThan(0.99);
    });

    it('should handle large lambda', () => {
      const dist = new PoissonDistribution(100);
      const cdf50 = dist.cdf(50);
      const cdf100 = dist.cdf(100);
      const cdf150 = dist.cdf(150);

      expect(cdf50).toBeLessThan(cdf100);
      expect(cdf100).toBeLessThan(cdf150);
      expect(isFinite(cdf100)).toBe(true);
    });
  });

  describe('inverseCDF (quantile function)', () => {
    it('should throw error for p < 0', () => {
      const dist = new PoissonDistribution(5);
      expect(() => dist.inverseCDF(-0.1)).toThrow('Probability must be between 0 and 1');
    });

    it('should throw error for p > 1', () => {
      const dist = new PoissonDistribution(5);
      expect(() => dist.inverseCDF(1.1)).toThrow('Probability must be between 0 and 1');
    });

    it('should return 0 for p=0', () => {
      const dist = new PoissonDistribution(5);
      expect(dist.inverseCDF(0)).toBe(0);
    });

    it('should return large value for p=1', () => {
      const dist = new PoissonDistribution(5);
      const result = dist.inverseCDF(1);
      expect(result).toBeGreaterThan(10);
      expect(Number.isInteger(result)).toBe(true);
    });

    it('should satisfy: CDF(inverseCDF(p)) >= p', () => {
      const dist = new PoissonDistribution(8);

      for (let p = 0.1; p < 1; p += 0.1) {
        const k = dist.inverseCDF(p);
        expect(dist.cdf(k)).toBeGreaterThanOrEqual(p - 1e-10);
      }
    });

    it('should return integer values', () => {
      const dist = new PoissonDistribution(10);

      for (let p = 0; p <= 1; p += 0.05) {
        const k = dist.inverseCDF(p);
        expect(Number.isInteger(k)).toBe(true);
      }
    });

    it('should be monotonically non-decreasing', () => {
      const dist = new PoissonDistribution(7);

      let prevK = dist.inverseCDF(0);
      for (let p = 0.05; p <= 1; p += 0.05) {
        const k = dist.inverseCDF(p);
        expect(k).toBeGreaterThanOrEqual(prevK);
        prevK = k;
      }
    });

    it('should return median close to lambda for moderate lambda', () => {
      const lambda = 20;
      const dist = new PoissonDistribution(lambda);

      const median = dist.inverseCDF(0.5);
      expect(median).toBeGreaterThan(lambda - 3);
      expect(median).toBeLessThan(lambda + 3);
    });

    it('should handle very small lambda', () => {
      const dist = new PoissonDistribution(0.1);
      expect(dist.inverseCDF(0.5)).toBe(0);
      expect(dist.inverseCDF(0.95)).toBeLessThan(5);
    });

    it('should handle large lambda', () => {
      const dist = new PoissonDistribution(100);
      const q50 = dist.inverseCDF(0.5);
      const q95 = dist.inverseCDF(0.95);

      expect(q50).toBeGreaterThan(90);
      expect(q50).toBeLessThan(110);
      expect(q95).toBeGreaterThan(q50);
    });
  });

  describe('mean', () => {
    it('should return lambda', () => {
      const dist = new PoissonDistribution(7);
      expect(dist.mean).toBe(7);
    });

    it('should work for small lambda', () => {
      const dist = new PoissonDistribution(0.5);
      expect(dist.mean).toBe(0.5);
    });

    it('should work for large lambda', () => {
      const dist = new PoissonDistribution(100);
      expect(dist.mean).toBe(100);
    });

    it('should be consistent with sample mean', () => {
      const lambda = 12;
      const dist = new PoissonDistribution(lambda);
      const rng1 = new SimpleRNG(555);

      const samples = Array.from({ length: 10000 }, () => dist.sample(rng1));
      const sampleMean = samples.reduce((a, b) => a + b, 0) / samples.length;

      expect(sampleMean).toBeGreaterThan(dist.mean * 0.98);
      expect(sampleMean).toBeLessThan(dist.mean * 1.02);
    });
  });

  describe('variance', () => {
    it('should return lambda', () => {
      const dist = new PoissonDistribution(9);
      expect(dist.variance).toBe(9);
    });

    it('should equal mean for Poisson distribution', () => {
      const dist = new PoissonDistribution(15);
      expect(dist.variance).toBe(dist.mean);
    });

    it('should work for small lambda', () => {
      const dist = new PoissonDistribution(0.3);
      expect(dist.variance).toBe(0.3);
    });

    it('should work for large lambda', () => {
      const dist = new PoissonDistribution(200);
      expect(dist.variance).toBe(200);
    });
  });

  describe('validateParameters', () => {
    it('should return true for valid parameters', () => {
      const dist = new PoissonDistribution(5);
      expect(dist.validateParameters()).toBe(true);
    });

    it('should throw error for invalid lambda', () => {
      const dist = new PoissonDistribution(5);
      (dist as any).lambda = -2;
      expect(() => dist.validateParameters()).toThrow('Lambda must be positive');
    });

    it('should throw error for non-finite lambda', () => {
      const dist = new PoissonDistribution(5);
      (dist as any).lambda = Infinity;
      expect(() => dist.validateParameters()).toThrow('Lambda must be a finite number');
    });
  });

  describe('performance', () => {
    it('should sample efficiently for small lambda', () => {
      const dist = new PoissonDistribution(3);
      const rng1 = new SimpleRNG(777);

      const start = Date.now();
      for (let i = 0; i < 10000; i++) {
        dist.sample(rng1);
      }
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000); // Should complete in < 1 second
    });

    it('should sample efficiently for large lambda', () => {
      const dist = new PoissonDistribution(100);
      const rng1 = new SimpleRNG(888);

      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        dist.sample(rng1);
      }
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000); // Should complete in < 1 second
    });
  });

  describe('edge cases', () => {
    it('should handle very small lambda (rare events)', () => {
      const dist = new PoissonDistribution(0.001);
      const rng1 = new SimpleRNG(999);

      const samples = Array.from({ length: 1000 }, () => dist.sample(rng1));
      const mean = samples.reduce((a, b) => a + b) / samples.length;

      // Should be very close to 0
      expect(mean).toBeLessThan(0.01);
    });

    it('should handle lambda=1 (common case)', () => {
      const dist = new PoissonDistribution(1);

      expect(dist.mean).toBe(1);
      expect(dist.variance).toBe(1);
      expect(dist.pmf(0)).toBeCloseTo(1 / Math.E, 5);
      expect(dist.pmf(1)).toBeCloseTo(1 / Math.E, 5);
    });

    it('should approximate normal for large lambda', () => {
      // For large lambda, Poisson approximates Normal(λ, λ)
      const lambda = 100;
      const dist = new PoissonDistribution(lambda);
      const rng1 = new SimpleRNG(12345);

      const samples = Array.from({ length: 5000 }, () => dist.sample(rng1));
      const mean = samples.reduce((a, b) => a + b) / samples.length;
      const variance =
        samples.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / samples.length;

      // Should approximate normal
      expect(mean).toBeGreaterThan(lambda * 0.98);
      expect(mean).toBeLessThan(lambda * 1.02);
      expect(variance).toBeGreaterThan(lambda * 0.95);
      expect(variance).toBeLessThan(lambda * 1.05);
    });

    it('should handle PMF calculation for k=0', () => {
      const lambda = 5;
      const dist = new PoissonDistribution(lambda);

      // P(X=0) = e^-λ
      expect(dist.pmf(0)).toBeCloseTo(Math.exp(-lambda), 10);
    });

    it('should handle very large k with large lambda', () => {
      const dist = new PoissonDistribution(50);

      // Should not overflow/underflow
      const prob = dist.pmf(100);
      expect(isFinite(prob)).toBe(true);
      expect(prob).toBeGreaterThan(0);
      expect(prob).toBeLessThan(0.01); // Should be very small but not 0
    });
  });
});
