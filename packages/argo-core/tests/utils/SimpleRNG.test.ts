import { SimpleRNG } from '../../src/utils/SimpleRNG';

describe('SimpleRNG', () => {
  describe('constructor', () => {
    it('should create RNG with explicit seed', () => {
      const rng = new SimpleRNG(42);
      expect(rng).toBeInstanceOf(SimpleRNG);
    });

    it('should create RNG without seed (random)', () => {
      const rng = new SimpleRNG();
      expect(rng).toBeInstanceOf(SimpleRNG);
    });

    it('should produce reproducible sequence with same seed', () => {
      const rng1 = new SimpleRNG(12345);
      const rng2 = new SimpleRNG(12345);

      const samples1 = Array.from({ length: 10 }, () => rng1.next());
      const samples2 = Array.from({ length: 10 }, () => rng2.next());

      expect(samples1).toEqual(samples2);
    });

    it('should produce different sequence with different seeds', () => {
      const rng1 = new SimpleRNG(12345);
      const rng2 = new SimpleRNG(67890);

      const samples1 = Array.from({ length: 10 }, () => rng1.next());
      const samples2 = Array.from({ length: 10 }, () => rng2.next());

      expect(samples1).not.toEqual(samples2);
    });
  });

  describe('next', () => {
    it('should generate values between 0 and 1', () => {
      const rng = new SimpleRNG(42);

      for (let i = 0; i < 1000; i++) {
        const value = rng.next();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    it('should generate approximately uniform distribution', () => {
      const rng = new SimpleRNG(42);
      const buckets = new Array(10).fill(0);

      // Generate 10,000 samples
      for (let i = 0; i < 10000; i++) {
        const value = rng.next();
        const bucket = Math.floor(value * 10);
        buckets[bucket]++;
      }

      // Each bucket should have approximately 1000 samples (±300)
      for (let i = 0; i < 10; i++) {
        expect(buckets[i]).toBeGreaterThan(700);
        expect(buckets[i]).toBeLessThan(1300);
      }
    });
  });

  describe('nextInt', () => {
    it('should generate integers within range [min, max]', () => {
      const rng = new SimpleRNG(42);

      for (let i = 0; i < 1000; i++) {
        const value = rng.nextInt(1, 6);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(6);
        expect(Number.isInteger(value)).toBe(true);
      }
    });

    it('should work with negative ranges', () => {
      const rng = new SimpleRNG(42);

      for (let i = 0; i < 100; i++) {
        const value = rng.nextInt(-10, -5);
        expect(value).toBeGreaterThanOrEqual(-10);
        expect(value).toBeLessThanOrEqual(-5);
        expect(Number.isInteger(value)).toBe(true);
      }
    });

    it('should work with single value range', () => {
      const rng = new SimpleRNG(42);

      for (let i = 0; i < 10; i++) {
        const value = rng.nextInt(5, 5);
        expect(value).toBe(5);
      }
    });
  });

  describe('nextGaussian', () => {
    it('should generate finite values', () => {
      const rng = new SimpleRNG(42);

      for (let i = 0; i < 1000; i++) {
        const value = rng.nextGaussian();
        expect(isFinite(value)).toBe(true);
      }
    });

    it('should generate approximately normal distribution', () => {
      const rng = new SimpleRNG(42);
      const samples: number[] = [];

      for (let i = 0; i < 10000; i++) {
        samples.push(rng.nextGaussian());
      }

      // Calculate mean and standard deviation
      const mean = samples.reduce((sum, x) => sum + x, 0) / samples.length;
      const variance = samples.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / samples.length;
      const stddev = Math.sqrt(variance);

      // For standard normal: mean ≈ 0, stddev ≈ 1
      expect(mean).toBeGreaterThan(-0.1);
      expect(mean).toBeLessThan(0.1);
      expect(stddev).toBeGreaterThan(0.9);
      expect(stddev).toBeLessThan(1.1);
    });
  });

  describe('determinism', () => {
    it('should generate same sequence for same seed across methods', () => {
      const rng1 = new SimpleRNG(999);
      const rng2 = new SimpleRNG(999);

      // Mixed sequence of method calls
      const seq1 = [
        rng1.next(),
        rng1.nextInt(1, 10),
        rng1.nextGaussian(),
        rng1.next(),
      ];

      const seq2 = [
        rng2.next(),
        rng2.nextInt(1, 10),
        rng2.nextGaussian(),
        rng2.next(),
      ];

      expect(seq1).toEqual(seq2);
    });
  });
});
