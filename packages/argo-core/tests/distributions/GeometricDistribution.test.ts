import { GeometricDistribution } from '../../src/distributions/GeometricDistribution';
import { SimpleRNG } from '../../src/utils/SimpleRNG';

describe('GeometricDistribution', () => {
  let rng: SimpleRNG;

  beforeEach(() => {
    rng = new SimpleRNG(42); // Seeded for reproducibility
  });

  describe('constructor', () => {
    it('should create distribution with valid parameter', () => {
      const dist = new GeometricDistribution(0.5);
      expect(dist).toBeInstanceOf(GeometricDistribution);
      expect(dist.p).toBe(0.5);
    });

    it('should throw error when p is zero', () => {
      expect(() => new GeometricDistribution(0)).toThrow('p must be in (0, 1]');
    });

    it('should throw error when p is negative', () => {
      expect(() => new GeometricDistribution(-0.1)).toThrow('p must be in (0, 1]');
    });

    it('should throw error when p is greater than 1', () => {
      expect(() => new GeometricDistribution(1.1)).toThrow('p must be in (0, 1]');
    });

    it('should throw error for NaN parameter', () => {
      expect(() => new GeometricDistribution(NaN)).toThrow('p must be a finite number');
    });

    it('should throw error for infinite parameter', () => {
      expect(() => new GeometricDistribution(Infinity)).toThrow('p must be a finite number');
    });

    it('should accept p=1 (degenerate case)', () => {
      const dist = new GeometricDistribution(1);
      expect(dist.p).toBe(1);
    });

    it('should accept very small positive p', () => {
      const dist = new GeometricDistribution(0.001);
      expect(dist.p).toBe(0.001);
    });

    it('should accept p close to 1', () => {
      const dist = new GeometricDistribution(0.999);
      expect(dist.p).toBe(0.999);
    });
  });

  describe('sample', () => {
    it('should return positive integer values', () => {
      const dist = new GeometricDistribution(0.3);
      const rng1 = new SimpleRNG(123);

      for (let i = 0; i < 100; i++) {
        const sample = dist.sample(rng1);
        expect(Number.isInteger(sample)).toBe(true);
        expect(sample).toBeGreaterThan(0);
      }
    });

    it('should return 1 when p=1', () => {
      const dist = new GeometricDistribution(1);
      const rng1 = new SimpleRNG(456);

      for (let i = 0; i < 20; i++) {
        expect(dist.sample(rng1)).toBe(1);
      }
    });

    it('should produce samples with mean close to 1/p', () => {
      const p = 0.25;
      const dist = new GeometricDistribution(p);
      const rng1 = new SimpleRNG(789);

      const samples = Array.from({ length: 10000 }, () => dist.sample(rng1));
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;

      const expectedMean = 1 / p;
      expect(mean).toBeGreaterThan(expectedMean * 0.95);
      expect(mean).toBeLessThan(expectedMean * 1.05);
    });

    it('should produce samples with variance close to (1-p)/(p²)', () => {
      const p = 0.3;
      const dist = new GeometricDistribution(p);
      const rng1 = new SimpleRNG(111);

      const samples = Array.from({ length: 10000 }, () => dist.sample(rng1));
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      const variance =
        samples.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / samples.length;

      const expectedVariance = (1 - p) / (p * p);
      expect(variance).toBeGreaterThan(expectedVariance * 0.9);
      expect(variance).toBeLessThan(expectedVariance * 1.1);
    });

    it('should produce mostly 1s for large p', () => {
      const dist = new GeometricDistribution(0.9);
      const rng1 = new SimpleRNG(222);

      const samples = Array.from({ length: 100 }, () => dist.sample(rng1));
      const ones = samples.filter(x => x === 1).length;

      expect(ones).toBeGreaterThan(85); // Should be ~90%
    });

    it('should be reproducible with same seed', () => {
      const dist = new GeometricDistribution(0.4);

      const rng1 = new SimpleRNG(999);
      const rng2 = new SimpleRNG(999);

      const samples1 = Array.from({ length: 10 }, () => dist.sample(rng1));
      const samples2 = Array.from({ length: 10 }, () => dist.sample(rng2));

      expect(samples1).toEqual(samples2);
    });

    it('should produce different samples with different seeds', () => {
      const dist = new GeometricDistribution(0.4);

      const rng1 = new SimpleRNG(111);
      const rng2 = new SimpleRNG(222);

      const samples1 = Array.from({ length: 10 }, () => dist.sample(rng1));
      const samples2 = Array.from({ length: 10 }, () => dist.sample(rng2));

      expect(samples1).not.toEqual(samples2);
    });
  });

  describe('pmf (probability mass function)', () => {
    it('should return 0 for k <= 0', () => {
      const dist = new GeometricDistribution(0.5);
      expect(dist.pmf(0)).toBe(0);
      expect(dist.pmf(-1)).toBe(0);
      expect(dist.pmf(-10)).toBe(0);
    });

    it('should return 0 for non-integer k', () => {
      const dist = new GeometricDistribution(0.5);
      expect(dist.pmf(2.5)).toBe(0);
      expect(dist.pmf(3.7)).toBe(0);
    });

    it('should calculate correct PMF for p=0.5', () => {
      const dist = new GeometricDistribution(0.5);

      // Geometric(0.5) probabilities: 0.5, 0.25, 0.125, 0.0625, ...
      expect(dist.pmf(1)).toBeCloseTo(0.5, 10);
      expect(dist.pmf(2)).toBeCloseTo(0.25, 10);
      expect(dist.pmf(3)).toBeCloseTo(0.125, 10);
      expect(dist.pmf(4)).toBeCloseTo(0.0625, 10);
    });

    it('should have maximum probability at k=1', () => {
      const dist = new GeometricDistribution(0.3);

      expect(dist.pmf(1)).toBeGreaterThan(dist.pmf(2));
      expect(dist.pmf(1)).toBeGreaterThan(dist.pmf(3));
      expect(dist.pmf(1)).toBeGreaterThan(dist.pmf(10));
    });

    it('should be decreasing (geometric decay)', () => {
      const dist = new GeometricDistribution(0.4);

      for (let k = 1; k < 20; k++) {
        expect(dist.pmf(k)).toBeGreaterThan(dist.pmf(k + 1));
      }
    });

    it('should have probabilities sum to 1', () => {
      const dist = new GeometricDistribution(0.6);

      let sum = 0;
      // Sum first 50 terms (should cover >99.99% of probability mass)
      for (let k = 1; k <= 50; k++) {
        sum += dist.pmf(k);
      }

      expect(sum).toBeGreaterThan(0.9999);
      expect(sum).toBeLessThan(1.0001);
    });

    it('should return non-negative probabilities', () => {
      const dist = new GeometricDistribution(0.25);

      for (let k = 1; k <= 30; k++) {
        expect(dist.pmf(k)).toBeGreaterThanOrEqual(0);
      }
    });

    it('should return p for k=1', () => {
      const p = 0.7;
      const dist = new GeometricDistribution(p);
      expect(dist.pmf(1)).toBeCloseTo(p, 10);
    });

    it('should handle p=1', () => {
      const dist = new GeometricDistribution(1);
      expect(dist.pmf(1)).toBe(1);
      expect(dist.pmf(2)).toBe(0);
      expect(dist.pmf(10)).toBe(0);
    });

    it('should handle very small p', () => {
      const dist = new GeometricDistribution(0.01);
      expect(dist.pmf(1)).toBeCloseTo(0.01, 10);
      expect(dist.pmf(100)).toBeGreaterThan(0);
      expect(dist.pmf(100)).toBeLessThan(dist.pmf(1));
    });
  });

  describe('cdf (cumulative distribution function)', () => {
    it('should return 0 for k <= 0', () => {
      const dist = new GeometricDistribution(0.5);
      expect(dist.cdf(0)).toBe(0);
      expect(dist.cdf(-1)).toBe(0);
      expect(dist.cdf(-10)).toBe(0);
    });

    it('should approach 1 for large k', () => {
      const dist = new GeometricDistribution(0.5);
      expect(dist.cdf(20)).toBeGreaterThan(0.999999);
      expect(dist.cdf(50)).toBeGreaterThan(0.9999999);
    });

    it('should be monotonically increasing', () => {
      const dist = new GeometricDistribution(0.3);

      for (let k = 1; k < 30; k++) {
        expect(dist.cdf(k + 1)).toBeGreaterThan(dist.cdf(k));
      }
    });

    it('should equal sum of PMF up to k', () => {
      const dist = new GeometricDistribution(0.4);

      for (let k = 1; k <= 15; k++) {
        let sum = 0;
        for (let i = 1; i <= k; i++) {
          sum += dist.pmf(i);
        }
        expect(dist.cdf(k)).toBeCloseTo(sum, 10);
      }
    });

    it('should calculate CDF using closed form: 1 - (1-p)^k', () => {
      const p = 0.3;
      const dist = new GeometricDistribution(p);

      for (let k = 1; k <= 10; k++) {
        const expected = 1 - Math.pow(1 - p, k);
        expect(dist.cdf(k)).toBeCloseTo(expected, 10);
      }
    });

    it('should handle non-integer k by flooring', () => {
      const dist = new GeometricDistribution(0.5);

      // CDF(3.7) should equal CDF(3)
      expect(dist.cdf(3.7)).toBeCloseTo(dist.cdf(3), 10);
      expect(dist.cdf(5.2)).toBeCloseTo(dist.cdf(5), 10);
    });

    it('should handle p=1', () => {
      const dist = new GeometricDistribution(1);
      expect(dist.cdf(1)).toBe(1);
      expect(dist.cdf(2)).toBe(1);
      expect(dist.cdf(100)).toBe(1);
    });

    it('should handle very small p', () => {
      const dist = new GeometricDistribution(0.001);
      expect(dist.cdf(1)).toBeCloseTo(0.001, 10);
      expect(dist.cdf(100)).toBeLessThan(0.2);
      expect(dist.cdf(1000)).toBeGreaterThan(0.6);
    });
  });

  describe('inverseCDF (quantile function)', () => {
    it('should throw error for p < 0', () => {
      const dist = new GeometricDistribution(0.5);
      expect(() => dist.inverseCDF(-0.1)).toThrow('Probability must be between 0 and 1');
    });

    it('should throw error for p > 1', () => {
      const dist = new GeometricDistribution(0.5);
      expect(() => dist.inverseCDF(1.1)).toThrow('Probability must be between 0 and 1');
    });

    it('should return 1 for p=0', () => {
      const dist = new GeometricDistribution(0.5);
      expect(dist.inverseCDF(0)).toBe(1);
    });

    it('should return large value for p=1', () => {
      const dist = new GeometricDistribution(0.5);
      const result = dist.inverseCDF(1);
      expect(result).toBeGreaterThan(10);
      expect(Number.isInteger(result)).toBe(true);
    });

    it('should satisfy: CDF(inverseCDF(p)) >= p', () => {
      const dist = new GeometricDistribution(0.3);

      for (let p = 0.1; p < 1; p += 0.1) {
        const k = dist.inverseCDF(p);
        expect(dist.cdf(k)).toBeGreaterThanOrEqual(p - 1e-10);
      }
    });

    it('should return integer values', () => {
      const dist = new GeometricDistribution(0.4);

      for (let p = 0; p <= 1; p += 0.05) {
        const k = dist.inverseCDF(p);
        expect(Number.isInteger(k)).toBe(true);
      }
    });

    it('should be monotonically non-decreasing', () => {
      const dist = new GeometricDistribution(0.25);

      let prevK = dist.inverseCDF(0);
      for (let p = 0.05; p <= 1; p += 0.05) {
        const k = dist.inverseCDF(p);
        expect(k).toBeGreaterThanOrEqual(prevK);
        prevK = k;
      }
    });

    it('should use closed form: ceil(log(1-p) / log(1-prob))', () => {
      const p = 0.4;
      const dist = new GeometricDistribution(p);

      const prob = 0.8;
      const expected = Math.ceil(Math.log(1 - prob) / Math.log(1 - p));
      expect(dist.inverseCDF(prob)).toBe(expected);
    });

    it('should return median close to ln(0.5)/ln(1-p)', () => {
      const p = 0.2;
      const dist = new GeometricDistribution(p);

      const median = dist.inverseCDF(0.5);
      const expectedMedian = Math.log(0.5) / Math.log(1 - p);

      // Median should be within 1 of theoretical value (due to ceiling)
      expect(Math.abs(median - expectedMedian)).toBeLessThan(1);
    });

    it('should handle p=1 case', () => {
      const dist = new GeometricDistribution(1);
      expect(dist.inverseCDF(0)).toBe(1);
      expect(dist.inverseCDF(0.5)).toBe(1);
      expect(dist.inverseCDF(0.99)).toBe(1);
    });

    it('should handle very small success probability', () => {
      const dist = new GeometricDistribution(0.01);
      const q95 = dist.inverseCDF(0.95);
      expect(q95).toBeGreaterThan(100);
      expect(q95).toBeLessThan(400);
    });
  });

  describe('mean', () => {
    it('should return 1/p', () => {
      const dist = new GeometricDistribution(0.25);
      expect(dist.mean).toBe(4);
    });

    it('should return 1 when p=1', () => {
      const dist = new GeometricDistribution(1);
      expect(dist.mean).toBe(1);
    });

    it('should return 2 when p=0.5', () => {
      const dist = new GeometricDistribution(0.5);
      expect(dist.mean).toBe(2);
    });

    it('should be consistent with sample mean', () => {
      const p = 0.3;
      const dist = new GeometricDistribution(p);
      const rng1 = new SimpleRNG(555);

      const samples = Array.from({ length: 10000 }, () => dist.sample(rng1));
      const sampleMean = samples.reduce((a, b) => a + b, 0) / samples.length;

      expect(sampleMean).toBeGreaterThan(dist.mean * 0.97);
      expect(sampleMean).toBeLessThan(dist.mean * 1.03);
    });

    it('should be large for small p', () => {
      const dist = new GeometricDistribution(0.01);
      expect(dist.mean).toBe(100);
    });
  });

  describe('variance', () => {
    it('should return (1-p)/(p²)', () => {
      const p = 0.5;
      const dist = new GeometricDistribution(p);
      expect(dist.variance).toBe(2); // (1-0.5)/(0.5²) = 0.5/0.25 = 2
    });

    it('should return 0 when p=1', () => {
      const dist = new GeometricDistribution(1);
      expect(dist.variance).toBe(0);
    });

    it('should be large for small p', () => {
      const dist = new GeometricDistribution(0.1);
      expect(dist.variance).toBeCloseTo(90, 10); // (1-0.1)/(0.1²) = 0.9/0.01 = 90
    });

    it('should satisfy variance > mean for p < 0.5', () => {
      const dist = new GeometricDistribution(0.3);
      expect(dist.variance).toBeGreaterThan(dist.mean);
    });

    it('should satisfy variance < mean for p > 0.5', () => {
      const dist = new GeometricDistribution(0.7);
      expect(dist.variance).toBeLessThan(dist.mean);
    });
  });

  describe('validateParameters', () => {
    it('should return true for valid parameters', () => {
      const dist = new GeometricDistribution(0.5);
      expect(dist.validateParameters()).toBe(true);
    });

    it('should throw error for invalid p', () => {
      const dist = new GeometricDistribution(0.5);
      (dist as any).p = 0;
      expect(() => dist.validateParameters()).toThrow('p must be in (0, 1]');
    });

    it('should throw error for non-finite p', () => {
      const dist = new GeometricDistribution(0.5);
      (dist as any).p = Infinity;
      expect(() => dist.validateParameters()).toThrow('p must be a finite number');
    });
  });

  describe('performance', () => {
    it('should sample efficiently', () => {
      const dist = new GeometricDistribution(0.3);
      const rng1 = new SimpleRNG(777);

      const start = Date.now();
      for (let i = 0; i < 10000; i++) {
        dist.sample(rng1);
      }
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000); // Should complete in < 1 second
    });
  });

  describe('edge cases', () => {
    it('should handle memoryless property', () => {
      // P(X > s+t | X > s) = P(X > t)
      const dist = new GeometricDistribution(0.3);

      const s = 5;
      const t = 3;

      // P(X > s+t) / P(X > s) should equal P(X > t)
      const pXGreaterSPlusT = 1 - dist.cdf(s + t);
      const pXGreaterS = 1 - dist.cdf(s);
      const pXGreaterT = 1 - dist.cdf(t);

      const conditionalProb = pXGreaterSPlusT / pXGreaterS;

      expect(conditionalProb).toBeCloseTo(pXGreaterT, 10);
    });

    it('should model number of trials until first success', () => {
      const p = 0.2; // 20% success rate
      const dist = new GeometricDistribution(p);

      // Average trials until success should be 1/p = 5
      expect(dist.mean).toBe(5);

      // Probability of success on first trial should be p
      expect(dist.pmf(1)).toBeCloseTo(p, 10);
    });

    it('should handle coin flip scenario (p=0.5)', () => {
      const dist = new GeometricDistribution(0.5);

      // Flipping a fair coin until heads
      expect(dist.mean).toBe(2); // Expected 2 flips
      expect(dist.pmf(1)).toBeCloseTo(0.5, 10); // 50% chance first flip
      expect(dist.pmf(2)).toBeCloseTo(0.25, 10); // 25% chance second flip
    });

    it('should handle rare event (very small p)', () => {
      const dist = new GeometricDistribution(0.001);
      const rng1 = new SimpleRNG(888);

      const samples = Array.from({ length: 100 }, () => dist.sample(rng1));
      const mean = samples.reduce((a, b) => a + b) / samples.length;

      // Mean should be around 1000 for p=0.001
      expect(mean).toBeGreaterThan(500);
      expect(mean).toBeLessThan(1500);
    });

    it('should handle p very close to 1', () => {
      const dist = new GeometricDistribution(0.999);
      const rng1 = new SimpleRNG(999);

      const samples = Array.from({ length: 100 }, () => dist.sample(rng1));

      // Almost all samples should be 1
      const ones = samples.filter(x => x === 1).length;
      expect(ones).toBeGreaterThan(95);
    });
  });
});
