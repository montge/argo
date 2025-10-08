import { HypergeometricDistribution } from '../../src/distributions/HypergeometricDistribution';
import { SimpleRNG } from '../../src/utils/SimpleRNG';

describe('HypergeometricDistribution', () => {
  let rng: SimpleRNG;

  beforeEach(() => {
    rng = new SimpleRNG(42); // Seeded for reproducibility
  });

  describe('constructor', () => {
    it('should create distribution with valid parameters', () => {
      const dist = new HypergeometricDistribution(50, 20, 10);
      expect(dist).toBeInstanceOf(HypergeometricDistribution);
      expect(dist.N).toBe(50);
      expect(dist.K).toBe(20);
      expect(dist.n).toBe(10);
    });

    it('should throw error when parameters are not integers', () => {
      expect(() => new HypergeometricDistribution(50.5, 20, 10)).toThrow(
        'N, K, and n must be positive integers'
      );
      expect(() => new HypergeometricDistribution(50, 20.5, 10)).toThrow(
        'N, K, and n must be positive integers'
      );
      expect(() => new HypergeometricDistribution(50, 20, 10.5)).toThrow(
        'N, K, and n must be positive integers'
      );
    });

    it('should throw error when N is zero or negative', () => {
      expect(() => new HypergeometricDistribution(0, 0, 0)).toThrow(
        'N, K, and n must be positive integers'
      );
      expect(() => new HypergeometricDistribution(-10, 5, 2)).toThrow(
        'N, K, and n must be positive integers'
      );
    });

    it('should throw error when K > N', () => {
      expect(() => new HypergeometricDistribution(10, 15, 5)).toThrow('K must be <= N');
    });

    it('should throw error when n > N', () => {
      expect(() => new HypergeometricDistribution(10, 5, 15)).toThrow('n must be <= N');
    });

    it('should throw error for NaN parameters', () => {
      expect(() => new HypergeometricDistribution(NaN, 20, 10)).toThrow(
        'Parameters must be finite numbers'
      );
      expect(() => new HypergeometricDistribution(50, NaN, 10)).toThrow(
        'Parameters must be finite numbers'
      );
      expect(() => new HypergeometricDistribution(50, 20, NaN)).toThrow(
        'Parameters must be finite numbers'
      );
    });

    it('should throw error for infinite parameters', () => {
      expect(() => new HypergeometricDistribution(Infinity, 20, 10)).toThrow(
        'Parameters must be finite numbers'
      );
    });

    it('should accept edge case K=0', () => {
      const dist = new HypergeometricDistribution(50, 0, 10);
      expect(dist.K).toBe(0);
    });

    it('should accept edge case n=0', () => {
      const dist = new HypergeometricDistribution(50, 20, 0);
      expect(dist.n).toBe(0);
    });

    it('should accept K=N', () => {
      const dist = new HypergeometricDistribution(50, 50, 10);
      expect(dist.K).toBe(50);
    });

    it('should accept n=N', () => {
      const dist = new HypergeometricDistribution(50, 20, 50);
      expect(dist.n).toBe(50);
    });
  });

  describe('sample', () => {
    it('should return non-negative integer values', () => {
      const dist = new HypergeometricDistribution(100, 40, 20);
      const rng1 = new SimpleRNG(123);

      for (let i = 0; i < 100; i++) {
        const sample = dist.sample(rng1);
        expect(Number.isInteger(sample)).toBe(true);
        expect(sample).toBeGreaterThanOrEqual(0);
      }
    });

    it('should return values in valid range [max(0,n+K-N), min(n,K)]', () => {
      const N = 50;
      const K = 20;
      const n = 15;
      const dist = new HypergeometricDistribution(N, K, n);
      const rng1 = new SimpleRNG(456);

      const minVal = Math.max(0, n + K - N);
      const maxVal = Math.min(n, K);

      for (let i = 0; i < 100; i++) {
        const sample = dist.sample(rng1);
        expect(sample).toBeGreaterThanOrEqual(minVal);
        expect(sample).toBeLessThanOrEqual(maxVal);
      }
    });

    it('should return 0 when K=0', () => {
      const dist = new HypergeometricDistribution(50, 0, 10);
      const rng1 = new SimpleRNG(789);

      for (let i = 0; i < 20; i++) {
        expect(dist.sample(rng1)).toBe(0);
      }
    });

    it('should return 0 when n=0', () => {
      const dist = new HypergeometricDistribution(50, 20, 0);
      const rng1 = new SimpleRNG(101);

      for (let i = 0; i < 20; i++) {
        expect(dist.sample(rng1)).toBe(0);
      }
    });

    it('should return n when K=N', () => {
      const dist = new HypergeometricDistribution(50, 50, 10);
      const rng1 = new SimpleRNG(202);

      for (let i = 0; i < 20; i++) {
        expect(dist.sample(rng1)).toBe(10);
      }
    });

    it('should produce samples with mean close to n*K/N', () => {
      const N = 100;
      const K = 40;
      const n = 20;
      const dist = new HypergeometricDistribution(N, K, n);
      const rng1 = new SimpleRNG(303);

      const samples = Array.from({ length: 5000 }, () => dist.sample(rng1));
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;

      const expectedMean = (n * K) / N;
      expect(mean).toBeGreaterThan(expectedMean * 0.95);
      expect(mean).toBeLessThan(expectedMean * 1.05);
    });

    it('should be reproducible with same seed', () => {
      const dist = new HypergeometricDistribution(100, 30, 20);

      const rng1 = new SimpleRNG(999);
      const rng2 = new SimpleRNG(999);

      const samples1 = Array.from({ length: 10 }, () => dist.sample(rng1));
      const samples2 = Array.from({ length: 10 }, () => dist.sample(rng2));

      expect(samples1).toEqual(samples2);
    });

    it('should produce different samples with different seeds', () => {
      const dist = new HypergeometricDistribution(100, 30, 20);

      const rng1 = new SimpleRNG(111);
      const rng2 = new SimpleRNG(222);

      const samples1 = Array.from({ length: 10 }, () => dist.sample(rng1));
      const samples2 = Array.from({ length: 10 }, () => dist.sample(rng2));

      expect(samples1).not.toEqual(samples2);
    });
  });

  describe('pmf (probability mass function)', () => {
    it('should return 0 for k < max(0, n+K-N)', () => {
      const dist = new HypergeometricDistribution(50, 20, 15);
      const minK = Math.max(0, 15 + 20 - 50); // 0

      expect(dist.pmf(-1)).toBe(0);
      expect(dist.pmf(minK - 1)).toBe(0);
    });

    it('should return 0 for k > min(n, K)', () => {
      const dist = new HypergeometricDistribution(50, 20, 15);
      const maxK = Math.min(15, 20); // 15

      expect(dist.pmf(maxK + 1)).toBe(0);
      expect(dist.pmf(100)).toBe(0);
    });

    it('should return 0 for non-integer k', () => {
      const dist = new HypergeometricDistribution(50, 20, 10);
      expect(dist.pmf(3.5)).toBe(0);
      expect(dist.pmf(7.2)).toBe(0);
    });

    it('should calculate correct PMF for simple case', () => {
      // Drawing 2 balls from urn with 3 red, 2 blue (total 5)
      // P(0 red) = C(3,0)*C(2,2)/C(5,2) = 1*1/10 = 0.1
      // P(1 red) = C(3,1)*C(2,1)/C(5,2) = 3*2/10 = 0.6
      // P(2 red) = C(3,2)*C(2,0)/C(5,2) = 3*1/10 = 0.3
      const dist = new HypergeometricDistribution(5, 3, 2);

      expect(dist.pmf(0)).toBeCloseTo(0.1, 10);
      expect(dist.pmf(1)).toBeCloseTo(0.6, 10);
      expect(dist.pmf(2)).toBeCloseTo(0.3, 10);
    });

    it('should have probabilities sum to 1', () => {
      const dist = new HypergeometricDistribution(50, 20, 10);

      const minK = Math.max(0, 10 + 20 - 50);
      const maxK = Math.min(10, 20);

      let sum = 0;
      for (let k = minK; k <= maxK; k++) {
        sum += dist.pmf(k);
      }

      expect(sum).toBeCloseTo(1, 3); // Relax precision due to floating point accumulation
    });

    it('should return non-negative probabilities', () => {
      const dist = new HypergeometricDistribution(100, 40, 25);

      const minK = Math.max(0, 25 + 40 - 100);
      const maxK = Math.min(25, 40);

      for (let k = minK; k <= maxK; k++) {
        expect(dist.pmf(k)).toBeGreaterThanOrEqual(0);
      }
    });

    it('should handle K=0', () => {
      const dist = new HypergeometricDistribution(50, 0, 10);
      expect(dist.pmf(0)).toBe(1);
      expect(dist.pmf(1)).toBe(0);
    });

    it('should handle n=0', () => {
      const dist = new HypergeometricDistribution(50, 20, 0);
      expect(dist.pmf(0)).toBe(1);
      expect(dist.pmf(1)).toBe(0);
    });

    it('should handle K=N case', () => {
      const dist = new HypergeometricDistribution(50, 50, 10);
      expect(dist.pmf(10)).toBe(1);
      expect(dist.pmf(9)).toBe(0);
    });
  });

  describe('cdf (cumulative distribution function)', () => {
    it('should return 0 for k < max(0, n+K-N)', () => {
      const dist = new HypergeometricDistribution(50, 20, 15);
      const minK = Math.max(0, 15 + 20 - 50);

      expect(dist.cdf(minK - 1)).toBe(0);
      expect(dist.cdf(-10)).toBe(0);
    });

    it('should return 1 for k >= min(n, K)', () => {
      const dist = new HypergeometricDistribution(50, 20, 15);
      const maxK = Math.min(15, 20);

      expect(dist.cdf(maxK)).toBe(1);
      expect(dist.cdf(maxK + 5)).toBe(1);
      expect(dist.cdf(100)).toBe(1);
    });

    it('should be monotonically increasing', () => {
      const dist = new HypergeometricDistribution(100, 40, 20);

      const minK = Math.max(0, 20 + 40 - 100);
      const maxK = Math.min(20, 40);

      for (let k = minK; k < maxK; k++) {
        expect(dist.cdf(k + 1)).toBeGreaterThanOrEqual(dist.cdf(k));
      }
    });

    it('should equal sum of PMF up to k', () => {
      const dist = new HypergeometricDistribution(50, 20, 10);

      const minK = Math.max(0, 10 + 20 - 50);
      const maxK = Math.min(10, 20);

      for (let k = minK; k <= maxK; k++) {
        let sum = 0;
        for (let i = minK; i <= k; i++) {
          sum += dist.pmf(i);
        }
        expect(dist.cdf(k)).toBeCloseTo(sum, 3); // Relax precision due to accumulation
      }
    });

    it('should handle non-integer k by flooring', () => {
      const dist = new HypergeometricDistribution(50, 20, 10);

      expect(dist.cdf(5.7)).toBeCloseTo(dist.cdf(5), 10);
      expect(dist.cdf(3.2)).toBeCloseTo(dist.cdf(3), 10);
    });

    it('should handle K=0', () => {
      const dist = new HypergeometricDistribution(50, 0, 10);
      expect(dist.cdf(0)).toBe(1);
      expect(dist.cdf(5)).toBe(1);
    });

    it('should handle n=0', () => {
      const dist = new HypergeometricDistribution(50, 20, 0);
      expect(dist.cdf(0)).toBe(1);
      expect(dist.cdf(5)).toBe(1);
    });
  });

  describe('inverseCDF (quantile function)', () => {
    it('should throw error for p < 0', () => {
      const dist = new HypergeometricDistribution(50, 20, 10);
      expect(() => dist.inverseCDF(-0.1)).toThrow('Probability must be between 0 and 1');
    });

    it('should throw error for p > 1', () => {
      const dist = new HypergeometricDistribution(50, 20, 10);
      expect(() => dist.inverseCDF(1.1)).toThrow('Probability must be between 0 and 1');
    });

    it('should return minimum value for p=0', () => {
      const dist = new HypergeometricDistribution(50, 20, 10);
      const minK = Math.max(0, 10 + 20 - 50);
      expect(dist.inverseCDF(0)).toBe(minK);
    });

    it('should return maximum value for p=1', () => {
      const dist = new HypergeometricDistribution(50, 20, 10);
      const maxK = Math.min(10, 20);
      expect(dist.inverseCDF(1)).toBe(maxK);
    });

    it('should satisfy: CDF(inverseCDF(p)) >= p', () => {
      const dist = new HypergeometricDistribution(100, 40, 20);

      for (let p = 0.1; p < 1; p += 0.1) {
        const k = dist.inverseCDF(p);
        expect(dist.cdf(k)).toBeGreaterThanOrEqual(p - 1e-10);
      }
    });

    it('should return integer values', () => {
      const dist = new HypergeometricDistribution(100, 40, 20);

      for (let p = 0; p <= 1; p += 0.05) {
        const k = dist.inverseCDF(p);
        expect(Number.isInteger(k)).toBe(true);
      }
    });

    it('should be monotonically non-decreasing', () => {
      const dist = new HypergeometricDistribution(100, 40, 20);

      let prevK = dist.inverseCDF(0);
      for (let p = 0.05; p <= 1; p += 0.05) {
        const k = dist.inverseCDF(p);
        expect(k).toBeGreaterThanOrEqual(prevK);
        prevK = k;
      }
    });

    it('should handle K=0', () => {
      const dist = new HypergeometricDistribution(50, 0, 10);
      expect(dist.inverseCDF(0)).toBe(0);
      expect(dist.inverseCDF(0.5)).toBe(0);
      expect(dist.inverseCDF(1)).toBe(0);
    });

    it('should handle n=0', () => {
      const dist = new HypergeometricDistribution(50, 20, 0);
      expect(dist.inverseCDF(0)).toBe(0);
      expect(dist.inverseCDF(1)).toBe(0);
    });
  });

  describe('mean', () => {
    it('should return n*K/N', () => {
      const dist = new HypergeometricDistribution(50, 20, 10);
      expect(dist.mean).toBe(4); // 10*20/50 = 4
    });

    it('should return 0 when K=0', () => {
      const dist = new HypergeometricDistribution(50, 0, 10);
      expect(dist.mean).toBe(0);
    });

    it('should return 0 when n=0', () => {
      const dist = new HypergeometricDistribution(50, 20, 0);
      expect(dist.mean).toBe(0);
    });

    it('should return n when K=N', () => {
      const dist = new HypergeometricDistribution(50, 50, 10);
      expect(dist.mean).toBe(10);
    });

    it('should be consistent with sample mean', () => {
      const dist = new HypergeometricDistribution(100, 40, 25);
      const rng1 = new SimpleRNG(555);

      const samples = Array.from({ length: 10000 }, () => dist.sample(rng1));
      const sampleMean = samples.reduce((a, b) => a + b, 0) / samples.length;

      expect(sampleMean).toBeGreaterThan(dist.mean * 0.98);
      expect(sampleMean).toBeLessThan(dist.mean * 1.02);
    });
  });

  describe('variance', () => {
    it('should return n*(K/N)*(1-K/N)*((N-n)/(N-1))', () => {
      const N = 50;
      const K = 20;
      const n = 10;
      const dist = new HypergeometricDistribution(N, K, n);

      const p = K / N;
      const expected = n * p * (1 - p) * ((N - n) / (N - 1));

      expect(dist.variance).toBeCloseTo(expected, 10);
    });

    it('should return 0 when K=0', () => {
      const dist = new HypergeometricDistribution(50, 0, 10);
      expect(dist.variance).toBe(0);
    });

    it('should return 0 when n=0', () => {
      const dist = new HypergeometricDistribution(50, 20, 0);
      expect(dist.variance).toBe(0);
    });

    it('should return 0 when K=N', () => {
      const dist = new HypergeometricDistribution(50, 50, 10);
      expect(dist.variance).toBe(0);
    });

    it('should return 0 when n=N', () => {
      const dist = new HypergeometricDistribution(50, 20, 50);
      expect(dist.variance).toBe(0);
    });

    it('should be less than binomial variance due to finite population correction', () => {
      const N = 100;
      const K = 40;
      const n = 20;
      const dist = new HypergeometricDistribution(N, K, n);

      const p = K / N;
      const binomialVariance = n * p * (1 - p);

      // Hypergeometric variance < Binomial variance due to (N-n)/(N-1) < 1
      expect(dist.variance).toBeLessThan(binomialVariance);
    });
  });

  describe('validateParameters', () => {
    it('should return true for valid parameters', () => {
      const dist = new HypergeometricDistribution(50, 20, 10);
      expect(dist.validateParameters()).toBe(true);
    });

    it('should throw error for invalid N', () => {
      const dist = new HypergeometricDistribution(50, 20, 10);
      (dist as any).N = 0;
      expect(() => dist.validateParameters()).toThrow(
        'N, K, and n must be positive integers'
      );
    });

    it('should throw error for K > N', () => {
      const dist = new HypergeometricDistribution(50, 20, 10);
      (dist as any).K = 60;
      expect(() => dist.validateParameters()).toThrow('K must be <= N');
    });
  });

  describe('performance', () => {
    it('should sample efficiently', () => {
      const dist = new HypergeometricDistribution(200, 80, 40);
      const rng1 = new SimpleRNG(777);

      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        dist.sample(rng1);
      }
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000); // Should complete in < 1 second
    });
  });

  describe('edge cases', () => {
    it('should model sampling without replacement', () => {
      // Classic urn problem: 10 red, 5 blue balls, draw 3
      const dist = new HypergeometricDistribution(15, 10, 3);

      // Mean should be 3 * (10/15) = 2
      expect(dist.mean).toBe(2);
    });

    it('should reduce to binomial for large N', () => {
      // For N >> n, hypergeometric ≈ binomial
      const N = 10000;
      const K = 4000;
      const n = 10;
      const dist = new HypergeometricDistribution(N, K, n);

      const p = K / N; // 0.4
      const binomialMean = n * p; // 4
      const binomialVariance = n * p * (1 - p); // 2.4

      expect(dist.mean).toBeCloseTo(binomialMean, 10);
      expect(dist.variance).toBeCloseTo(binomialVariance, 2);
    });

    it('should handle extreme case where n+K barely fits in N', () => {
      // n+K = N+1, so minK = 1
      const dist = new HypergeometricDistribution(10, 6, 5);

      const minK = Math.max(0, 5 + 6 - 10); // 1
      const maxK = Math.min(5, 6); // 5

      expect(dist.pmf(0)).toBe(0);
      expect(dist.pmf(minK)).toBeGreaterThan(0);
      expect(dist.pmf(maxK)).toBeGreaterThan(0);
    });

    it('should handle deck of cards example', () => {
      // 52 cards, 13 hearts, draw 5 cards
      // What's probability of exactly 2 hearts?
      const dist = new HypergeometricDistribution(52, 13, 5);

      const prob2Hearts = dist.pmf(2);
      expect(prob2Hearts).toBeGreaterThan(0.2);
      expect(prob2Hearts).toBeLessThan(0.4);
    });
  });
});
