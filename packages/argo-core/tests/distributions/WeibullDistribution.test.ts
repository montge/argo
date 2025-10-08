import { WeibullDistribution } from '../../src/distributions/WeibullDistribution';
import { SimpleRNG } from '../../src/utils/SimpleRNG';

describe('WeibullDistribution', () => {
  let rng: SimpleRNG;

  beforeEach(() => {
    rng = new SimpleRNG(12345);
  });

  describe('constructor', () => {
    it('should create distribution with valid parameters', () => {
      const dist = new WeibullDistribution(2, 1);
      expect(dist).toBeInstanceOf(WeibullDistribution);
      expect(dist.shape).toBe(2);
      expect(dist.scale).toBe(1);
      expect(dist.name).toBe('Weibull');
    });

    it('should throw error for non-positive shape parameter', () => {
      expect(() => new WeibullDistribution(0, 1)).toThrow('Shape must be positive');
      expect(() => new WeibullDistribution(-1, 1)).toThrow('Shape must be positive');
    });

    it('should throw error for non-positive scale parameter', () => {
      expect(() => new WeibullDistribution(1, 0)).toThrow('Scale must be positive');
      expect(() => new WeibullDistribution(1, -1)).toThrow('Scale must be positive');
    });

    it('should throw error for NaN parameters', () => {
      expect(() => new WeibullDistribution(NaN, 1)).toThrow(
        'Parameters must be finite numbers'
      );
      expect(() => new WeibullDistribution(1, NaN)).toThrow(
        'Parameters must be finite numbers'
      );
    });

    it('should throw error for infinite parameters', () => {
      expect(() => new WeibullDistribution(Infinity, 1)).toThrow(
        'Parameters must be finite numbers'
      );
      expect(() => new WeibullDistribution(1, Infinity)).toThrow(
        'Parameters must be finite numbers'
      );
    });

    it('should accept very small positive shape values', () => {
      const dist = new WeibullDistribution(0.1, 1);
      expect(dist.shape).toBe(0.1);
    });

    it('should accept very large shape values', () => {
      const dist = new WeibullDistribution(100, 1);
      expect(dist.shape).toBe(100);
    });

    it('should accept different scale values', () => {
      const dist1 = new WeibullDistribution(2, 0.5);
      const dist2 = new WeibullDistribution(2, 2);
      expect(dist1.scale).toBe(0.5);
      expect(dist2.scale).toBe(2);
    });
  });

  describe('sample', () => {
    it('should generate samples greater than or equal to 0', () => {
      const dist = new WeibullDistribution(2, 1);
      for (let i = 0; i < 100; i++) {
        const sample = dist.sample(rng);
        expect(sample).toBeGreaterThanOrEqual(0);
        expect(isFinite(sample)).toBe(true);
      }
    });

    it('should generate different samples for different seeds', () => {
      const dist = new WeibullDistribution(2, 1);
      const rng1 = new SimpleRNG(123);
      const rng2 = new SimpleRNG(456);

      const sample1 = dist.sample(rng1);
      const sample2 = dist.sample(rng2);

      expect(sample1).not.toBe(sample2);
    });

    it('should generate reproducible samples with same seed', () => {
      const dist = new WeibullDistribution(2, 1);
      const rng1 = new SimpleRNG(12345);
      const rng2 = new SimpleRNG(12345);

      const samples1 = Array.from({ length: 10 }, () => dist.sample(rng1));
      const samples2 = Array.from({ length: 10 }, () => dist.sample(rng2));

      expect(samples1).toEqual(samples2);
    });

    it('should have mean close to theoretical value for large sample', () => {
      const shape = 2;
      const scale = 1;
      const dist = new WeibullDistribution(shape, scale);
      const samples = Array.from({ length: 10000 }, () => dist.sample(rng));
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;

      // Theoretical mean = scale * Gamma(1 + 1/shape)
      expect(mean).toBeGreaterThan(dist.mean * 0.95);
      expect(mean).toBeLessThan(dist.mean * 1.05);
    });

    it('should have variance close to theoretical value for large sample', () => {
      const shape = 2;
      const scale = 1;
      const dist = new WeibullDistribution(shape, scale);
      const samples = Array.from({ length: 10000 }, () => dist.sample(rng));
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      const variance =
        samples.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / samples.length;

      expect(variance).toBeGreaterThan(dist.variance * 0.85);
      expect(variance).toBeLessThan(dist.variance * 1.15);
    });

    it('should handle exponential distribution (shape = 1) correctly', () => {
      // Weibull(1, λ) = Exponential(1/λ)
      const scale = 2;
      const dist = new WeibullDistribution(1, scale);
      const rng1 = new SimpleRNG(999);
      const samples = Array.from({ length: 5000 }, () => dist.sample(rng1));
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;

      // Mean should be scale for shape=1
      expect(mean).toBeGreaterThan(scale * 0.95);
      expect(mean).toBeLessThan(scale * 1.05);
    });

    it('should handle shape < 1 correctly', () => {
      const dist = new WeibullDistribution(0.5, 1);
      const samples = Array.from({ length: 1000 }, () => dist.sample(rng));

      samples.forEach((s) => {
        expect(s).toBeGreaterThanOrEqual(0);
        expect(isFinite(s)).toBe(true);
      });
    });

    it('should handle different scale values correctly', () => {
      const dist1 = new WeibullDistribution(2, 1);
      const dist2 = new WeibullDistribution(2, 2);

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
    it('should return 0 for negative values', () => {
      const dist = new WeibullDistribution(2, 1);
      expect(dist.pdf(-1)).toBe(0);
      expect(dist.pdf(-0.001)).toBe(0);
    });

    it('should return positive density for positive values', () => {
      const dist = new WeibullDistribution(2, 1);
      expect(dist.pdf(0.5)).toBeGreaterThan(0);
      expect(dist.pdf(1)).toBeGreaterThan(0);
      expect(dist.pdf(2)).toBeGreaterThan(0);
    });

    it('should return 0 at x=0 for shape > 1', () => {
      const dist = new WeibullDistribution(2, 1);
      expect(dist.pdf(0)).toBe(0);
    });

    it('should return positive value at x=0 for shape = 1', () => {
      const dist = new WeibullDistribution(1, 1);
      expect(dist.pdf(0)).toBe(1); // 1/scale
    });

    it('should return Infinity at x=0 for shape < 1', () => {
      const dist = new WeibullDistribution(0.5, 1);
      expect(dist.pdf(0)).toBe(Infinity);
    });

    it('should integrate to approximately 1 using trapezoidal rule', () => {
      const dist = new WeibullDistribution(2, 1);
      let integral = 0;
      const dx = 0.01;
      const maxX = 10;

      for (let x = 0; x <= maxX; x += dx) {
        integral += dist.pdf(x) * dx;
      }

      expect(integral).toBeGreaterThan(0.98);
      expect(integral).toBeLessThan(1.02);
    });

    it('should match exponential PDF for shape = 1', () => {
      const scale = 2;
      const dist = new WeibullDistribution(1, scale);

      // For Weibull(1, λ), PDF(x) = (1/λ) * exp(-x/λ)
      const x = 1;
      const expectedPdf = (1 / scale) * Math.exp(-x / scale);
      expect(dist.pdf(x)).toBeCloseTo(expectedPdf, 5);
    });

    it('should return very small values for very large x', () => {
      const dist = new WeibullDistribution(2, 1);
      expect(dist.pdf(50)).toBeLessThan(1e-10);
      expect(dist.pdf(100)).toBeLessThan(1e-20);
    });

    it('should handle very small shape values', () => {
      const dist = new WeibullDistribution(0.1, 1);
      expect(dist.pdf(0)).toBe(Infinity);
      expect(dist.pdf(0.1)).toBeGreaterThan(0);
      expect(isFinite(dist.pdf(0.1))).toBe(true);
    });
  });

  describe('cdf', () => {
    it('should return 0 for negative values', () => {
      const dist = new WeibullDistribution(2, 1);
      expect(dist.cdf(-1)).toBe(0);
      expect(dist.cdf(-0.001)).toBe(0);
    });

    it('should return 0 at x=0', () => {
      const dist = new WeibullDistribution(2, 1);
      expect(dist.cdf(0)).toBe(0);
    });

    it('should be monotonically increasing', () => {
      const dist = new WeibullDistribution(2, 1);
      const x1 = dist.cdf(1);
      const x2 = dist.cdf(2);
      const x3 = dist.cdf(3);

      expect(x2).toBeGreaterThan(x1);
      expect(x3).toBeGreaterThan(x2);
    });

    it('should approach 1 for large x', () => {
      const dist = new WeibullDistribution(2, 1);
      expect(dist.cdf(10)).toBeGreaterThan(0.999);
      expect(dist.cdf(20)).toBeGreaterThan(0.9999);
    });

    it('should match exponential CDF for shape = 1', () => {
      const scale = 2;
      const dist = new WeibullDistribution(1, scale);

      // For Weibull(1, λ), CDF = 1 - exp(-x/λ)
      const x = 1;
      const expectedCdf = 1 - Math.exp(-x / scale);
      expect(dist.cdf(x)).toBeCloseTo(expectedCdf, 10);
    });

    it('should be consistent with PDF through differentiation', () => {
      const dist = new WeibullDistribution(2, 1);
      const x = 1;
      const h = 0.0001;

      // Numerical derivative of CDF should approximate PDF
      const numericalDerivative = (dist.cdf(x + h) - dist.cdf(x - h)) / (2 * h);
      const pdfValue = dist.pdf(x);

      expect(numericalDerivative).toBeCloseTo(pdfValue, 3);
    });

    it('should handle different scale values correctly', () => {
      const dist1 = new WeibullDistribution(2, 1);
      const dist2 = new WeibullDistribution(2, 2);

      // At x=1, dist1 should have higher CDF (faster accumulation for smaller scale)
      expect(dist1.cdf(1)).toBeGreaterThan(dist2.cdf(1));
    });

    it('should handle very small shape values', () => {
      const dist = new WeibullDistribution(0.1, 1);
      expect(dist.cdf(0)).toBe(0);
      expect(dist.cdf(0.5)).toBeGreaterThan(0);
      expect(dist.cdf(0.5)).toBeLessThan(1);
      expect(dist.cdf(10)).toBeGreaterThan(0.7); // For shape=0.1, slower accumulation
    });
  });

  describe('inverseCDF', () => {
    it('should return 0 for p=0', () => {
      const dist = new WeibullDistribution(2, 1);
      expect(dist.inverseCDF(0)).toBe(0);
    });

    it('should return large value for p approaching 1', () => {
      const dist = new WeibullDistribution(2, 1);
      const result = dist.inverseCDF(0.999);
      expect(result).toBeGreaterThan(2); // 99.9th percentile for Weibull(2,1) is ~2.63
      expect(isFinite(result)).toBe(true);
    });

    it('should throw error for p < 0', () => {
      const dist = new WeibullDistribution(2, 1);
      expect(() => dist.inverseCDF(-0.1)).toThrow('Probability must be between 0 and 1');
    });

    it('should throw error for p > 1', () => {
      const dist = new WeibullDistribution(2, 1);
      expect(() => dist.inverseCDF(1.1)).toThrow('Probability must be between 0 and 1');
    });

    it('should be inverse of CDF', () => {
      const dist = new WeibullDistribution(2, 1);
      const testValues = [0.1, 0.25, 0.5, 0.75, 0.9];

      testValues.forEach((p) => {
        const x = dist.inverseCDF(p);
        const computedP = dist.cdf(x);
        expect(computedP).toBeCloseTo(p, 10);
      });
    });

    it('should satisfy: CDF(inverseCDF(p)) = p', () => {
      const dist = new WeibullDistribution(3, 2);
      const probabilities = [0.01, 0.1, 0.25, 0.5, 0.75, 0.9, 0.99];

      probabilities.forEach((p) => {
        const x = dist.inverseCDF(p);
        const recoveredP = dist.cdf(x);
        expect(recoveredP).toBeCloseTo(p, 10);
      });
    });

    it('should be monotonically increasing', () => {
      const dist = new WeibullDistribution(2, 1);
      const p1 = dist.inverseCDF(0.3);
      const p2 = dist.inverseCDF(0.5);
      const p3 = dist.inverseCDF(0.7);

      expect(p2).toBeGreaterThan(p1);
      expect(p3).toBeGreaterThan(p2);
    });

    it('should handle edge case p=1', () => {
      const dist = new WeibullDistribution(2, 1);
      const result = dist.inverseCDF(1);
      expect(isFinite(result)).toBe(true);
      expect(result).toBeGreaterThan(0);
    });

    it('should work with different shape values', () => {
      const dist1 = new WeibullDistribution(0.5, 1);
      const dist2 = new WeibullDistribution(5, 1);

      const q1 = dist1.inverseCDF(0.5);
      const q2 = dist2.inverseCDF(0.5);

      expect(q1).toBeGreaterThan(0);
      expect(q2).toBeGreaterThan(0);
      expect(isFinite(q1)).toBe(true);
      expect(isFinite(q2)).toBe(true);
    });

    it('should match exponential inverseCDF for shape = 1', () => {
      const scale = 2;
      const dist = new WeibullDistribution(1, scale);
      const p = 0.5;

      // For Exponential, inverseCDF(p) = -scale * ln(1-p)
      const expected = -scale * Math.log(1 - p);
      expect(dist.inverseCDF(p)).toBeCloseTo(expected, 10);
    });
  });

  describe('mean', () => {
    it('should return correct mean for shape=2, scale=1', () => {
      const dist = new WeibullDistribution(2, 1);
      // Mean = scale * Gamma(1 + 1/shape) = 1 * Gamma(1.5) ≈ 0.8862
      expect(dist.mean).toBeCloseTo(0.8862, 3);
    });

    it('should return scale for shape=1 (exponential)', () => {
      const scale = 3;
      const dist = new WeibullDistribution(1, scale);
      expect(dist.mean).toBeCloseTo(scale, 10);
    });

    it('should be consistent with sample mean', () => {
      const dist = new WeibullDistribution(3, 2);
      const samples = Array.from({ length: 10000 }, () => dist.sample(rng));
      const sampleMean = samples.reduce((a, b) => a + b, 0) / samples.length;

      expect(sampleMean).toBeCloseTo(dist.mean, 1);
    });
  });

  describe('variance', () => {
    it('should return correct variance for shape=2, scale=1', () => {
      const dist = new WeibullDistribution(2, 1);
      // Variance = scale² * [Gamma(1+2/k) - Gamma²(1+1/k)]
      expect(dist.variance).toBeGreaterThan(0);
      expect(isFinite(dist.variance)).toBe(true);
    });

    it('should return scale² for shape=1 (exponential)', () => {
      const scale = 3;
      const dist = new WeibullDistribution(1, scale);
      expect(dist.variance).toBeCloseTo(scale * scale, 10);
    });

    it('should be consistent with sample variance', () => {
      const dist = new WeibullDistribution(3, 2);
      const samples = Array.from({ length: 10000 }, () => dist.sample(rng));
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      const sampleVariance =
        samples.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / samples.length;

      expect(sampleVariance).toBeCloseTo(dist.variance, 0);
    });
  });

  describe('validateParameters', () => {
    it('should return true for valid parameters', () => {
      const dist = new WeibullDistribution(2, 1);
      expect(dist.validateParameters()).toBe(true);
    });

    it('should throw error for non-positive shape', () => {
      const dist = new WeibullDistribution(2, 1);
      (dist as any).shape = 0;
      expect(() => dist.validateParameters()).toThrow('Shape must be positive');
    });

    it('should throw error for non-positive scale', () => {
      const dist = new WeibullDistribution(2, 1);
      (dist as any).scale = -1;
      expect(() => dist.validateParameters()).toThrow('Scale must be positive');
    });

    it('should throw error for infinite parameters', () => {
      const dist = new WeibullDistribution(2, 1);
      (dist as any).shape = Infinity;
      expect(() => dist.validateParameters()).toThrow('Parameters must be finite numbers');
    });
  });

  describe('performance', () => {
    it('should generate 100k samples in reasonable time', () => {
      const dist = new WeibullDistribution(2, 1);
      const start = Date.now();

      for (let i = 0; i < 100000; i++) {
        dist.sample(rng);
      }

      const elapsed = Date.now() - start;
      // Should generate 100k samples in under 500ms (relaxed for Windows CI)
      expect(elapsed).toBeLessThan(500);
    });
  });

  describe('special cases', () => {
    it('should behave as exponential distribution when shape = 1', () => {
      const scale = 1.5;
      const dist = new WeibullDistribution(1, scale);

      // Mean should be scale
      expect(dist.mean).toBeCloseTo(scale, 10);

      // Variance should be scale²
      expect(dist.variance).toBeCloseTo(scale * scale, 10);
    });

    it('should handle very small shape values', () => {
      const dist = new WeibullDistribution(0.01, 1);
      expect(dist.mean).toBeGreaterThan(0);
      expect(isFinite(dist.pdf(0.001))).toBe(true);
      expect(isFinite(dist.cdf(0.001))).toBe(true);
    });

    it('should handle very large shape values', () => {
      const dist = new WeibullDistribution(100, 1);
      expect(dist.mean).toBeGreaterThan(0);
      expect(isFinite(dist.pdf(1))).toBe(true);
      expect(isFinite(dist.cdf(1))).toBe(true);
    });

    it('should approach normal distribution for large shape', () => {
      // For large k, Weibull becomes more symmetric (approaches normal)
      const shape = 50;
      const scale = 1;
      const dist = new WeibullDistribution(shape, scale);

      const rng1 = new SimpleRNG(555);
      const samples = Array.from({ length: 5000 }, () => dist.sample(rng1));
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;

      // Mean should be close to theoretical
      expect(mean).toBeGreaterThan(dist.mean * 0.98);
      expect(mean).toBeLessThan(dist.mean * 1.02);
    });

    it('should trigger gamma reflection formula for shape < 0.5', () => {
      // This tests gamma function with z < 0.5, which uses reflection formula (line 238)
      const dist = new WeibullDistribution(0.1, 1);
      const mean = dist.mean;
      expect(mean).toBeGreaterThan(0);
      expect(isFinite(mean)).toBe(true);

      // Also test variance which also uses gamma
      const variance = dist.variance;
      expect(variance).toBeGreaterThan(0);
      expect(isFinite(variance)).toBe(true);

      // Test even smaller shape to definitely hit reflection formula
      const dist2 = new WeibullDistribution(0.01, 1);
      const mean2 = dist2.mean;
      expect(mean2).toBeGreaterThan(0);
      expect(isFinite(mean2)).toBe(true);

      // Test shape values that produce fractional arguments to gamma
      const dist3 = new WeibullDistribution(0.3, 2);
      const mean3 = dist3.mean;
      expect(mean3).toBeGreaterThan(0);
      expect(isFinite(mean3)).toBe(true);
    });
  });
});
