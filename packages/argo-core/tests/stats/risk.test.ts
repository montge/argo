import {
  valueAtRisk,
  conditionalVaR,
  probabilityExceeding,
  probabilityBelow,
  probabilityBetween,
  probabilityOfTarget,
} from '../../src/stats/risk';

describe('Risk Metrics', () => {
  describe('valueAtRisk', () => {
    it('should calculate VaR at 95% confidence', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const var95 = valueAtRisk(data, 0.95);

      // VaR at 95% is the 5th percentile (worst 5% of outcomes)
      expect(var95).toBeCloseTo(1.45, 2);
    });

    it('should calculate VaR at 99% confidence', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const var99 = valueAtRisk(data, 0.99);

      // VaR at 99% is the 1st percentile
      expect(var99).toBeCloseTo(1.09, 2);
    });

    it('should calculate VaR at 90% confidence', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const var90 = valueAtRisk(data, 0.90);

      // VaR at 90% is the 10th percentile
      expect(var90).toBeCloseTo(1.9, 1);
    });

    it('should make higher confidence have lower VaR (worse outcomes)', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const var90 = valueAtRisk(data, 0.90);
      const var95 = valueAtRisk(data, 0.95);
      const var99 = valueAtRisk(data, 0.99);

      // Higher confidence looks at more extreme (lower) values
      expect(var99).toBeLessThan(var95);
      expect(var95).toBeLessThan(var90);
    });

    it('should handle negative values (losses)', () => {
      const data = [-10, -8, -6, -4, -2, 0, 2, 4, 6, 8];
      const var95 = valueAtRisk(data, 0.95);

      // 5th percentile of losses
      expect(var95).toBeLessThan(-6);
    });

    it('should handle all positive values (profits)', () => {
      const data = [100, 200, 300, 400, 500];
      const var95 = valueAtRisk(data, 0.95);

      expect(var95).toBeGreaterThan(0);
      expect(var95).toBeLessThan(200);
    });

    it('should throw error for empty array', () => {
      expect(() => valueAtRisk([], 0.95)).toThrow('Data array cannot be empty');
    });

    it('should throw error for single value', () => {
      expect(() => valueAtRisk([42], 0.95)).toThrow('At least 2 values required');
    });

    it('should throw error for confidence <= 0', () => {
      expect(() => valueAtRisk([1, 2, 3], 0)).toThrow('Confidence level must be between 0 and 1');
      expect(() => valueAtRisk([1, 2, 3], -0.1)).toThrow('Confidence level must be between 0 and 1');
    });

    it('should throw error for confidence >= 1', () => {
      expect(() => valueAtRisk([1, 2, 3], 1)).toThrow('Confidence level must be between 0 and 1');
      expect(() => valueAtRisk([1, 2, 3], 1.1)).toThrow('Confidence level must be between 0 and 1');
    });

    it('should handle decimals', () => {
      const data = [1.5, 2.5, 3.5, 4.5, 5.5];
      const var95 = valueAtRisk(data, 0.95);

      expect(var95).toBeGreaterThan(1);
      expect(var95).toBeLessThan(2.5);
    });

    it('should handle unsorted data', () => {
      const data = [10, 1, 5, 3, 8, 2, 9, 4, 7, 6];
      const var95 = valueAtRisk(data, 0.95);

      expect(var95).toBeCloseTo(1.45, 2);
    });

    it('should use default 95% confidence', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const var1 = valueAtRisk(data);
      const var2 = valueAtRisk(data, 0.95);

      expect(var1).toBeCloseTo(var2, 10);
    });
  });

  describe('conditionalVaR', () => {
    it('should calculate CVaR at 95% confidence', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const cvar95 = conditionalVaR(data, 0.95);

      // CVaR is mean of worst 5% of outcomes
      // For this data, worst 5% is approximately the first value
      expect(cvar95).toBeLessThan(2);
      expect(cvar95).toBeGreaterThan(0);
    });

    it('should calculate CVaR at 99% confidence', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const cvar99 = conditionalVaR(data, 0.99);

      // CVaR at 99% is mean of worst 1%
      expect(cvar99).toBeLessThan(1.5);
      expect(cvar99).toBeGreaterThan(0);
    });

    it('should make CVaR <= VaR (CVaR is more conservative)', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const var95 = valueAtRisk(data, 0.95);
      const cvar95 = conditionalVaR(data, 0.95);

      // CVaR is expected value of tail, should be <= VaR threshold
      expect(cvar95).toBeLessThanOrEqual(var95);
    });

    it('should handle negative values (losses)', () => {
      const data = [-10, -8, -6, -4, -2, 0, 2, 4, 6, 8];
      const cvar95 = conditionalVaR(data, 0.95);

      // Mean of worst 5% of losses
      expect(cvar95).toBeLessThan(-6);
    });

    it('should handle large dataset', () => {
      const data = Array.from({ length: 1000 }, (_, i) => i + 1);
      const cvar95 = conditionalVaR(data, 0.95);

      // Worst 5% is 1-50, mean should be around 25
      expect(cvar95).toBeGreaterThan(20);
      expect(cvar95).toBeLessThan(30);
    });

    it('should throw error for empty array', () => {
      expect(() => conditionalVaR([], 0.95)).toThrow('Data array cannot be empty');
    });

    it('should throw error for single value', () => {
      expect(() => conditionalVaR([42], 0.95)).toThrow('At least 2 values required');
    });

    it('should throw error for confidence <= 0', () => {
      expect(() => conditionalVaR([1, 2, 3], 0)).toThrow('Confidence level must be between 0 and 1');
    });

    it('should throw error for confidence >= 1', () => {
      expect(() => conditionalVaR([1, 2, 3], 1)).toThrow('Confidence level must be between 0 and 1');
    });

    it('should handle decimals', () => {
      const data = [1.5, 2.5, 3.5, 4.5, 5.5];
      const cvar95 = conditionalVaR(data, 0.95);

      expect(cvar95).toBeGreaterThan(0);
      expect(cvar95).toBeLessThan(3);
    });

    it('should use default 95% confidence', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const cvar1 = conditionalVaR(data);
      const cvar2 = conditionalVaR(data, 0.95);

      expect(cvar1).toBeCloseTo(cvar2, 10);
    });
  });

  describe('probabilityExceeding', () => {
    it('should calculate probability of exceeding threshold', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const prob = probabilityExceeding(data, 5);

      // Values > 5: [6, 7, 8, 9, 10] = 5/10 = 0.5
      expect(prob).toBeCloseTo(0.5, 2);
    });

    it('should return 0 for threshold above max', () => {
      const data = [1, 2, 3, 4, 5];
      const prob = probabilityExceeding(data, 10);

      expect(prob).toBe(0);
    });

    it('should return ~1 for threshold below min', () => {
      const data = [1, 2, 3, 4, 5];
      const prob = probabilityExceeding(data, 0);

      expect(prob).toBeCloseTo(1, 2);
    });

    it('should handle threshold at exact value', () => {
      const data = [1, 2, 3, 4, 5];
      const prob = probabilityExceeding(data, 3);

      // Values > 3: [4, 5] = 2/5 = 0.4
      expect(prob).toBeCloseTo(0.4, 2);
    });

    it('should handle negative thresholds', () => {
      const data = [-5, -3, -1, 0, 1, 3, 5];
      const prob = probabilityExceeding(data, 0);

      // Values > 0: [1, 3, 5] = 3/7 ≈ 0.4286
      expect(prob).toBeCloseTo(0.4286, 3);
    });

    it('should handle decimals', () => {
      const data = [1.5, 2.5, 3.5, 4.5, 5.5];
      const prob = probabilityExceeding(data, 3.5);

      // Values > 3.5: [4.5, 5.5] = 2/5 = 0.4
      expect(prob).toBeCloseTo(0.4, 2);
    });

    it('should throw error for empty array', () => {
      expect(() => probabilityExceeding([], 5)).toThrow('Data array cannot be empty');
    });

    it('should handle single value above threshold', () => {
      expect(probabilityExceeding([10], 5)).toBe(1);
    });

    it('should handle single value below threshold', () => {
      expect(probabilityExceeding([3], 5)).toBe(0);
    });

    it('should handle all same values', () => {
      const data = [5, 5, 5, 5, 5];
      expect(probabilityExceeding(data, 5)).toBe(0);
      expect(probabilityExceeding(data, 4)).toBe(1);
    });

    it('should return value between 0 and 1', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const prob = probabilityExceeding(data, 5);

      expect(prob).toBeGreaterThanOrEqual(0);
      expect(prob).toBeLessThanOrEqual(1);
    });
  });

  describe('probabilityBelow', () => {
    it('should calculate probability of being below threshold', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const prob = probabilityBelow(data, 5);

      // Values < 5: [1, 2, 3, 4] = 4/10 = 0.4
      expect(prob).toBeCloseTo(0.4, 2);
    });

    it('should return 1 for threshold above max', () => {
      const data = [1, 2, 3, 4, 5];
      const prob = probabilityBelow(data, 10);

      expect(prob).toBe(1);
    });

    it('should return 0 for threshold below min', () => {
      const data = [1, 2, 3, 4, 5];
      const prob = probabilityBelow(data, 0);

      expect(prob).toBe(0);
    });

    it('should handle threshold at exact value', () => {
      const data = [1, 2, 3, 4, 5];
      const prob = probabilityBelow(data, 3);

      // Values < 3: [1, 2] = 2/5 = 0.4
      expect(prob).toBeCloseTo(0.4, 2);
    });

    it('should handle negative thresholds', () => {
      const data = [-5, -3, -1, 0, 1, 3, 5];
      const prob = probabilityBelow(data, 0);

      // Values < 0: [-5, -3, -1] = 3/7 ≈ 0.4286
      expect(prob).toBeCloseTo(0.4286, 3);
    });

    it('should handle decimals', () => {
      const data = [1.5, 2.5, 3.5, 4.5, 5.5];
      const prob = probabilityBelow(data, 3.5);

      // Values < 3.5: [1.5, 2.5] = 2/5 = 0.4
      expect(prob).toBeCloseTo(0.4, 2);
    });

    it('should throw error for empty array', () => {
      expect(() => probabilityBelow([], 5)).toThrow('Data array cannot be empty');
    });

    it('should handle single value above threshold', () => {
      expect(probabilityBelow([10], 5)).toBe(0);
    });

    it('should handle single value below threshold', () => {
      expect(probabilityBelow([3], 5)).toBe(1);
    });

    it('should be complement of probabilityExceeding (approximately)', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const probBelow = probabilityBelow(data, 5);
      const probExceeding = probabilityExceeding(data, 5);

      // probBelow + probExceeding + P(X=5) = 1
      // Since we have discrete data, probBelow + probExceeding ≈ 0.9
      expect(probBelow + probExceeding).toBeCloseTo(0.9, 1);
    });

    it('should return value between 0 and 1', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const prob = probabilityBelow(data, 5);

      expect(prob).toBeGreaterThanOrEqual(0);
      expect(prob).toBeLessThanOrEqual(1);
    });
  });

  describe('probabilityBetween', () => {
    it('should calculate probability between two values', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const prob = probabilityBetween(data, 3, 7);

      // Values in [3, 7]: [3, 4, 5, 6, 7] = 5/10 = 0.5
      expect(prob).toBeCloseTo(0.5, 2);
    });

    it('should return 0 for range outside data', () => {
      const data = [1, 2, 3, 4, 5];
      const prob = probabilityBetween(data, 10, 20);

      expect(prob).toBe(0);
    });

    it('should return 1 for range covering all data', () => {
      const data = [1, 2, 3, 4, 5];
      const prob = probabilityBetween(data, 0, 10);

      expect(prob).toBe(1);
    });

    it('should handle narrow range', () => {
      const data = [1, 2, 3, 4, 5];
      const prob = probabilityBetween(data, 2, 3);

      // Values in [2, 3]: [2, 3] = 2/5 = 0.4
      expect(prob).toBeCloseTo(0.4, 2);
    });

    it('should handle single point range', () => {
      const data = [1, 2, 3, 4, 5];
      const prob = probabilityBetween(data, 3, 3);

      // Only value 3: 1/5 = 0.2
      expect(prob).toBeCloseTo(0.2, 2);
    });

    it('should handle negative ranges', () => {
      const data = [-5, -3, -1, 0, 1, 3, 5];
      const prob = probabilityBetween(data, -3, 1);

      // Values in [-3, 1]: [-3, -1, 0, 1] = 4/7 ≈ 0.5714
      expect(prob).toBeCloseTo(0.5714, 3);
    });

    it('should handle decimals', () => {
      const data = [1.5, 2.5, 3.5, 4.5, 5.5];
      const prob = probabilityBetween(data, 2.5, 4.5);

      // Values in [2.5, 4.5]: [2.5, 3.5, 4.5] = 3/5 = 0.6
      expect(prob).toBeCloseTo(0.6, 2);
    });

    it('should throw error for empty array', () => {
      expect(() => probabilityBetween([], 1, 5)).toThrow('Data array cannot be empty');
    });

    it('should throw error for lower > upper', () => {
      const data = [1, 2, 3, 4, 5];
      expect(() => probabilityBetween(data, 7, 3)).toThrow('Lower bound must be <= upper bound');
    });

    it('should handle single value in range', () => {
      expect(probabilityBetween([3], 2, 4)).toBe(1);
    });

    it('should handle single value outside range', () => {
      expect(probabilityBetween([10], 2, 4)).toBe(0);
    });

    it('should return value between 0 and 1', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const prob = probabilityBetween(data, 3, 7);

      expect(prob).toBeGreaterThanOrEqual(0);
      expect(prob).toBeLessThanOrEqual(1);
    });

    it('should handle partial overlap with data range', () => {
      const data = [1, 2, 3, 4, 5];
      const prob = probabilityBetween(data, 3, 10);

      // Values in [3, 10]: [3, 4, 5] = 3/5 = 0.6
      expect(prob).toBeCloseTo(0.6, 2);
    });
  });

  describe('probabilityOfTarget', () => {
    it('should calculate probability within tolerance', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const prob = probabilityOfTarget(data, 5, 1);

      // Values in [4, 6]: [4, 5, 6] = 3/10 = 0.3
      expect(prob).toBeCloseTo(0.3, 2);
    });

    it('should return 0 for target outside data range', () => {
      const data = [1, 2, 3, 4, 5];
      const prob = probabilityOfTarget(data, 20, 1);

      expect(prob).toBe(0);
    });

    it('should handle zero tolerance', () => {
      const data = [1, 2, 3, 4, 5];
      const prob = probabilityOfTarget(data, 3, 0);

      // Only exact match: [3] = 1/5 = 0.2
      expect(prob).toBeCloseTo(0.2, 2);
    });

    it('should handle large tolerance covering all data', () => {
      const data = [1, 2, 3, 4, 5];
      const prob = probabilityOfTarget(data, 3, 10);

      expect(prob).toBe(1);
    });

    it('should handle negative targets', () => {
      const data = [-5, -3, -1, 0, 1, 3, 5];
      const prob = probabilityOfTarget(data, -1, 2);

      // Values in [-3, 1]: [-3, -1, 0, 1] = 4/7 ≈ 0.5714
      expect(prob).toBeCloseTo(0.5714, 3);
    });

    it('should handle decimals', () => {
      const data = [1.5, 2.5, 3.5, 4.5, 5.5];
      const prob = probabilityOfTarget(data, 3.5, 1);

      // Values in [2.5, 4.5]: [2.5, 3.5, 4.5] = 3/5 = 0.6
      expect(prob).toBeCloseTo(0.6, 2);
    });

    it('should throw error for empty array', () => {
      expect(() => probabilityOfTarget([], 5, 1)).toThrow('Data array cannot be empty');
    });

    it('should throw error for negative tolerance', () => {
      const data = [1, 2, 3, 4, 5];
      expect(() => probabilityOfTarget(data, 5, -1)).toThrow('Tolerance must be non-negative');
    });

    it('should handle single value matching target', () => {
      expect(probabilityOfTarget([5], 5, 1)).toBe(1);
    });

    it('should handle single value outside tolerance', () => {
      expect(probabilityOfTarget([10], 5, 1)).toBe(0);
    });

    it('should use default tolerance of 0', () => {
      const data = [1, 2, 3, 4, 5];
      const prob1 = probabilityOfTarget(data, 3);
      const prob2 = probabilityOfTarget(data, 3, 0);

      expect(prob1).toBeCloseTo(prob2, 10);
    });

    it('should return value between 0 and 1', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const prob = probabilityOfTarget(data, 5, 2);

      expect(prob).toBeGreaterThanOrEqual(0);
      expect(prob).toBeLessThanOrEqual(1);
    });

    it('should increase with larger tolerance', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const prob1 = probabilityOfTarget(data, 5, 1);
      const prob2 = probabilityOfTarget(data, 5, 2);
      const prob3 = probabilityOfTarget(data, 5, 3);

      expect(prob2).toBeGreaterThanOrEqual(prob1);
      expect(prob3).toBeGreaterThanOrEqual(prob2);
    });

    it('should be symmetric around target', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const prob = probabilityOfTarget(data, 5, 2);

      // Should include [3, 4, 5, 6, 7] = 5/10 = 0.5
      expect(prob).toBeCloseTo(0.5, 2);
    });
  });
});
