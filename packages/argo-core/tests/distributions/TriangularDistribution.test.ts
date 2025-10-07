import { TriangularDistribution } from '../../src/distributions/TriangularDistribution';
import { SimpleRNG } from '../../src/utils/SimpleRNG';

describe('TriangularDistribution', () => {
  let rng: SimpleRNG;

  beforeEach(() => {
    rng = new SimpleRNG(42);
  });

  describe('constructor', () => {
    it('should create distribution with valid parameters', () => {
      const dist = new TriangularDistribution(0, 5, 10);
      expect(dist).toBeInstanceOf(TriangularDistribution);
      expect(dist.min).toBe(0);
      expect(dist.mode).toBe(5);
      expect(dist.max).toBe(10);
    });

    it('should throw error when min > max', () => {
      expect(() => new TriangularDistribution(10, 5, 0)).toThrow(
        'max must be greater than min'
      );
    });

    it('should throw error when min = max', () => {
      expect(() => new TriangularDistribution(5, 5, 5)).toThrow(
        'max must be greater than min'
      );
    });

    it('should throw error when mode < min', () => {
      expect(() => new TriangularDistribution(0, -1, 10)).toThrow(
        'mode must be between min and max'
      );
    });

    it('should throw error when mode > max', () => {
      expect(() => new TriangularDistribution(0, 11, 10)).toThrow(
        'mode must be between min and max'
      );
    });

    it('should accept mode = min', () => {
      const dist = new TriangularDistribution(0, 0, 10);
      expect(dist.mode).toBe(0);
    });

    it('should accept mode = max', () => {
      const dist = new TriangularDistribution(0, 10, 10);
      expect(dist.mode).toBe(10);
    });

    it('should accept negative values', () => {
      const dist = new TriangularDistribution(-10, -5, 0);
      expect(dist.min).toBe(-10);
      expect(dist.mode).toBe(-5);
      expect(dist.max).toBe(0);
    });
  });

  describe('sample', () => {
    it('should generate samples between min and max', () => {
      const dist = new TriangularDistribution(0, 5, 10);
      const samples: number[] = [];

      for (let i = 0; i < 1000; i++) {
        samples.push(dist.sample(rng));
      }

      // All samples should be within [min, max]
      expect(samples.every((x) => x >= 0 && x <= 10)).toBe(true);
    });

    it('should generate samples with mean approximately (min+mode+max)/3', () => {
      const dist = new TriangularDistribution(0, 5, 10);
      const samples: number[] = [];

      for (let i = 0; i < 10000; i++) {
        samples.push(dist.sample(rng));
      }

      // Expected mean = (0 + 5 + 10) / 3 = 5
      const mean = samples.reduce((a, b) => a + b) / samples.length;
      expect(mean).toBeGreaterThan(4.5);
      expect(mean).toBeLessThan(5.5);
    });

    it('should cluster around mode', () => {
      const dist = new TriangularDistribution(0, 8, 10);
      const samples: number[] = [];

      for (let i = 0; i < 10000; i++) {
        samples.push(dist.sample(rng));
      }

      // More samples should be in the upper half (closer to mode at 8)
      const upperHalf = samples.filter((x) => x >= 5).length;
      const lowerHalf = samples.filter((x) => x < 5).length;

      expect(upperHalf).toBeGreaterThan(lowerHalf);
    });

    it('should work with negative ranges', () => {
      const dist = new TriangularDistribution(-10, 0, 10);
      const samples: number[] = [];

      for (let i = 0; i < 1000; i++) {
        samples.push(dist.sample(rng));
      }

      expect(samples.every((x) => x >= -10 && x <= 10)).toBe(true);
    });

    it('should generate different values with different seeds', () => {
      const dist = new TriangularDistribution(0, 5, 10);
      const rng1 = new SimpleRNG(42);
      const rng2 = new SimpleRNG(99);

      const sample1 = dist.sample(rng1);
      const sample2 = dist.sample(rng2);

      expect(sample1).not.toBe(sample2);
    });

    it('should generate reproducible values with same seed', () => {
      const dist = new TriangularDistribution(0, 5, 10);
      const rng1 = new SimpleRNG(42);
      const rng2 = new SimpleRNG(42);

      const sample1 = dist.sample(rng1);
      const sample2 = dist.sample(rng2);

      expect(sample1).toBe(sample2);
    });

    it('should handle mode at min edge case', () => {
      const dist = new TriangularDistribution(0, 0, 10);
      const samples: number[] = [];

      for (let i = 0; i < 1000; i++) {
        samples.push(dist.sample(rng));
      }

      expect(samples.every((x) => x >= 0 && x <= 10)).toBe(true);
    });

    it('should handle mode at max edge case', () => {
      const dist = new TriangularDistribution(0, 10, 10);
      const samples: number[] = [];

      for (let i = 0; i < 1000; i++) {
        samples.push(dist.sample(rng));
      }

      expect(samples.every((x) => x >= 0 && x <= 10)).toBe(true);
    });
  });

  describe('pdf', () => {
    it('should return 0 for x < min', () => {
      const dist = new TriangularDistribution(0, 5, 10);

      expect(dist.pdf(-1)).toBe(0);
      expect(dist.pdf(-0.1)).toBe(0);
    });

    it('should return 0 for x > max', () => {
      const dist = new TriangularDistribution(0, 5, 10);

      expect(dist.pdf(10.1)).toBe(0);
      expect(dist.pdf(15)).toBe(0);
    });

    it('should calculate PDF correctly for x < mode', () => {
      const dist = new TriangularDistribution(0, 5, 10);

      // At x = 2.5 (midpoint between min and mode)
      // PDF = 2(x-a)/((b-a)(c-a)) = 2(2.5-0)/((10-0)(5-0)) = 5/50 = 0.1
      expect(dist.pdf(2.5)).toBeCloseTo(0.1, 10);
    });

    it('should calculate PDF correctly for x > mode', () => {
      const dist = new TriangularDistribution(0, 5, 10);

      // At x = 7.5 (midpoint between mode and max)
      // PDF = 2(b-x)/((b-a)(b-c)) = 2(10-7.5)/((10-0)(10-5)) = 5/50 = 0.1
      expect(dist.pdf(7.5)).toBeCloseTo(0.1, 10);
    });

    it('should reach maximum at mode', () => {
      const dist = new TriangularDistribution(0, 5, 10);

      // PDF at mode = 2/(b-a) = 2/(10-0) = 0.2
      const pdfAtMode = dist.pdf(5);
      const pdfBefore = dist.pdf(2.5);
      const pdfAfter = dist.pdf(7.5);

      expect(pdfAtMode).toBeGreaterThan(pdfBefore);
      expect(pdfAtMode).toBeGreaterThan(pdfAfter);
      expect(pdfAtMode).toBeCloseTo(0.2, 10);
    });

    it('should be continuous at mode', () => {
      const dist = new TriangularDistribution(0, 5, 10);

      const epsilon = 0.0001;
      const pdfBeforeMode = dist.pdf(5 - epsilon);
      const pdfAtMode = dist.pdf(5);
      const pdfAfterMode = dist.pdf(5 + epsilon);

      // Should be approximately equal (continuous)
      expect(pdfBeforeMode).toBeCloseTo(pdfAtMode, 2);
      expect(pdfAfterMode).toBeCloseTo(pdfAtMode, 2);
    });

    it('should integrate to approximately 1', () => {
      const dist = new TriangularDistribution(0, 5, 10);

      // Numerical integration using trapezoidal rule
      const dx = 0.01;
      let integral = 0;

      for (let x = 0; x <= 10; x += dx) {
        integral += dist.pdf(x) * dx;
      }

      expect(integral).toBeCloseTo(1, 1);
    });

    it('should work with negative ranges', () => {
      const dist = new TriangularDistribution(-10, 0, 10);

      // At mode (x=0)
      // PDF = 2/(b-a) = 2/(10-(-10)) = 2/20 = 0.1
      expect(dist.pdf(0)).toBeCloseTo(0.1, 10);
    });
  });

  describe('cdf', () => {
    it('should return 0 for x < min', () => {
      const dist = new TriangularDistribution(0, 5, 10);

      expect(dist.cdf(-5)).toBe(0);
      expect(dist.cdf(-0.1)).toBe(0);
    });

    it('should return 1 for x >= max', () => {
      const dist = new TriangularDistribution(0, 5, 10);

      expect(dist.cdf(10)).toBe(1);
      expect(dist.cdf(15)).toBe(1);
    });

    it('should calculate CDF correctly for x < mode', () => {
      const dist = new TriangularDistribution(0, 5, 10);

      // At min, CDF should be 0
      expect(dist.cdf(0)).toBe(0);

      // At x = 2.5
      // CDF = (x-a)²/((b-a)(c-a)) = (2.5)²/((10)(5)) = 6.25/50 = 0.125
      expect(dist.cdf(2.5)).toBeCloseTo(0.125, 10);
    });

    it('should calculate CDF correctly for x >= mode', () => {
      const dist = new TriangularDistribution(0, 5, 10);

      // At x = 7.5
      // CDF = 1 - (b-x)²/((b-a)(b-c)) = 1 - (10-7.5)²/((10)(5)) = 1 - 6.25/50 = 0.875
      expect(dist.cdf(7.5)).toBeCloseTo(0.875, 10);
    });

    it('should be monotonically increasing', () => {
      const dist = new TriangularDistribution(0, 5, 10);

      expect(dist.cdf(0)).toBeLessThan(dist.cdf(2.5));
      expect(dist.cdf(2.5)).toBeLessThan(dist.cdf(5));
      expect(dist.cdf(5)).toBeLessThan(dist.cdf(7.5));
      expect(dist.cdf(7.5)).toBeLessThan(dist.cdf(10));
    });

    it('should have specific value at mode', () => {
      const dist = new TriangularDistribution(0, 5, 10);

      // At mode, CDF = (c-a)/(b-a) = (5-0)/(10-0) = 0.5
      expect(dist.cdf(5)).toBeCloseTo(0.5, 10);
    });

    it('should work with negative ranges', () => {
      const dist = new TriangularDistribution(-10, 0, 10);

      expect(dist.cdf(-10)).toBe(0);
      expect(dist.cdf(0)).toBeCloseTo(0.5, 10);
      expect(dist.cdf(10)).toBe(1);
    });

    it('should be continuous at mode', () => {
      const dist = new TriangularDistribution(0, 5, 10);

      const epsilon = 0.0001;
      const cdfBeforeMode = dist.cdf(5 - epsilon);
      const cdfAtMode = dist.cdf(5);
      const cdfAfterMode = dist.cdf(5 + epsilon);

      expect(cdfBeforeMode).toBeLessThan(cdfAtMode);
      expect(cdfAtMode).toBeLessThan(cdfAfterMode);
      expect(Math.abs(cdfAtMode - cdfBeforeMode)).toBeLessThan(0.01);
      expect(Math.abs(cdfAfterMode - cdfAtMode)).toBeLessThan(0.01);
    });
  });

  describe('inverseCDF', () => {
    it('should return min for p=0', () => {
      const dist = new TriangularDistribution(0, 5, 10);

      expect(dist.inverseCDF(0)).toBe(0);
    });

    it('should return max for p=1', () => {
      const dist = new TriangularDistribution(0, 5, 10);

      expect(dist.inverseCDF(1)).toBe(10);
    });

    it('should return mode for p at mode CDF', () => {
      const dist = new TriangularDistribution(0, 5, 10);

      // CDF at mode = (c-a)/(b-a) = 0.5
      expect(dist.inverseCDF(0.5)).toBeCloseTo(5, 10);
    });

    it('should throw error for invalid probabilities', () => {
      const dist = new TriangularDistribution(0, 5, 10);

      expect(() => dist.inverseCDF(-0.1)).toThrow('Probability must be between 0 and 1');
      expect(() => dist.inverseCDF(1.1)).toThrow('Probability must be between 0 and 1');
    });

    it('should be inverse of CDF for x < mode', () => {
      const dist = new TriangularDistribution(0, 5, 10);

      const x = 2.5;
      const p = dist.cdf(x);
      const xRecovered = dist.inverseCDF(p);

      expect(xRecovered).toBeCloseTo(x, 10);
    });

    it('should be inverse of CDF for x >= mode', () => {
      const dist = new TriangularDistribution(0, 5, 10);

      const x = 7.5;
      const p = dist.cdf(x);
      const xRecovered = dist.inverseCDF(p);

      expect(xRecovered).toBeCloseTo(x, 10);
    });

    it('should work with negative ranges', () => {
      const dist = new TriangularDistribution(-10, 0, 10);

      expect(dist.inverseCDF(0)).toBe(-10);
      expect(dist.inverseCDF(0.5)).toBeCloseTo(0, 10);
      expect(dist.inverseCDF(1)).toBe(10);
    });

    it('should handle mode at min edge case', () => {
      const dist = new TriangularDistribution(0, 0, 10);

      expect(dist.inverseCDF(0)).toBe(0);
      expect(dist.inverseCDF(1)).toBe(10);

      // For various probabilities
      for (let p = 0.1; p <= 0.9; p += 0.1) {
        const x = dist.inverseCDF(p);
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(10);
      }
    });

    it('should handle mode at max edge case', () => {
      const dist = new TriangularDistribution(0, 10, 10);

      expect(dist.inverseCDF(0)).toBe(0);
      expect(dist.inverseCDF(1)).toBe(10);

      // For various probabilities
      for (let p = 0.1; p <= 0.9; p += 0.1) {
        const x = dist.inverseCDF(p);
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(10);
      }
    });
  });

  describe('validateParameters', () => {
    it('should return true for valid parameters', () => {
      const dist = new TriangularDistribution(0, 5, 10);
      expect(dist.validateParameters()).toBe(true);
    });

    it('should throw for invalid parameters in constructor', () => {
      expect(() => new TriangularDistribution(10, 5, 0)).toThrow();
      expect(() => new TriangularDistribution(0, -1, 10)).toThrow();
      expect(() => new TriangularDistribution(0, 11, 10)).toThrow();
    });

    it('should throw for non-finite values', () => {
      expect(() => new TriangularDistribution(NaN, 5, 10)).toThrow(
        'min, mode, and max must be finite'
      );
      expect(() => new TriangularDistribution(0, NaN, 10)).toThrow(
        'min, mode, and max must be finite'
      );
      expect(() => new TriangularDistribution(0, 5, Infinity)).toThrow(
        'min, mode, and max must be finite'
      );
    });
  });

  describe('properties', () => {
    it('should expose min, mode, and max properties', () => {
      const dist = new TriangularDistribution(2, 7, 12);

      expect(dist.min).toBe(2);
      expect(dist.mode).toBe(7);
      expect(dist.max).toBe(12);
    });
  });
});
