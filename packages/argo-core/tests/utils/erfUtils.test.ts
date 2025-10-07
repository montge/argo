import { erf, erfc, erfInv } from '../../src/utils/erfUtils';

describe('erfUtils', () => {
  describe('erf', () => {
    it('should return 0 for x = 0', () => {
      expect(erf(0)).toBeCloseTo(0, 6);
    });

    it('should approach 1 for large positive x', () => {
      expect(erf(3)).toBeCloseTo(0.999977909503, 6);
      expect(erf(5)).toBeCloseTo(1, 5);
    });

    it('should approach -1 for large negative x', () => {
      expect(erf(-3)).toBeCloseTo(-0.999977909503, 6);
      expect(erf(-5)).toBeCloseTo(-1, 5);
    });

    it('should be an odd function', () => {
      const x = 1.5;
      expect(erf(x)).toBeCloseTo(-erf(-x), 10);
    });

    it('should calculate known values correctly', () => {
      // erf(1) ≈ 0.8427007929
      expect(erf(1)).toBeCloseTo(0.8427007929, 6);

      // erf(2) ≈ 0.9953222650
      expect(erf(2)).toBeCloseTo(0.9953222650, 6);
    });
  });

  describe('erfc', () => {
    it('should return 1 for x = 0', () => {
      expect(erfc(0)).toBeCloseTo(1, 6);
    });

    it('should equal 1 - erf(x)', () => {
      const testValues = [-2, -1, 0, 1, 2];

      for (const x of testValues) {
        expect(erfc(x)).toBeCloseTo(1 - erf(x), 10);
      }
    });

    it('should approach 0 for large positive x', () => {
      expect(erfc(3)).toBeCloseTo(0.000022090496998585, 5);
      expect(erfc(5)).toBeLessThan(0.001);
    });

    it('should approach 2 for large negative x', () => {
      expect(erfc(-3)).toBeCloseTo(1.999977909503, 6);
      expect(erfc(-5)).toBeGreaterThan(1.999);
    });
  });

  describe('erfInv', () => {
    it('should return 0 for x = 0', () => {
      expect(erfInv(0)).toBe(0);
    });

    it('should return Infinity for x = 1', () => {
      expect(erfInv(1)).toBe(Infinity);
    });

    it('should return -Infinity for x = -1', () => {
      expect(erfInv(-1)).toBe(-Infinity);
    });

    it('should throw for x < -1', () => {
      expect(() => erfInv(-1.1)).toThrow('erfInv: argument must be between -1 and 1');
    });

    it('should throw for x > 1', () => {
      expect(() => erfInv(1.1)).toThrow('erfInv: argument must be between -1 and 1');
    });

    it('should be inverse of erf', () => {
      const testValues = [-0.9, -0.5, -0.1, 0.1, 0.5, 0.9];

      for (const x of testValues) {
        const y = erfInv(x);
        const xRecovered = erf(y);
        expect(xRecovered).toBeCloseTo(x, 4);
      }
    });

    it('should handle positive values correctly', () => {
      // erfInv(erf(1)) ≈ 1
      const x = 1;
      const erfX = erf(x);
      const recovered = erfInv(erfX);
      expect(recovered).toBeCloseTo(x, 4);
    });

    it('should handle negative values correctly', () => {
      // erfInv(erf(-1)) ≈ -1
      const x = -1;
      const erfX = erf(x);
      const recovered = erfInv(erfX);
      expect(recovered).toBeCloseTo(x, 4);
    });
  });
});
