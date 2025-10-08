import { PERTDistribution } from '../../src/distributions/PERTDistribution';
import { SimpleRNG } from '../../src/utils/SimpleRNG';

describe('PERTDistribution', () => {
  let rng: SimpleRNG;

  beforeEach(() => {
    rng = new SimpleRNG(12345);
  });

  describe('constructor', () => {
    it('should create distribution with valid parameters', () => {
      const dist = new PERTDistribution(1, 3, 5);
      expect(dist).toBeInstanceOf(PERTDistribution);
      expect(dist.min).toBe(1);
      expect(dist.mode).toBe(3);
      expect(dist.max).toBe(5);
      expect(dist.name).toBe('PERT');
    });

    it('should throw error when min >= mode', () => {
      expect(() => new PERTDistribution(3, 3, 5)).toThrow(
        'Min must be less than mode'
      );
      expect(() => new PERTDistribution(4, 3, 5)).toThrow(
        'Min must be less than mode'
      );
    });

    it('should throw error when mode >= max', () => {
      expect(() => new PERTDistribution(1, 5, 5)).toThrow(
        'Mode must be less than max'
      );
      expect(() => new PERTDistribution(1, 6, 5)).toThrow(
        'Mode must be less than max'
      );
    });

    it('should throw error when min >= max', () => {
      expect(() => new PERTDistribution(5, 3, 4)).toThrow(
        'Min must be less than mode'
      );
    });

    it('should throw error for NaN parameters', () => {
      expect(() => new PERTDistribution(NaN, 3, 5)).toThrow(
        'Parameters must be finite numbers'
      );
      expect(() => new PERTDistribution(1, NaN, 5)).toThrow(
        'Parameters must be finite numbers'
      );
      expect(() => new PERTDistribution(1, 3, NaN)).toThrow(
        'Parameters must be finite numbers'
      );
    });

    it('should throw error for infinite parameters', () => {
      expect(() => new PERTDistribution(Infinity, 3, 5)).toThrow(
        'Parameters must be finite numbers'
      );
      expect(() => new PERTDistribution(1, Infinity, 5)).toThrow(
        'Parameters must be finite numbers'
      );
      expect(() => new PERTDistribution(1, 3, Infinity)).toThrow(
        'Parameters must be finite numbers'
      );
    });

    it('should accept negative values if properly ordered', () => {
      const dist = new PERTDistribution(-5, 0, 5);
      expect(dist.min).toBe(-5);
      expect(dist.mode).toBe(0);
      expect(dist.max).toBe(5);
    });

    it('should accept very small ranges', () => {
      const dist = new PERTDistribution(1, 1.5, 2);
      expect(dist.min).toBe(1);
      expect(dist.mode).toBe(1.5);
      expect(dist.max).toBe(2);
    });

    it('should accept very large ranges', () => {
      const dist = new PERTDistribution(0, 500, 1000);
      expect(dist.min).toBe(0);
      expect(dist.mode).toBe(500);
      expect(dist.max).toBe(1000);
    });
  });

  describe('sample', () => {
    it('should generate samples within [min, max]', () => {
      const dist = new PERTDistribution(1, 3, 5);
      for (let i = 0; i < 100; i++) {
        const sample = dist.sample(rng);
        expect(sample).toBeGreaterThanOrEqual(1);
        expect(sample).toBeLessThanOrEqual(5);
        expect(isFinite(sample)).toBe(true);
      }
    });

    it('should generate different samples for different seeds', () => {
      const dist = new PERTDistribution(1, 3, 5);
      const rng1 = new SimpleRNG(123);
      const rng2 = new SimpleRNG(456);

      const sample1 = dist.sample(rng1);
      const sample2 = dist.sample(rng2);

      expect(sample1).not.toBe(sample2);
    });

    it('should generate reproducible samples with same seed', () => {
      const dist = new PERTDistribution(1, 3, 5);
      const rng1 = new SimpleRNG(12345);
      const rng2 = new SimpleRNG(12345);

      const samples1 = Array.from({ length: 10 }, () => dist.sample(rng1));
      const samples2 = Array.from({ length: 10 }, () => dist.sample(rng2));

      expect(samples1).toEqual(samples2);
    });

    it('should have mean close to theoretical value for large sample', () => {
      const dist = new PERTDistribution(1, 3, 5);
      const samples = Array.from({ length: 10000 }, () => dist.sample(rng));
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;

      // PERT mean = (min + 4*mode + max) / 6
      expect(mean).toBeGreaterThan(dist.mean * 0.98);
      expect(mean).toBeLessThan(dist.mean * 1.02);
    });

    it('should have variance close to theoretical value for large sample', () => {
      const dist = new PERTDistribution(1, 3, 5);
      const samples = Array.from({ length: 10000 }, () => dist.sample(rng));
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      const variance =
        samples.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / samples.length;

      expect(variance).toBeGreaterThan(dist.variance * 0.9);
      expect(variance).toBeLessThan(dist.variance * 1.1);
    });

    it('should be concentrated near mode', () => {
      const dist = new PERTDistribution(0, 5, 10);
      const samples = Array.from({ length: 10000 }, () => dist.sample(rng));

      // More samples should be closer to mode than to extremes
      const nearMode = samples.filter(s => Math.abs(s - 5) < 2).length;
      const nearMin = samples.filter(s => s < 2).length;
      const nearMax = samples.filter(s => s > 8).length;

      expect(nearMode).toBeGreaterThan(nearMin);
      expect(nearMode).toBeGreaterThan(nearMax);
    });

    it('should handle mode closer to min', () => {
      const dist = new PERTDistribution(0, 2, 10);
      const samples = Array.from({ length: 1000 }, () => dist.sample(rng));

      samples.forEach((s) => {
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(10);
      });
    });

    it('should handle mode closer to max', () => {
      const dist = new PERTDistribution(0, 8, 10);
      const samples = Array.from({ length: 1000 }, () => dist.sample(rng));

      samples.forEach((s) => {
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(10);
      });
    });

    it('should handle symmetric case (mode at center)', () => {
      const dist = new PERTDistribution(0, 5, 10);
      const rng1 = new SimpleRNG(999);
      const samples = Array.from({ length: 5000 }, () => dist.sample(rng1));
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;

      // Mean should be close to mode for symmetric case
      expect(mean).toBeGreaterThan(4.8);
      expect(mean).toBeLessThan(5.2);
    });
  });

  describe('pdf', () => {
    it('should return 0 for x < min', () => {
      const dist = new PERTDistribution(1, 3, 5);
      expect(dist.pdf(0)).toBe(0);
      expect(dist.pdf(0.5)).toBe(0);
      expect(dist.pdf(-1)).toBe(0);
    });

    it('should return 0 for x > max', () => {
      const dist = new PERTDistribution(1, 3, 5);
      expect(dist.pdf(6)).toBe(0);
      expect(dist.pdf(10)).toBe(0);
    });

    it('should return positive density for min < x < max', () => {
      const dist = new PERTDistribution(1, 3, 5);
      expect(dist.pdf(1.1)).toBeGreaterThan(0); // Slightly above min
      expect(dist.pdf(3)).toBeGreaterThan(0);
      expect(dist.pdf(4.9)).toBeGreaterThan(0); // Slightly below max
      expect(dist.pdf(2.5)).toBeGreaterThan(0);
    });

    it('should have maximum near mode', () => {
      const dist = new PERTDistribution(0, 5, 10);
      const pdfAtMode = dist.pdf(5);
      const pdfBefore = dist.pdf(4);
      const pdfAfter = dist.pdf(6);

      expect(pdfAtMode).toBeGreaterThan(pdfBefore * 0.95); // Allow slight variation
      expect(pdfAtMode).toBeGreaterThan(pdfAfter * 0.95);
    });

    it('should integrate to approximately 1 using trapezoidal rule', () => {
      const dist = new PERTDistribution(1, 3, 5);
      let integral = 0;
      const dx = 0.01;

      for (let x = 1; x <= 5; x += dx) {
        integral += dist.pdf(x) * dx;
      }

      expect(integral).toBeGreaterThan(0.98);
      expect(integral).toBeLessThan(1.02);
    });

    it('should handle mode near min', () => {
      const dist = new PERTDistribution(0, 1, 10);
      expect(dist.pdf(1)).toBeGreaterThan(0);
      expect(isFinite(dist.pdf(1))).toBe(true);
      expect(isFinite(dist.pdf(5))).toBe(true);
    });

    it('should handle mode near max', () => {
      const dist = new PERTDistribution(0, 9, 10);
      expect(dist.pdf(9)).toBeGreaterThan(0);
      expect(isFinite(dist.pdf(9))).toBe(true);
      expect(isFinite(dist.pdf(5))).toBe(true);
    });
  });

  describe('cdf', () => {
    it('should return 0 for x <= min', () => {
      const dist = new PERTDistribution(1, 3, 5);
      expect(dist.cdf(0)).toBe(0);
      expect(dist.cdf(0.5)).toBe(0);
      expect(dist.cdf(1)).toBe(0);
    });

    it('should return 1 for x >= max', () => {
      const dist = new PERTDistribution(1, 3, 5);
      expect(dist.cdf(5)).toBe(1);
      expect(dist.cdf(6)).toBe(1);
      expect(dist.cdf(10)).toBe(1);
    });

    it('should be monotonically increasing for min < x < max', () => {
      const dist = new PERTDistribution(1, 3, 5);
      const x1 = dist.cdf(2);
      const x2 = dist.cdf(3);
      const x3 = dist.cdf(4);

      expect(x2).toBeGreaterThan(x1);
      expect(x3).toBeGreaterThan(x2);
    });

    it('should be between 0 and 1', () => {
      const dist = new PERTDistribution(1, 3, 5);
      for (let x = 1; x <= 5; x += 0.5) {
        const cdf = dist.cdf(x);
        expect(cdf).toBeGreaterThanOrEqual(0);
        expect(cdf).toBeLessThanOrEqual(1);
      }
    });

    it('should be consistent with PDF through differentiation', () => {
      const dist = new PERTDistribution(1, 3, 5);
      const x = 3;
      const h = 0.0001;

      // Numerical derivative of CDF should approximate PDF
      const numericalDerivative = (dist.cdf(x + h) - dist.cdf(x - h)) / (2 * h);
      const pdfValue = dist.pdf(x);

      expect(numericalDerivative).toBeCloseTo(pdfValue, 2);
    });

    it('should handle symmetric case', () => {
      const dist = new PERTDistribution(0, 5, 10);
      // CDF at mode should be around 0.5 for symmetric case
      const cdfAtMode = dist.cdf(5);
      expect(cdfAtMode).toBeGreaterThan(0.4);
      expect(cdfAtMode).toBeLessThan(0.6);
    });
  });

  describe('inverseCDF', () => {
    it('should return min for p=0', () => {
      const dist = new PERTDistribution(1, 3, 5);
      expect(dist.inverseCDF(0)).toBe(1);
    });

    it('should return max for p=1', () => {
      const dist = new PERTDistribution(1, 3, 5);
      expect(dist.inverseCDF(1)).toBe(5);
    });

    it('should throw error for p < 0', () => {
      const dist = new PERTDistribution(1, 3, 5);
      expect(() => dist.inverseCDF(-0.1)).toThrow('Probability must be between 0 and 1');
    });

    it('should throw error for p > 1', () => {
      const dist = new PERTDistribution(1, 3, 5);
      expect(() => dist.inverseCDF(1.1)).toThrow('Probability must be between 0 and 1');
    });

    it('should be inverse of CDF', () => {
      const dist = new PERTDistribution(1, 3, 5);
      const testValues = [0.1, 0.25, 0.5, 0.75, 0.9];

      testValues.forEach((p) => {
        const x = dist.inverseCDF(p);
        const computedP = dist.cdf(x);
        expect(computedP).toBeCloseTo(p, 3);
      });
    });

    it('should satisfy: CDF(inverseCDF(p)) = p', () => {
      const dist = new PERTDistribution(0, 5, 10);
      const probabilities = [0.01, 0.1, 0.25, 0.5, 0.75, 0.9, 0.99];

      probabilities.forEach((p) => {
        const x = dist.inverseCDF(p);
        const recoveredP = dist.cdf(x);
        expect(recoveredP).toBeCloseTo(p, 3);
      });
    });

    it('should be monotonically increasing', () => {
      const dist = new PERTDistribution(1, 3, 5);
      const p1 = dist.inverseCDF(0.3);
      const p2 = dist.inverseCDF(0.5);
      const p3 = dist.inverseCDF(0.7);

      expect(p2).toBeGreaterThan(p1);
      expect(p3).toBeGreaterThan(p2);
    });

    it('should return values within [min, max]', () => {
      const dist = new PERTDistribution(1, 3, 5);
      for (let p = 0; p <= 1; p += 0.1) {
        const x = dist.inverseCDF(p);
        expect(x).toBeGreaterThanOrEqual(1);
        expect(x).toBeLessThanOrEqual(5);
      }
    });
  });

  describe('mean', () => {
    it('should return (min + 4*mode + max) / 6', () => {
      const dist = new PERTDistribution(1, 3, 5);
      // Mean = (1 + 4*3 + 5) / 6 = 18/6 = 3
      expect(dist.mean).toBeCloseTo(3, 10);
    });

    it('should be consistent with sample mean', () => {
      const dist = new PERTDistribution(0, 5, 10);
      const samples = Array.from({ length: 10000 }, () => dist.sample(rng));
      const sampleMean = samples.reduce((a, b) => a + b, 0) / samples.length;

      expect(sampleMean).toBeCloseTo(dist.mean, 1);
    });

    it('should be closer to mode than arithmetic mean of min and max', () => {
      const dist = new PERTDistribution(0, 2, 10);
      const arithmeticMean = (0 + 10) / 2; // 5

      // PERT mean should be closer to mode (2) than arithmetic mean (5)
      expect(Math.abs(dist.mean - 2)).toBeLessThan(Math.abs(arithmeticMean - 2));
    });
  });

  describe('variance', () => {
    it('should return ((mean - min) * (max - mean)) / 7', () => {
      const dist = new PERTDistribution(1, 3, 5);
      const mean = (1 + 4 * 3 + 5) / 6; // 3
      const expectedVariance = ((mean - 1) * (5 - mean)) / 7;
      expect(dist.variance).toBeCloseTo(expectedVariance, 10);
    });

    it('should be consistent with sample variance', () => {
      const dist = new PERTDistribution(0, 5, 10);
      const samples = Array.from({ length: 10000 }, () => dist.sample(rng));
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      const sampleVariance =
        samples.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / samples.length;

      expect(sampleVariance).toBeCloseTo(dist.variance, 0);
    });

    it('should be positive', () => {
      const dist = new PERTDistribution(1, 3, 5);
      expect(dist.variance).toBeGreaterThan(0);
    });
  });

  describe('validateParameters', () => {
    it('should return true for valid parameters', () => {
      const dist = new PERTDistribution(1, 3, 5);
      expect(dist.validateParameters()).toBe(true);
    });

    it('should throw error when min >= mode', () => {
      const dist = new PERTDistribution(1, 3, 5);
      (dist as any).min = 4;
      expect(() => dist.validateParameters()).toThrow('Min must be less than mode');
    });

    it('should throw error when mode >= max', () => {
      const dist = new PERTDistribution(1, 3, 5);
      (dist as any).mode = 6;
      expect(() => dist.validateParameters()).toThrow('Mode must be less than max');
    });

    it('should throw error for infinite parameters', () => {
      const dist = new PERTDistribution(1, 3, 5);
      (dist as any).max = Infinity;
      expect(() => dist.validateParameters()).toThrow('Parameters must be finite numbers');
    });
  });

  describe('performance', () => {
    it('should generate 100k samples in reasonable time', () => {
      const dist = new PERTDistribution(1, 3, 5);
      const start = Date.now();

      for (let i = 0; i < 100000; i++) {
        dist.sample(rng);
      }

      const elapsed = Date.now() - start;
      // Should generate 100k samples in under 300ms (relaxed for CI, uses Beta internally)
      expect(elapsed).toBeLessThan(300);
    });
  });

  describe('special cases', () => {
    it('should reduce to triangular-like when mode is at center', () => {
      const dist = new PERTDistribution(0, 5, 10);
      // Mean should equal mode for symmetric case
      expect(dist.mean).toBeCloseTo(5, 10);
    });

    it('should handle very small ranges', () => {
      const dist = new PERTDistribution(1, 1.1, 1.2);
      expect(dist.mean).toBeGreaterThan(1);
      expect(dist.mean).toBeLessThan(1.2);
      expect(isFinite(dist.pdf(1.1))).toBe(true);
      expect(isFinite(dist.cdf(1.1))).toBe(true);
    });

    it('should handle very large ranges', () => {
      const dist = new PERTDistribution(0, 500, 1000);
      expect(dist.mean).toBeGreaterThan(0);
      expect(dist.mean).toBeLessThan(1000);
      expect(isFinite(dist.variance)).toBe(true);
    });

    it('should demonstrate relationship to Beta distribution', () => {
      // PERT uses Beta distribution internally
      const dist = new PERTDistribution(0, 0.3, 1);

      // Alpha = 1 + 4*(mode-min)/(max-min) = 1 + 4*0.3 = 2.2
      // Beta = 1 + 4*(max-mode)/(max-min) = 1 + 4*0.7 = 3.8

      const sample = dist.sample(rng);
      expect(sample).toBeGreaterThanOrEqual(0);
      expect(sample).toBeLessThanOrEqual(1);
    });
  });
});
