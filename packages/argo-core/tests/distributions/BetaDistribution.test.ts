import { BetaDistribution } from '../../src/distributions/BetaDistribution';
import { SimpleRNG } from '../../src/utils/SimpleRNG';

describe('BetaDistribution', () => {
  let rng: SimpleRNG;

  beforeEach(() => {
    rng = new SimpleRNG(42); // Seeded for reproducibility
  });

  describe('constructor', () => {
    it('should create distribution with valid parameters', () => {
      const dist = new BetaDistribution(2, 5);
      expect(dist).toBeInstanceOf(BetaDistribution);
      expect(dist.alpha).toBe(2);
      expect(dist.beta).toBe(5);
    });

    it('should throw error when alpha is zero', () => {
      expect(() => new BetaDistribution(0, 5)).toThrow('Alpha must be positive');
    });

    it('should throw error when alpha is negative', () => {
      expect(() => new BetaDistribution(-2, 5)).toThrow('Alpha must be positive');
    });

    it('should throw error when beta is zero', () => {
      expect(() => new BetaDistribution(2, 0)).toThrow('Beta must be positive');
    });

    it('should throw error when beta is negative', () => {
      expect(() => new BetaDistribution(2, -5)).toThrow('Beta must be positive');
    });

    it('should accept symmetric parameters', () => {
      const dist = new BetaDistribution(3, 3);
      expect(dist.alpha).toBe(3);
      expect(dist.beta).toBe(3);
    });

    it('should accept very small positive parameters', () => {
      const dist = new BetaDistribution(0.1, 0.1);
      expect(dist.alpha).toBe(0.1);
      expect(dist.beta).toBe(0.1);
    });

    it('should accept large parameters', () => {
      const dist = new BetaDistribution(100, 200);
      expect(dist.alpha).toBe(100);
      expect(dist.beta).toBe(200);
    });
  });

  describe('sample', () => {
    it('should generate samples between 0 and 1', () => {
      const dist = new BetaDistribution(2, 5);

      for (let i = 0; i < 1000; i++) {
        const sample = dist.sample(rng);
        expect(sample).toBeGreaterThanOrEqual(0);
        expect(sample).toBeLessThanOrEqual(1);
      }
    });

    it('should generate samples with correct mean for α=2, β=5', () => {
      const dist = new BetaDistribution(2, 5);
      const samples: number[] = [];

      for (let i = 0; i < 10000; i++) {
        samples.push(dist.sample(rng));
      }

      const sampleMean = samples.reduce((a, b) => a + b) / samples.length;
      const expectedMean = 2 / (2 + 5); // α/(α+β) = 2/7 ≈ 0.286

      // Allow 5% error margin
      expect(sampleMean).toBeGreaterThan(expectedMean * 0.95);
      expect(sampleMean).toBeLessThan(expectedMean * 1.05);
    });

    it('should generate samples with correct variance for α=2, β=5', () => {
      const dist = new BetaDistribution(2, 5);
      const samples: number[] = [];

      for (let i = 0; i < 10000; i++) {
        samples.push(dist.sample(rng));
      }

      const sampleMean = samples.reduce((a, b) => a + b) / samples.length;
      const sampleVariance = samples.reduce((sum, x) => sum + Math.pow(x - sampleMean, 2), 0) / (samples.length - 1);

      // β(α,β) variance = αβ/[(α+β)²(α+β+1)]
      const expectedVariance = (2 * 5) / (Math.pow(2 + 5, 2) * (2 + 5 + 1)); // ≈ 0.0255

      // Allow 15% error margin for variance
      expect(sampleVariance).toBeGreaterThan(expectedVariance * 0.85);
      expect(sampleVariance).toBeLessThan(expectedVariance * 1.15);
    });

    it('should generate symmetric distribution when α=β', () => {
      const dist = new BetaDistribution(3, 3);
      const samples: number[] = [];

      for (let i = 0; i < 10000; i++) {
        samples.push(dist.sample(rng));
      }

      const sampleMean = samples.reduce((a, b) => a + b) / samples.length;

      // Mean should be around 0.5 for symmetric distribution
      expect(sampleMean).toBeGreaterThan(0.48);
      expect(sampleMean).toBeLessThan(0.52);
    });

    it('should generate skewed distribution when α≠β', () => {
      const dist = new BetaDistribution(8, 2);
      const samples: number[] = [];

      for (let i = 0; i < 10000; i++) {
        samples.push(dist.sample(rng));
      }

      const sampleMean = samples.reduce((a, b) => a + b) / samples.length;
      const expectedMean = 8 / (8 + 2); // 0.8

      expect(sampleMean).toBeGreaterThan(0.75);
      expect(sampleMean).toBeLessThan(0.85);
    });

    it('should generate different values with different seeds', () => {
      const dist = new BetaDistribution(2, 5);
      const rng1 = new SimpleRNG(42);
      const rng2 = new SimpleRNG(123);

      const sample1 = dist.sample(rng1);
      const sample2 = dist.sample(rng2);

      expect(sample1).not.toBe(sample2);
    });

    it('should generate reproducible values with same seed', () => {
      const dist = new BetaDistribution(2, 5);
      const rng1 = new SimpleRNG(42);
      const rng2 = new SimpleRNG(42);

      const samples1: number[] = [];
      const samples2: number[] = [];

      for (let i = 0; i < 10; i++) {
        samples1.push(dist.sample(rng1));
        samples2.push(dist.sample(rng2));
      }

      expect(samples1).toEqual(samples2);
    });

    it('should handle extreme α>>β case', () => {
      const dist = new BetaDistribution(100, 1);
      const samples: number[] = [];

      for (let i = 0; i < 1000; i++) {
        const sample = dist.sample(rng);
        samples.push(sample);
        expect(sample).toBeGreaterThanOrEqual(0);
        expect(sample).toBeLessThanOrEqual(1);
      }

      // Should be concentrated near 1
      const sampleMean = samples.reduce((a, b) => a + b) / samples.length;
      expect(sampleMean).toBeGreaterThan(0.95);
    });

    it('should handle extreme β>>α case', () => {
      const dist = new BetaDistribution(1, 100);
      const samples: number[] = [];

      for (let i = 0; i < 1000; i++) {
        const sample = dist.sample(rng);
        samples.push(sample);
        expect(sample).toBeGreaterThanOrEqual(0);
        expect(sample).toBeLessThanOrEqual(1);
      }

      // Should be concentrated near 0
      const sampleMean = samples.reduce((a, b) => a + b) / samples.length;
      expect(sampleMean).toBeLessThan(0.05);
    });
  });

  describe('pdf', () => {
    it('should return 0 for x < 0', () => {
      const dist = new BetaDistribution(2, 5);
      expect(dist.pdf(-0.1)).toBe(0);
      expect(dist.pdf(-1)).toBe(0);
    });

    it('should return 0 for x > 1', () => {
      const dist = new BetaDistribution(2, 5);
      expect(dist.pdf(1.1)).toBe(0);
      expect(dist.pdf(2)).toBe(0);
    });

    it('should calculate PDF correctly for α=2, β=5 at x=0.3', () => {
      const dist = new BetaDistribution(2, 5);
      const pdf = dist.pdf(0.3);

      // Beta(2,5) at x=0.3: B(α,β) = Γ(α)Γ(β)/Γ(α+β)
      // PDF = x^(α-1) * (1-x)^(β-1) / B(α,β)
      // For α=2, β=5: x * (1-x)^4 / B(2,5)
      // B(2,5) = 1!*4!/6! = 1*24/720 = 1/30
      // PDF = 0.3 * 0.7^4 * 30 = 0.3 * 0.2401 * 30 ≈ 2.161

      expect(pdf).toBeGreaterThan(2.0);
      expect(pdf).toBeLessThan(2.3);
    });

    it('should be symmetric for α=β', () => {
      const dist = new BetaDistribution(3, 3);

      expect(dist.pdf(0.3)).toBeCloseTo(dist.pdf(0.7), 2);
      expect(dist.pdf(0.4)).toBeCloseTo(dist.pdf(0.6), 2);
    });

    it('should have maximum at (α-1)/(α+β-2) for α>1, β>1', () => {
      const dist = new BetaDistribution(3, 5);

      // Mode = (α-1)/(α+β-2) = 2/6 = 0.333...
      const mode = (3 - 1) / (3 + 5 - 2);
      const pdfAtMode = dist.pdf(mode);

      // Check that nearby points have lower PDF
      expect(pdfAtMode).toBeGreaterThan(dist.pdf(mode - 0.1));
      expect(pdfAtMode).toBeGreaterThan(dist.pdf(mode + 0.1));
    });

    it('should handle edge cases at x=0 and x=1', () => {
      const dist = new BetaDistribution(2, 2);

      // For α>1, β>1, PDF should be 0 at boundaries
      expect(dist.pdf(0)).toBe(0);
      expect(dist.pdf(1)).toBe(0);
    });

    it('should handle uniform case α=1, β=1', () => {
      const dist = new BetaDistribution(1, 1);

      // Beta(1,1) is uniform on [0,1], so PDF = 1
      expect(dist.pdf(0.5)).toBeCloseTo(1, 5);
      expect(dist.pdf(0.2)).toBeCloseTo(1, 5);
      expect(dist.pdf(0.8)).toBeCloseTo(1, 5);
    });
  });

  describe('cdf', () => {
    it('should return 0 for x <= 0', () => {
      const dist = new BetaDistribution(2, 5);
      expect(dist.cdf(-1)).toBe(0);
      expect(dist.cdf(0)).toBe(0);
    });

    it('should return 1 for x >= 1', () => {
      const dist = new BetaDistribution(2, 5);
      expect(dist.cdf(1)).toBe(1);
      expect(dist.cdf(2)).toBe(1);
    });

    it('should be monotonically increasing', () => {
      const dist = new BetaDistribution(2, 5);

      const values = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
      const cdfs = values.map(x => dist.cdf(x));

      for (let i = 1; i < cdfs.length; i++) {
        expect(cdfs[i]).toBeGreaterThan(cdfs[i - 1]);
      }
    });

    it('should calculate CDF correctly for α=2, β=2', () => {
      const dist = new BetaDistribution(2, 2);

      // For Beta(2,2), CDF at x=0.5 should be 0.5 (symmetric)
      expect(dist.cdf(0.5)).toBeCloseTo(0.5, 2);
    });

    it('should be consistent with PDF via numerical integration', () => {
      const dist = new BetaDistribution(3, 4);
      const x = 0.4;

      // Numerical integration of PDF from 0 to x
      const dx = 0.001;
      let numericalCDF = 0;
      for (let t = dx / 2; t < x; t += dx) {
        numericalCDF += dist.pdf(t) * dx;
      }

      const analyticalCDF = dist.cdf(x);

      // Should be close (within 1%)
      expect(Math.abs(analyticalCDF - numericalCDF) / analyticalCDF).toBeLessThan(0.01);
    });

    it('should handle uniform case α=1, β=1', () => {
      const dist = new BetaDistribution(1, 1);

      // Beta(1,1) is uniform, so CDF(x) = x
      expect(dist.cdf(0.25)).toBeCloseTo(0.25, 5);
      expect(dist.cdf(0.5)).toBeCloseTo(0.5, 5);
      expect(dist.cdf(0.75)).toBeCloseTo(0.75, 5);
    });
  });

  describe('inverseCDF', () => {
    it('should throw error for p < 0', () => {
      const dist = new BetaDistribution(2, 5);
      expect(() => dist.inverseCDF(-0.1)).toThrow('Probability must be between 0 and 1');
    });

    it('should throw error for p > 1', () => {
      const dist = new BetaDistribution(2, 5);
      expect(() => dist.inverseCDF(1.1)).toThrow('Probability must be between 0 and 1');
    });

    it('should return 0 for p=0', () => {
      const dist = new BetaDistribution(2, 5);
      expect(dist.inverseCDF(0)).toBeCloseTo(0, 5);
    });

    it('should return 1 for p=1', () => {
      const dist = new BetaDistribution(2, 5);
      expect(dist.inverseCDF(1)).toBeCloseTo(1, 5);
    });

    it('should be inverse of CDF', () => {
      const dist = new BetaDistribution(3, 4);
      const testValues = [0.1, 0.3, 0.5, 0.7, 0.9];

      for (const x of testValues) {
        const p = dist.cdf(x);
        const xRecovered = dist.inverseCDF(p);
        expect(xRecovered).toBeCloseTo(x, 4);
      }
    });

    it('should return median (≈0.5) for symmetric distribution', () => {
      const dist = new BetaDistribution(5, 5);
      const median = dist.inverseCDF(0.5);

      expect(median).toBeGreaterThan(0.48);
      expect(median).toBeLessThan(0.52);
    });

    it('should handle uniform case α=1, β=1', () => {
      const dist = new BetaDistribution(1, 1);

      // For uniform, inverseCDF(p) = p
      expect(dist.inverseCDF(0.25)).toBeCloseTo(0.25, 5);
      expect(dist.inverseCDF(0.5)).toBeCloseTo(0.5, 5);
      expect(dist.inverseCDF(0.75)).toBeCloseTo(0.75, 5);
    });

    it('should work correctly for various probabilities', () => {
      const dist = new BetaDistribution(2, 5);

      const p1 = dist.inverseCDF(0.1);
      const p2 = dist.inverseCDF(0.5);
      const p3 = dist.inverseCDF(0.9);

      expect(p1).toBeLessThan(p2);
      expect(p2).toBeLessThan(p3);
      expect(p1).toBeGreaterThan(0);
      expect(p3).toBeLessThan(1);
    });
  });

  describe('mean', () => {
    it('should calculate mean correctly', () => {
      const dist = new BetaDistribution(2, 5);
      const expectedMean = 2 / (2 + 5); // α/(α+β)

      expect(dist.mean).toBeCloseTo(expectedMean, 10);
    });

    it('should be 0.5 for symmetric distribution', () => {
      const dist = new BetaDistribution(3, 3);
      expect(dist.mean).toBeCloseTo(0.5, 10);
    });

    it('should handle different parameter values', () => {
      const dist1 = new BetaDistribution(1, 3);
      expect(dist1.mean).toBeCloseTo(0.25, 10);

      const dist2 = new BetaDistribution(8, 2);
      expect(dist2.mean).toBeCloseTo(0.8, 10);
    });
  });

  describe('variance', () => {
    it('should calculate variance correctly', () => {
      const dist = new BetaDistribution(2, 5);
      // Variance = αβ/[(α+β)²(α+β+1)]
      const expectedVariance = (2 * 5) / (Math.pow(2 + 5, 2) * (2 + 5 + 1));

      expect(dist.variance).toBeCloseTo(expectedVariance, 10);
    });

    it('should always be positive', () => {
      const dist1 = new BetaDistribution(1, 1);
      const dist2 = new BetaDistribution(10, 10);
      const dist3 = new BetaDistribution(2, 8);

      expect(dist1.variance).toBeGreaterThan(0);
      expect(dist2.variance).toBeGreaterThan(0);
      expect(dist3.variance).toBeGreaterThan(0);
    });

    it('should decrease as α+β increases', () => {
      const dist1 = new BetaDistribution(2, 2);
      const dist2 = new BetaDistribution(10, 10);
      const dist3 = new BetaDistribution(50, 50);

      // Larger α+β means more concentrated distribution
      expect(dist2.variance).toBeLessThan(dist1.variance);
      expect(dist3.variance).toBeLessThan(dist2.variance);
    });
  });

  describe('performance', () => {
    it('should generate samples efficiently', () => {
      const dist = new BetaDistribution(2, 5);
      const startTime = Date.now();

      for (let i = 0; i < 100000; i++) {
        dist.sample(rng);
      }

      const endTime = Date.now();
      const elapsed = endTime - startTime;

      // Should generate 100k samples in under 500ms (adjusted for CI)
      expect(elapsed).toBeLessThan(500);
    });
  });

  describe('properties', () => {
    it('should expose alpha and beta properties', () => {
      const dist = new BetaDistribution(3, 7);
      expect(dist.alpha).toBe(3);
      expect(dist.beta).toBe(7);
    });
  });

  describe('validateParameters', () => {
    it('should return true for valid parameters', () => {
      const dist = new BetaDistribution(2, 3);
      expect(dist.validateParameters()).toBe(true);
    });

    it('should throw error when alpha becomes invalid', () => {
      const dist = new BetaDistribution(2, 3);
      (dist as any).alpha = 0;
      expect(() => dist.validateParameters()).toThrow('Alpha must be positive');
    });

    it('should throw error when beta becomes invalid', () => {
      const dist = new BetaDistribution(2, 3);
      (dist as any).beta = -1;
      expect(() => dist.validateParameters()).toThrow('Beta must be positive');
    });

    it('should throw error when parameters become non-finite', () => {
      const dist = new BetaDistribution(2, 3);
      (dist as any).alpha = Infinity;
      expect(() => dist.validateParameters()).toThrow('Parameters must be finite numbers');
    });
  });

  describe('edge cases for numerical stability', () => {
    it('should handle CDF at x=0', () => {
      const dist = new BetaDistribution(2, 3);
      expect(dist.cdf(0)).toBe(0);
    });

    it('should handle CDF at x=1', () => {
      const dist = new BetaDistribution(2, 3);
      expect(dist.cdf(1)).toBe(1);
    });

    it('should handle very small alpha for sampling', () => {
      const dist = new BetaDistribution(0.1, 2);
      const rng1 = new SimpleRNG(999);
      const samples = Array.from({ length: 100 }, () => dist.sample(rng1));
      samples.forEach(s => {
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(1);
      });
    });

    it('should handle very small beta for sampling', () => {
      const dist = new BetaDistribution(2, 0.1);
      const rng1 = new SimpleRNG(888);
      const samples = Array.from({ length: 100 }, () => dist.sample(rng1));
      samples.forEach(s => {
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(1);
      });
    });

    it('should handle both very small parameters for sampling', () => {
      const dist = new BetaDistribution(0.1, 0.1);
      const rng1 = new SimpleRNG(777);
      const samples = Array.from({ length: 100 }, () => dist.sample(rng1));
      samples.forEach(s => {
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(1);
      });
    });

    it('should handle inverseCDF with extreme probabilities', () => {
      const dist = new BetaDistribution(0.5, 0.5);
      // Very small p
      const x1 = dist.inverseCDF(1e-10);
      expect(x1).toBeGreaterThan(0);
      expect(x1).toBeLessThan(0.1);

      // Very large p
      const x2 = dist.inverseCDF(1 - 1e-10);
      expect(x2).toBeGreaterThan(0.9);
      expect(x2).toBeLessThan(1);
    });

    it('should handle CDF with values very close to boundaries', () => {
      const dist = new BetaDistribution(0.5, 0.5);
      const cdf1 = dist.cdf(1e-10);
      const cdf2 = dist.cdf(1 - 1e-10);

      expect(cdf1).toBeGreaterThan(0);
      expect(cdf1).toBeLessThan(0.5);
      expect(cdf2).toBeGreaterThan(0.5);
      expect(cdf2).toBeLessThan(1);
    });

    it('should trigger gamma reflection formula for small alpha values', () => {
      // This tests logGamma with z < 0.5, which uses reflection formula
      const dist = new BetaDistribution(0.1, 2);
      const pdf = dist.pdf(0.01);
      expect(pdf).toBeGreaterThan(0);
      expect(pdf).toBeLessThan(Infinity);
    });

    it('should handle inverseCDF that causes Newton-Raphson to break on pdf=0', () => {
      // Test with parameters that might cause pdf(x) = 0 during iteration
      const dist = new BetaDistribution(0.01, 0.01);
      const x = dist.inverseCDF(0.999999);
      expect(x).toBeGreaterThan(0.5);
      expect(x).toBeLessThan(1);
    });

    it('should handle regularizedIncompleteBeta edge cases', () => {
      // Test that exercises continued fraction numerical stability
      const dist = new BetaDistribution(100, 100);

      // This should exercise the continued fraction calculation
      const cdf1 = dist.cdf(0.5);
      expect(cdf1).toBeCloseTo(0.5, 2);

      // Test near boundaries to exercise x=0 and x=1 paths
      const cdf2 = dist.cdf(0);
      expect(cdf2).toBe(0);

      const cdf3 = dist.cdf(1);
      expect(cdf3).toBe(1);
    });

    it('should handle continued fraction numerical stability checks', () => {
      // Use parameters that stress the continued fraction algorithm
      const dist = new BetaDistribution(50, 50);

      // Multiple evaluations to exercise different code paths
      for (let p = 0.1; p < 1; p += 0.1) {
        const x = dist.inverseCDF(p);
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(1);
      }
    });

    it('should handle extreme parameter ratios in CDF', () => {
      // Extreme ratios stress the continued fraction more
      const dist1 = new BetaDistribution(100, 0.01);
      const cdf1 = dist1.cdf(0.999);
      expect(cdf1).toBeGreaterThan(0);
      expect(cdf1).toBeLessThan(1);

      const dist2 = new BetaDistribution(0.01, 100);
      const cdf2 = dist2.cdf(0.001);
      expect(cdf2).toBeGreaterThan(0);
      expect(cdf2).toBeLessThan(1);
    });

    it('should handle inverseCDF with extreme parameter combinations', () => {
      // These combinations trigger different paths in Newton-Raphson
      const dist1 = new BetaDistribution(0.001, 0.001);
      const x1 = dist1.inverseCDF(0.5);
      expect(x1).toBeGreaterThan(0);
      expect(x1).toBeLessThan(1);

      const dist2 = new BetaDistribution(200, 200);
      const x2 = dist2.inverseCDF(0.9999);
      expect(x2).toBeGreaterThan(0.5);
      expect(x2).toBeLessThan(1);
    });

    it('should handle CDF calculations that exercise all continued fraction branches', () => {
      // Test a wide range to hit different numerical paths
      const testCases = [
        { alpha: 0.5, beta: 0.5, x: 0.5 },
        { alpha: 0.1, beta: 10, x: 0.01 },
        { alpha: 10, beta: 0.1, x: 0.99 },
        { alpha: 100, beta: 100, x: 0.49 },
        { alpha: 100, beta: 100, x: 0.51 },
        { alpha: 0.01, beta: 0.01, x: 0.5 }
      ];

      testCases.forEach(({ alpha, beta, x }) => {
        const dist = new BetaDistribution(alpha, beta);
        const cdf = dist.cdf(x);
        expect(cdf).toBeGreaterThanOrEqual(0);
        expect(cdf).toBeLessThanOrEqual(1);
      });
    });
  });
});
