import { BinomialDistribution } from '../../src/distributions/BinomialDistribution';
import { SimpleRNG } from '../../src/utils/SimpleRNG';

describe('BinomialDistribution', () => {
  let rng: SimpleRNG;

  beforeEach(() => {
    rng = new SimpleRNG(42); // Seeded for reproducibility
  });

  describe('constructor', () => {
    it('should create distribution with valid parameters', () => {
      const dist = new BinomialDistribution(10, 0.5);
      expect(dist).toBeInstanceOf(BinomialDistribution);
      expect(dist.n).toBe(10);
      expect(dist.p).toBe(0.5);
    });

    it('should throw error when n is not an integer', () => {
      expect(() => new BinomialDistribution(10.5, 0.5)).toThrow(
        'n must be a positive integer'
      );
    });

    it('should throw error when n is zero', () => {
      expect(() => new BinomialDistribution(0, 0.5)).toThrow('n must be a positive integer');
    });

    it('should throw error when n is negative', () => {
      expect(() => new BinomialDistribution(-5, 0.5)).toThrow('n must be a positive integer');
    });

    it('should throw error when p is negative', () => {
      expect(() => new BinomialDistribution(10, -0.1)).toThrow('p must be in [0, 1]');
    });

    it('should throw error when p is greater than 1', () => {
      expect(() => new BinomialDistribution(10, 1.1)).toThrow('p must be in [0, 1]');
    });

    it('should throw error for NaN parameters', () => {
      expect(() => new BinomialDistribution(NaN, 0.5)).toThrow(
        'Parameters must be finite numbers'
      );
      expect(() => new BinomialDistribution(10, NaN)).toThrow(
        'Parameters must be finite numbers'
      );
    });

    it('should throw error for infinite parameters', () => {
      expect(() => new BinomialDistribution(Infinity, 0.5)).toThrow(
        'Parameters must be finite numbers'
      );
      expect(() => new BinomialDistribution(10, Infinity)).toThrow(
        'Parameters must be finite numbers'
      );
    });

    it('should accept p=0 (degenerate case)', () => {
      const dist = new BinomialDistribution(10, 0);
      expect(dist.p).toBe(0);
    });

    it('should accept p=1 (degenerate case)', () => {
      const dist = new BinomialDistribution(10, 1);
      expect(dist.p).toBe(1);
    });

    it('should accept large n values', () => {
      const dist = new BinomialDistribution(1000, 0.3);
      expect(dist.n).toBe(1000);
    });
  });

  describe('sample', () => {
    it('should return integer values', () => {
      const dist = new BinomialDistribution(20, 0.5);
      const rng1 = new SimpleRNG(123);

      for (let i = 0; i < 100; i++) {
        const sample = dist.sample(rng1);
        expect(Number.isInteger(sample)).toBe(true);
      }
    });

    it('should return values in range [0, n]', () => {
      const n = 15;
      const dist = new BinomialDistribution(n, 0.5);
      const rng1 = new SimpleRNG(456);

      for (let i = 0; i < 100; i++) {
        const sample = dist.sample(rng1);
        expect(sample).toBeGreaterThanOrEqual(0);
        expect(sample).toBeLessThanOrEqual(n);
      }
    });

    it('should return 0 when p=0', () => {
      const dist = new BinomialDistribution(10, 0);
      const rng1 = new SimpleRNG(789);

      for (let i = 0; i < 20; i++) {
        expect(dist.sample(rng1)).toBe(0);
      }
    });

    it('should return n when p=1', () => {
      const n = 10;
      const dist = new BinomialDistribution(n, 1);
      const rng1 = new SimpleRNG(101);

      for (let i = 0; i < 20; i++) {
        expect(dist.sample(rng1)).toBe(n);
      }
    });

    it('should produce samples with mean close to n*p', () => {
      const n = 100;
      const p = 0.4;
      const dist = new BinomialDistribution(n, p);
      const rng1 = new SimpleRNG(202);

      const samples = Array.from({ length: 5000 }, () => dist.sample(rng1));
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;

      expect(mean).toBeGreaterThan(n * p * 0.95);
      expect(mean).toBeLessThan(n * p * 1.05);
    });

    it('should produce samples with variance close to n*p*(1-p)', () => {
      const n = 100;
      const p = 0.3;
      const dist = new BinomialDistribution(n, p);
      const rng1 = new SimpleRNG(303);

      const samples = Array.from({ length: 5000 }, () => dist.sample(rng1));
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      const variance =
        samples.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / samples.length;

      const expectedVariance = n * p * (1 - p);
      expect(variance).toBeGreaterThan(expectedVariance * 0.9);
      expect(variance).toBeLessThan(expectedVariance * 1.1);
    });

    it('should be reproducible with same seed', () => {
      const dist = new BinomialDistribution(20, 0.5);

      const rng1 = new SimpleRNG(999);
      const rng2 = new SimpleRNG(999);

      const samples1 = Array.from({ length: 10 }, () => dist.sample(rng1));
      const samples2 = Array.from({ length: 10 }, () => dist.sample(rng2));

      expect(samples1).toEqual(samples2);
    });

    it('should produce different samples with different seeds', () => {
      const dist = new BinomialDistribution(20, 0.5);

      const rng1 = new SimpleRNG(111);
      const rng2 = new SimpleRNG(222);

      const samples1 = Array.from({ length: 10 }, () => dist.sample(rng1));
      const samples2 = Array.from({ length: 10 }, () => dist.sample(rng2));

      expect(samples1).not.toEqual(samples2);
    });
  });

  describe('pmf (probability mass function)', () => {
    it('should return 0 for negative k', () => {
      const dist = new BinomialDistribution(10, 0.5);
      expect(dist.pmf(-1)).toBe(0);
      expect(dist.pmf(-5)).toBe(0);
    });

    it('should return 0 for k > n', () => {
      const dist = new BinomialDistribution(10, 0.5);
      expect(dist.pmf(11)).toBe(0);
      expect(dist.pmf(20)).toBe(0);
    });

    it('should return 0 for non-integer k', () => {
      const dist = new BinomialDistribution(10, 0.5);
      expect(dist.pmf(5.5)).toBe(0);
      expect(dist.pmf(2.3)).toBe(0);
    });

    it('should return correct probability for k=0 when p=0', () => {
      const dist = new BinomialDistribution(10, 0);
      expect(dist.pmf(0)).toBe(1);
    });

    it('should return correct probability for k=n when p=1', () => {
      const dist = new BinomialDistribution(10, 1);
      expect(dist.pmf(10)).toBe(1);
    });

    it('should return maximum probability at k=n*p for symmetric case', () => {
      const dist = new BinomialDistribution(10, 0.5);
      const probAt5 = dist.pmf(5);

      expect(probAt5).toBeGreaterThan(dist.pmf(0));
      expect(probAt5).toBeGreaterThan(dist.pmf(10));
      expect(probAt5).toBeGreaterThan(dist.pmf(3));
      expect(probAt5).toBeGreaterThan(dist.pmf(7));
    });

    it('should calculate correct PMF for simple case n=3, p=0.5', () => {
      const dist = new BinomialDistribution(3, 0.5);

      // Binomial(3, 0.5) probabilities: 1/8, 3/8, 3/8, 1/8
      expect(dist.pmf(0)).toBeCloseTo(1 / 8, 5);
      expect(dist.pmf(1)).toBeCloseTo(3 / 8, 5);
      expect(dist.pmf(2)).toBeCloseTo(3 / 8, 5);
      expect(dist.pmf(3)).toBeCloseTo(1 / 8, 5);
    });

    it('should have all probabilities sum to 1', () => {
      const dist = new BinomialDistribution(10, 0.3);

      let sum = 0;
      for (let k = 0; k <= 10; k++) {
        sum += dist.pmf(k);
      }

      expect(sum).toBeCloseTo(1, 10);
    });

    it('should return non-negative probabilities', () => {
      const dist = new BinomialDistribution(20, 0.7);

      for (let k = 0; k <= 20; k++) {
        expect(dist.pmf(k)).toBeGreaterThanOrEqual(0);
      }
    });

    it('should handle edge case p very close to 0', () => {
      const dist = new BinomialDistribution(10, 0.001);
      expect(dist.pmf(0)).toBeCloseTo(Math.pow(0.999, 10), 5);
      expect(dist.pmf(10)).toBeCloseTo(Math.pow(0.001, 10), 15);
    });

    it('should handle edge case p very close to 1', () => {
      const dist = new BinomialDistribution(10, 0.999);
      expect(dist.pmf(10)).toBeCloseTo(Math.pow(0.999, 10), 5);
      expect(dist.pmf(0)).toBeCloseTo(Math.pow(0.001, 10), 15);
    });
  });

  describe('cdf (cumulative distribution function)', () => {
    it('should return 0 for k < 0', () => {
      const dist = new BinomialDistribution(10, 0.5);
      expect(dist.cdf(-1)).toBe(0);
      expect(dist.cdf(-10)).toBe(0);
    });

    it('should return 1 for k >= n', () => {
      const dist = new BinomialDistribution(10, 0.5);
      expect(dist.cdf(10)).toBe(1);
      expect(dist.cdf(15)).toBe(1);
      expect(dist.cdf(100)).toBe(1);
    });

    it('should be monotonically increasing', () => {
      const dist = new BinomialDistribution(20, 0.4);

      for (let k = 0; k < 20; k++) {
        expect(dist.cdf(k + 1)).toBeGreaterThanOrEqual(dist.cdf(k));
      }
    });

    it('should equal sum of PMF up to k', () => {
      const dist = new BinomialDistribution(10, 0.6);

      for (let k = 0; k <= 10; k++) {
        let sum = 0;
        for (let i = 0; i <= k; i++) {
          sum += dist.pmf(i);
        }
        expect(dist.cdf(k)).toBeCloseTo(sum, 10);
      }
    });

    it('should handle p=0', () => {
      const dist = new BinomialDistribution(10, 0);
      expect(dist.cdf(-1)).toBe(0);
      expect(dist.cdf(0)).toBe(1);
      expect(dist.cdf(5)).toBe(1);
    });

    it('should handle p=1', () => {
      const dist = new BinomialDistribution(10, 1);
      expect(dist.cdf(9)).toBe(0);
      expect(dist.cdf(10)).toBe(1);
    });

    it('should calculate CDF for simple case', () => {
      const dist = new BinomialDistribution(3, 0.5);

      expect(dist.cdf(0)).toBeCloseTo(1 / 8, 5);
      expect(dist.cdf(1)).toBeCloseTo(4 / 8, 5);
      expect(dist.cdf(2)).toBeCloseTo(7 / 8, 5);
      expect(dist.cdf(3)).toBeCloseTo(1, 5);
    });

    it('should handle non-integer k by flooring', () => {
      const dist = new BinomialDistribution(10, 0.5);

      // CDF(5.7) should equal CDF(5)
      expect(dist.cdf(5.7)).toBeCloseTo(dist.cdf(5), 10);
      expect(dist.cdf(2.1)).toBeCloseTo(dist.cdf(2), 10);
    });
  });

  describe('inverseCDF (quantile function)', () => {
    it('should throw error for p < 0', () => {
      const dist = new BinomialDistribution(10, 0.5);
      expect(() => dist.inverseCDF(-0.1)).toThrow('Probability must be between 0 and 1');
    });

    it('should throw error for p > 1', () => {
      const dist = new BinomialDistribution(10, 0.5);
      expect(() => dist.inverseCDF(1.1)).toThrow('Probability must be between 0 and 1');
    });

    it('should return 0 for p=0', () => {
      const dist = new BinomialDistribution(10, 0.5);
      expect(dist.inverseCDF(0)).toBe(0);
    });

    it('should return n for p=1', () => {
      const dist = new BinomialDistribution(10, 0.5);
      expect(dist.inverseCDF(1)).toBe(10);
    });

    it('should be inverse of CDF', () => {
      const dist = new BinomialDistribution(20, 0.4);

      for (let k = 0; k <= 20; k++) {
        const p = dist.cdf(k);
        const invK = dist.inverseCDF(p);
        expect(invK).toBeLessThanOrEqual(k);
      }
    });

    it('should satisfy: CDF(inverseCDF(p)) >= p', () => {
      const dist = new BinomialDistribution(15, 0.6);

      for (let p = 0.1; p < 1; p += 0.1) {
        const k = dist.inverseCDF(p);
        expect(dist.cdf(k)).toBeGreaterThanOrEqual(p - 1e-10);
      }
    });

    it('should return integer values', () => {
      const dist = new BinomialDistribution(30, 0.3);

      for (let p = 0; p <= 1; p += 0.05) {
        const k = dist.inverseCDF(p);
        expect(Number.isInteger(k)).toBe(true);
      }
    });

    it('should be monotonically non-decreasing', () => {
      const dist = new BinomialDistribution(25, 0.5);

      let prevK = dist.inverseCDF(0);
      for (let p = 0.05; p <= 1; p += 0.05) {
        const k = dist.inverseCDF(p);
        expect(k).toBeGreaterThanOrEqual(prevK);
        prevK = k;
      }
    });

    it('should return median close to n*p for large n', () => {
      const n = 100;
      const p = 0.4;
      const dist = new BinomialDistribution(n, p);

      const median = dist.inverseCDF(0.5);
      expect(median).toBeGreaterThan(n * p - 5);
      expect(median).toBeLessThan(n * p + 5);
    });

    it('should work with p very close to 0', () => {
      const dist = new BinomialDistribution(100, 0.01);
      const q95 = dist.inverseCDF(0.95);
      expect(q95).toBeGreaterThan(0);
      expect(q95).toBeLessThanOrEqual(100);
    });

    it('should work with p very close to 1', () => {
      const dist = new BinomialDistribution(100, 0.99);
      const q05 = dist.inverseCDF(0.05);
      expect(q05).toBeGreaterThanOrEqual(0);
      expect(q05).toBeLessThan(100);
    });
  });

  describe('mean', () => {
    it('should return n*p', () => {
      const dist = new BinomialDistribution(10, 0.3);
      expect(dist.mean).toBe(3);
    });

    it('should return 0 when p=0', () => {
      const dist = new BinomialDistribution(10, 0);
      expect(dist.mean).toBe(0);
    });

    it('should return n when p=1', () => {
      const dist = new BinomialDistribution(10, 1);
      expect(dist.mean).toBe(10);
    });

    it('should return n/2 when p=0.5', () => {
      const dist = new BinomialDistribution(20, 0.5);
      expect(dist.mean).toBe(10);
    });

    it('should be consistent with sample mean', () => {
      const dist = new BinomialDistribution(50, 0.4);
      const rng1 = new SimpleRNG(555);

      const samples = Array.from({ length: 10000 }, () => dist.sample(rng1));
      const sampleMean = samples.reduce((a, b) => a + b, 0) / samples.length;

      expect(sampleMean).toBeGreaterThan(dist.mean * 0.98);
      expect(sampleMean).toBeLessThan(dist.mean * 1.02);
    });
  });

  describe('variance', () => {
    it('should return n*p*(1-p)', () => {
      const dist = new BinomialDistribution(10, 0.3);
      expect(dist.variance).toBeCloseTo(2.1, 10);
    });

    it('should return 0 when p=0', () => {
      const dist = new BinomialDistribution(10, 0);
      expect(dist.variance).toBe(0);
    });

    it('should return 0 when p=1', () => {
      const dist = new BinomialDistribution(10, 1);
      expect(dist.variance).toBe(0);
    });

    it('should be maximum when p=0.5', () => {
      const n = 20;
      const dist05 = new BinomialDistribution(n, 0.5);
      const dist03 = new BinomialDistribution(n, 0.3);
      const dist07 = new BinomialDistribution(n, 0.7);

      expect(dist05.variance).toBeGreaterThan(dist03.variance);
      expect(dist05.variance).toBeGreaterThan(dist07.variance);
    });

    it('should be symmetric around p=0.5', () => {
      const n = 30;
      const dist03 = new BinomialDistribution(n, 0.3);
      const dist07 = new BinomialDistribution(n, 0.7);

      expect(dist03.variance).toBeCloseTo(dist07.variance, 10);
    });
  });

  describe('validateParameters', () => {
    it('should return true for valid parameters', () => {
      const dist = new BinomialDistribution(10, 0.5);
      expect(dist.validateParameters()).toBe(true);
    });

    it('should throw error for invalid n', () => {
      const dist = new BinomialDistribution(10, 0.5);
      (dist as any).n = -5;
      expect(() => dist.validateParameters()).toThrow('n must be a positive integer');
    });

    it('should throw error for invalid p', () => {
      const dist = new BinomialDistribution(10, 0.5);
      (dist as any).p = 1.5;
      expect(() => dist.validateParameters()).toThrow('p must be in [0, 1]');
    });
  });

  describe('performance', () => {
    it('should sample efficiently for large n', () => {
      const dist = new BinomialDistribution(1000, 0.3);
      const rng1 = new SimpleRNG(999);

      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        dist.sample(rng1);
      }
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000); // Should complete in < 1 second
    });
  });

  describe('edge cases', () => {
    it('should handle n=1 (Bernoulli distribution)', () => {
      const dist = new BinomialDistribution(1, 0.7);

      expect(dist.mean).toBe(0.7);
      expect(dist.variance).toBeCloseTo(0.21, 10);
      expect(dist.pmf(0)).toBeCloseTo(0.3, 10);
      expect(dist.pmf(1)).toBeCloseTo(0.7, 10);
    });

    it('should handle very large n with small p (Poisson approximation)', () => {
      const n = 1000;
      const p = 0.001;
      const dist = new BinomialDistribution(n, p);

      // Mean should be approximately 1 (like Poisson(1))
      expect(dist.mean).toBeCloseTo(1, 5);

      const rng1 = new SimpleRNG(777);
      const samples = Array.from({ length: 1000 }, () => dist.sample(rng1));
      const sampleMean = samples.reduce((a, b) => a + b) / samples.length;

      expect(sampleMean).toBeGreaterThan(0.7);
      expect(sampleMean).toBeLessThan(1.3);
    });

    it('should handle very small p', () => {
      const dist = new BinomialDistribution(100, 0.0001);
      const rng1 = new SimpleRNG(888);

      const samples = Array.from({ length: 100 }, () => dist.sample(rng1));
      // Most samples should be 0
      const zeros = samples.filter(x => x === 0).length;
      expect(zeros).toBeGreaterThan(90);
    });

    it('should handle very large p', () => {
      const dist = new BinomialDistribution(100, 0.9999);
      const rng1 = new SimpleRNG(1111);

      const samples = Array.from({ length: 100 }, () => dist.sample(rng1));
      // Most samples should be n
      const maxValues = samples.filter(x => x === 100).length;
      expect(maxValues).toBeGreaterThan(90);
    });
  });
});
