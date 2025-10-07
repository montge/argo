import { GammaDistribution } from '../../src/distributions/GammaDistribution';
import { SimpleRNG } from '../../src/utils/SimpleRNG';

describe('GammaDistribution', () => {
  let rng: SimpleRNG;

  beforeEach(() => {
    rng = new SimpleRNG(12345);
  });

  describe('constructor', () => {
    it('should create distribution with valid parameters', () => {
      const dist = new GammaDistribution(2, 0.5);
      expect(dist).toBeInstanceOf(GammaDistribution);
      expect(dist.shape).toBe(2);
      expect(dist.rate).toBe(0.5);
      expect(dist.name).toBe('Gamma');
    });

    it('should throw error for non-positive shape parameter', () => {
      expect(() => new GammaDistribution(0, 1)).toThrow('Shape must be positive');
      expect(() => new GammaDistribution(-1, 1)).toThrow('Shape must be positive');
    });

    it('should throw error for non-positive rate parameter', () => {
      expect(() => new GammaDistribution(1, 0)).toThrow('Rate must be positive');
      expect(() => new GammaDistribution(1, -1)).toThrow('Rate must be positive');
    });

    it('should throw error for NaN parameters', () => {
      expect(() => new GammaDistribution(NaN, 1)).toThrow('Parameters must be finite numbers');
      expect(() => new GammaDistribution(1, NaN)).toThrow('Parameters must be finite numbers');
    });

    it('should throw error for infinite parameters', () => {
      expect(() => new GammaDistribution(Infinity, 1)).toThrow(
        'Parameters must be finite numbers'
      );
      expect(() => new GammaDistribution(1, Infinity)).toThrow(
        'Parameters must be finite numbers'
      );
    });

    it('should accept very small positive shape values', () => {
      const dist = new GammaDistribution(0.1, 1);
      expect(dist.shape).toBe(0.1);
    });

    it('should accept very large shape values', () => {
      const dist = new GammaDistribution(1000, 1);
      expect(dist.shape).toBe(1000);
    });

    it('should accept different rate values', () => {
      const dist1 = new GammaDistribution(1, 0.5);
      const dist2 = new GammaDistribution(1, 2);
      expect(dist1.rate).toBe(0.5);
      expect(dist2.rate).toBe(2);
    });
  });

  describe('sample', () => {
    it('should generate samples within reasonable range for shape >= 1', () => {
      const dist = new GammaDistribution(2, 1);
      for (let i = 0; i < 100; i++) {
        const sample = dist.sample(rng);
        expect(sample).toBeGreaterThanOrEqual(0);
        expect(sample).toBeLessThan(20); // Very unlikely to exceed 20 for Gamma(2,1)
        expect(isFinite(sample)).toBe(true);
      }
    });

    it('should generate samples within reasonable range for shape < 1', () => {
      const dist = new GammaDistribution(0.5, 1);
      for (let i = 0; i < 100; i++) {
        const sample = dist.sample(rng);
        expect(sample).toBeGreaterThanOrEqual(0);
        expect(sample).toBeLessThan(20);
        expect(isFinite(sample)).toBe(true);
      }
    });

    it('should generate different samples for different seeds', () => {
      const dist = new GammaDistribution(2, 1);
      const rng1 = new SimpleRNG(123);
      const rng2 = new SimpleRNG(456);

      const sample1 = dist.sample(rng1);
      const sample2 = dist.sample(rng2);

      expect(sample1).not.toBe(sample2);
    });

    it('should generate reproducible samples with same seed', () => {
      const dist = new GammaDistribution(2, 1);
      const rng1 = new SimpleRNG(12345);
      const rng2 = new SimpleRNG(12345);

      const samples1 = Array.from({ length: 10 }, () => dist.sample(rng1));
      const samples2 = Array.from({ length: 10 }, () => dist.sample(rng2));

      expect(samples1).toEqual(samples2);
    });

    it('should have mean close to shape/rate for large sample', () => {
      const shape = 2;
      const rate = 0.5;
      const dist = new GammaDistribution(shape, rate);
      const samples = Array.from({ length: 10000 }, () => dist.sample(rng));
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      const expectedMean = shape / rate; // 2/0.5 = 4

      expect(mean).toBeGreaterThan(expectedMean * 0.95);
      expect(mean).toBeLessThan(expectedMean * 1.05);
    });

    it('should have variance close to shape/rate^2 for large sample', () => {
      const shape = 2;
      const rate = 0.5;
      const dist = new GammaDistribution(shape, rate);
      const samples = Array.from({ length: 10000 }, () => dist.sample(rng));
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      const variance =
        samples.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / samples.length;
      const expectedVariance = shape / (rate * rate); // 2/0.25 = 8

      expect(variance).toBeGreaterThan(expectedVariance * 0.85);
      expect(variance).toBeLessThan(expectedVariance * 1.15);
    });

    it('should handle small shape parameter (< 1) correctly', () => {
      const dist = new GammaDistribution(0.3, 1);
      const samples = Array.from({ length: 1000 }, () => dist.sample(rng));

      // All samples should be positive
      samples.forEach((s) => {
        expect(s).toBeGreaterThan(0);
        expect(isFinite(s)).toBe(true);
      });

      // Mean should be approximately shape/rate = 0.3
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      expect(mean).toBeGreaterThan(0.15);
      expect(mean).toBeLessThan(0.6);
    });

    it('should handle different rate values correctly', () => {
      const dist1 = new GammaDistribution(2, 0.5); // mean = 4
      const dist2 = new GammaDistribution(2, 2); // mean = 1

      const rng1 = new SimpleRNG(999);
      const rng2 = new SimpleRNG(999);

      const samples1 = Array.from({ length: 5000 }, () => dist1.sample(rng1));
      const samples2 = Array.from({ length: 5000 }, () => dist2.sample(rng2));

      const mean1 = samples1.reduce((a, b) => a + b, 0) / samples1.length;
      const mean2 = samples2.reduce((a, b) => a + b, 0) / samples2.length;

      // dist1 should have larger mean than dist2
      expect(mean1).toBeGreaterThan(mean2 * 2);
    });
  });

  describe('pdf', () => {
    it('should return 0 for negative values', () => {
      const dist = new GammaDistribution(2, 1);
      expect(dist.pdf(-1)).toBe(0);
      expect(dist.pdf(-0.001)).toBe(0);
    });

    it('should return positive density for positive values', () => {
      const dist = new GammaDistribution(2, 1);
      expect(dist.pdf(0.5)).toBeGreaterThan(0);
      expect(dist.pdf(1)).toBeGreaterThan(0);
      expect(dist.pdf(2)).toBeGreaterThan(0);
    });

    it('should return 0 at x=0 for shape > 1', () => {
      const dist = new GammaDistribution(2, 1);
      expect(dist.pdf(0)).toBe(0);
    });

    it('should return positive value at x=0 for shape = 1', () => {
      const dist = new GammaDistribution(1, 1);
      expect(dist.pdf(0)).toBe(1); // rate value
    });

    it('should return Infinity at x=0 for shape < 1', () => {
      const dist = new GammaDistribution(0.5, 1);
      expect(dist.pdf(0)).toBe(Infinity);
    });

    it('should integrate to approximately 1 using trapezoidal rule', () => {
      const dist = new GammaDistribution(2, 1);
      let integral = 0;
      const dx = 0.01;
      const maxX = 20;

      for (let x = 0; x <= maxX; x += dx) {
        integral += dist.pdf(x) * dx;
      }

      expect(integral).toBeGreaterThan(0.98);
      expect(integral).toBeLessThan(1.02);
    });

    it('should have maximum near mode = (shape-1)/rate for shape > 1', () => {
      const shape = 3;
      const rate = 1;
      const dist = new GammaDistribution(shape, rate);
      const mode = (shape - 1) / rate; // = 2

      const pdfAtMode = dist.pdf(mode);
      const pdfBefore = dist.pdf(mode - 0.5);
      const pdfAfter = dist.pdf(mode + 0.5);

      expect(pdfAtMode).toBeGreaterThan(pdfBefore);
      expect(pdfAtMode).toBeGreaterThan(pdfAfter);
    });

    it('should handle exponential distribution (shape = 1) correctly', () => {
      const rate = 2;
      const dist = new GammaDistribution(1, rate);

      // For Gamma(1, λ) = Exponential(λ), PDF = λ * exp(-λx)
      expect(dist.pdf(0)).toBeCloseTo(rate, 5);
      expect(dist.pdf(1)).toBeCloseTo(rate * Math.exp(-rate), 5);
    });

    it('should return very small values for very large x', () => {
      const dist = new GammaDistribution(2, 1);
      expect(dist.pdf(50)).toBeLessThan(1e-10);
      expect(dist.pdf(100)).toBeLessThan(1e-20);
    });
  });

  describe('cdf', () => {
    it('should return 0 for negative values', () => {
      const dist = new GammaDistribution(2, 1);
      expect(dist.cdf(-1)).toBe(0);
      expect(dist.cdf(-0.001)).toBe(0);
    });

    it('should return 0 at x=0', () => {
      const dist = new GammaDistribution(2, 1);
      expect(dist.cdf(0)).toBe(0);
    });

    it('should be monotonically increasing', () => {
      const dist = new GammaDistribution(2, 1);
      const x1 = dist.cdf(1);
      const x2 = dist.cdf(2);
      const x3 = dist.cdf(3);

      expect(x2).toBeGreaterThan(x1);
      expect(x3).toBeGreaterThan(x2);
    });

    it('should approach 1 for large x', () => {
      const dist = new GammaDistribution(2, 1);
      expect(dist.cdf(20)).toBeGreaterThan(0.999);
      expect(dist.cdf(50)).toBeGreaterThan(0.9999);
    });

    it('should match exponential CDF for shape = 1', () => {
      const rate = 2;
      const dist = new GammaDistribution(1, rate);

      // For Exponential(λ), CDF = 1 - exp(-λx)
      const x = 1;
      const expectedCdf = 1 - Math.exp(-rate * x);
      expect(dist.cdf(x)).toBeCloseTo(expectedCdf, 5);
    });

    it('should be consistent with PDF through differentiation', () => {
      const dist = new GammaDistribution(2, 1);
      const x = 2;
      const h = 0.0001;

      // Numerical derivative of CDF should approximate PDF
      const numericalDerivative = (dist.cdf(x + h) - dist.cdf(x - h)) / (2 * h);
      const pdfValue = dist.pdf(x);

      expect(numericalDerivative).toBeCloseTo(pdfValue, 3);
    });

    it('should handle small shape values correctly', () => {
      const dist = new GammaDistribution(0.5, 1);
      expect(dist.cdf(0)).toBe(0);
      expect(dist.cdf(0.5)).toBeGreaterThan(0);
      expect(dist.cdf(0.5)).toBeLessThan(1);
      expect(dist.cdf(10)).toBeGreaterThan(0.9);
    });

    it('should handle different rate values correctly', () => {
      const dist1 = new GammaDistribution(2, 0.5); // slower decay
      const dist2 = new GammaDistribution(2, 2); // faster decay

      // At x=2, dist2 should have higher CDF (faster accumulation)
      expect(dist2.cdf(2)).toBeGreaterThan(dist1.cdf(2));
    });
  });

  describe('inverseCDF', () => {
    it('should return 0 for p=0', () => {
      const dist = new GammaDistribution(2, 1);
      expect(dist.inverseCDF(0)).toBe(0);
    });

    it('should return large value for p approaching 1', () => {
      const dist = new GammaDistribution(2, 1);
      const result = dist.inverseCDF(0.999);
      expect(result).toBeGreaterThan(8); // 99.9th percentile for Gamma(2,1) is ~9.2
      expect(isFinite(result)).toBe(true);
    });

    it('should throw error for p < 0', () => {
      const dist = new GammaDistribution(2, 1);
      expect(() => dist.inverseCDF(-0.1)).toThrow('Probability must be between 0 and 1');
    });

    it('should throw error for p > 1', () => {
      const dist = new GammaDistribution(2, 1);
      expect(() => dist.inverseCDF(1.1)).toThrow('Probability must be between 0 and 1');
    });

    it('should be inverse of CDF', () => {
      const dist = new GammaDistribution(2, 1);
      const testValues = [0.1, 0.25, 0.5, 0.75, 0.9];

      testValues.forEach((p) => {
        const x = dist.inverseCDF(p);
        const computedP = dist.cdf(x);
        expect(computedP).toBeCloseTo(p, 4);
      });
    });

    it('should satisfy: CDF(inverseCDF(p)) = p', () => {
      const dist = new GammaDistribution(3, 0.5);
      const probabilities = [0.01, 0.1, 0.25, 0.5, 0.75, 0.9, 0.99];

      probabilities.forEach((p) => {
        const x = dist.inverseCDF(p);
        const recoveredP = dist.cdf(x);
        expect(recoveredP).toBeCloseTo(p, 3);
      });
    });

    it('should be monotonically increasing', () => {
      const dist = new GammaDistribution(2, 1);
      const p1 = dist.inverseCDF(0.3);
      const p2 = dist.inverseCDF(0.5);
      const p3 = dist.inverseCDF(0.7);

      expect(p2).toBeGreaterThan(p1);
      expect(p3).toBeGreaterThan(p2);
    });

    it('should handle edge case p=1', () => {
      const dist = new GammaDistribution(2, 1);
      const result = dist.inverseCDF(1);
      expect(isFinite(result)).toBe(true);
      expect(result).toBeGreaterThan(0);
    });

    it('should work with different shape values', () => {
      const dist1 = new GammaDistribution(0.5, 1);
      const dist2 = new GammaDistribution(5, 1);

      const q1 = dist1.inverseCDF(0.5);
      const q2 = dist2.inverseCDF(0.5);

      // Both should be valid quantiles
      expect(q1).toBeGreaterThan(0);
      expect(q2).toBeGreaterThan(0);
      expect(isFinite(q1)).toBe(true);
      expect(isFinite(q2)).toBe(true);
    });
  });

  describe('mean', () => {
    it('should return shape/rate', () => {
      const dist1 = new GammaDistribution(2, 1);
      expect(dist1.mean).toBe(2);

      const dist2 = new GammaDistribution(3, 0.5);
      expect(dist2.mean).toBe(6);

      const dist3 = new GammaDistribution(1, 2);
      expect(dist3.mean).toBe(0.5);
    });

    it('should be consistent with sample mean', () => {
      const dist = new GammaDistribution(5, 2);
      const samples = Array.from({ length: 10000 }, () => dist.sample(rng));
      const sampleMean = samples.reduce((a, b) => a + b, 0) / samples.length;

      expect(sampleMean).toBeCloseTo(dist.mean, 1);
    });
  });

  describe('variance', () => {
    it('should return shape/rate^2', () => {
      const dist1 = new GammaDistribution(2, 1);
      expect(dist1.variance).toBe(2);

      const dist2 = new GammaDistribution(4, 2);
      expect(dist2.variance).toBe(1); // 4/4

      const dist3 = new GammaDistribution(1, 0.5);
      expect(dist3.variance).toBe(4); // 1/0.25
    });

    it('should be consistent with sample variance', () => {
      const dist = new GammaDistribution(5, 2);
      const samples = Array.from({ length: 10000 }, () => dist.sample(rng));
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      const sampleVariance =
        samples.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / samples.length;

      expect(sampleVariance).toBeCloseTo(dist.variance, 0);
    });
  });

  describe('validateParameters', () => {
    it('should return true for valid parameters', () => {
      const dist = new GammaDistribution(2, 1);
      expect(dist.validateParameters()).toBe(true);
    });

    it('should throw error for non-positive shape', () => {
      const dist = new GammaDistribution(2, 1);
      (dist as any).shape = 0;
      expect(() => dist.validateParameters()).toThrow('Shape must be positive');
    });

    it('should throw error for non-positive rate', () => {
      const dist = new GammaDistribution(2, 1);
      (dist as any).rate = -1;
      expect(() => dist.validateParameters()).toThrow('Rate must be positive');
    });

    it('should throw error for infinite parameters', () => {
      const dist = new GammaDistribution(2, 1);
      (dist as any).shape = Infinity;
      expect(() => dist.validateParameters()).toThrow('Parameters must be finite numbers');
    });
  });

  describe('performance', () => {
    it('should generate 100k samples in reasonable time', () => {
      const dist = new GammaDistribution(2, 1);
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
    it('should behave as exponential distribution when shape = 1', () => {
      const rate = 1.5;
      const dist = new GammaDistribution(1, rate);

      // Mean should be 1/rate
      expect(dist.mean).toBeCloseTo(1 / rate, 10);

      // Variance should be 1/rate^2
      expect(dist.variance).toBeCloseTo(1 / (rate * rate), 10);

      // PDF at x=0 should be rate
      expect(dist.pdf(0)).toBeCloseTo(rate, 10);
    });

    it('should handle very small shape values', () => {
      const dist = new GammaDistribution(0.01, 1);
      expect(dist.mean).toBeCloseTo(0.01, 10);
      expect(isFinite(dist.pdf(0.001))).toBe(true);
      expect(isFinite(dist.cdf(0.001))).toBe(true);
    });

    it('should handle very large shape values', () => {
      const dist = new GammaDistribution(100, 1);
      expect(dist.mean).toBe(100);
      expect(isFinite(dist.pdf(100))).toBe(true);
      expect(isFinite(dist.cdf(100))).toBe(true);
    });

    it('should approach normal distribution for large shape', () => {
      // For large shape, Gamma distribution approaches normal
      const shape = 100;
      const rate = 1;
      const dist = new GammaDistribution(shape, rate);

      // Generate samples and check if they're approximately normal
      const rng1 = new SimpleRNG(777);
      const samples = Array.from({ length: 5000 }, () => dist.sample(rng1));
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      const variance =
        samples.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / samples.length;

      // Should be close to theoretical values (relaxed precision for sample variance)
      expect(mean).toBeCloseTo(shape / rate, 0);
      expect(variance).toBeGreaterThan(shape / (rate * rate) * 0.95);
      expect(variance).toBeLessThan(shape / (rate * rate) * 1.05);
    });
  });

  describe('edge cases for numerical stability', () => {
    it('should handle CDF at x=0', () => {
      const dist = new GammaDistribution(2, 1);
      expect(dist.cdf(0)).toBe(0);
    });

    it('should handle inverseCDF with extreme probabilities', () => {
      const dist = new GammaDistribution(2, 1);

      // Very small p - close to 0
      const x1 = dist.inverseCDF(1e-10);
      expect(x1).toBeGreaterThan(0);
      expect(x1).toBeLessThan(0.1);

      // Very large p - close to 1 but not exactly 1
      const x2 = dist.inverseCDF(1 - 1e-10);
      expect(x2).toBeGreaterThan(5);
      expect(isFinite(x2)).toBe(true);
    });

    it('should handle regularizedGammaP with x=0', () => {
      const dist = new GammaDistribution(2, 1);
      // This tests the x===0 branch in regularizedGammaP
      expect(dist.cdf(0)).toBe(0);
    });

    it('should handle series expansion for small x values', () => {
      // When x < shape+1, uses series expansion
      const dist = new GammaDistribution(5, 1);
      const cdf = dist.cdf(2); // 2 < 5+1, so uses series
      expect(cdf).toBeGreaterThan(0);
      expect(cdf).toBeLessThan(1);
      expect(isFinite(cdf)).toBe(true);
    });

    it('should handle continued fraction for large x values', () => {
      // When x >= shape+1, uses continued fraction
      const dist = new GammaDistribution(2, 1);
      const cdf = dist.cdf(10); // 10 >= 2+1, so uses continued fraction
      expect(cdf).toBeGreaterThan(0.9);
      expect(cdf).toBeLessThan(1);
      expect(isFinite(cdf)).toBe(true);
    });

    it('should handle very small shape values in CDF', () => {
      const dist = new GammaDistribution(0.1, 1);
      const cdf1 = dist.cdf(0.01);
      const cdf2 = dist.cdf(0.1);
      const cdf3 = dist.cdf(1);

      expect(cdf1).toBeGreaterThan(0);
      expect(cdf2).toBeGreaterThan(cdf1);
      expect(cdf3).toBeGreaterThan(cdf2);
      expect(isFinite(cdf1) && isFinite(cdf2) && isFinite(cdf3)).toBe(true);
    });

    it('should handle edge case where inverseCDF Newton-Raphson reaches max iterations', () => {
      // This is difficult to trigger, but we can test that it still returns a value
      const dist = new GammaDistribution(0.01, 0.01);
      const result = dist.inverseCDF(0.5);
      expect(isFinite(result)).toBe(true);
      expect(result).toBeGreaterThan(0);
    });
  });
});
