import { MonteCarloEngine } from '../../src/simulation/MonteCarloEngine';
import { NormalDistribution } from '../../src/distributions/NormalDistribution';
import { UniformDistribution } from '../../src/distributions/UniformDistribution';
import { SimpleRNG } from '../../src/utils/SimpleRNG';
import type { SimulationConfig, Variable } from '../../src/types/Simulation';

describe('MonteCarloEngine', () => {
  describe('constructor', () => {
    it('should create engine with default RNG', () => {
      const engine = new MonteCarloEngine();
      expect(engine).toBeInstanceOf(MonteCarloEngine);
    });

    it('should create engine with custom RNG', () => {
      const rng = new SimpleRNG(12345);
      const engine = new MonteCarloEngine(rng);
      expect(engine).toBeInstanceOf(MonteCarloEngine);
    });

    it('should create engine with seed', () => {
      const engine = new MonteCarloEngine(12345);
      expect(engine).toBeInstanceOf(MonteCarloEngine);
    });
  });

  describe('simulate - single input variable', () => {
    it('should simulate single input variable', () => {
      const rng = new SimpleRNG(12345);
      const engine = new MonteCarloEngine(rng);

      const config: SimulationConfig = {
        iterations: 100,
        variables: [
          {
            name: 'Cost',
            type: 'input',
            distribution: new NormalDistribution(100, 10),
          },
        ],
      };

      const result = engine.simulate(config);

      expect(result).toHaveProperty('samples');
      expect(result).toHaveProperty('statistics');
      expect(result).toHaveProperty('executionTime');
      expect(result.iterationsCompleted).toBe(100);
      expect(result.samples.Cost).toHaveLength(100);
    });

    it('should generate reproducible results with same seed', () => {
      const config: SimulationConfig = {
        iterations: 100,
        seed: 12345,
        variables: [
          {
            name: 'X',
            type: 'input',
            distribution: new NormalDistribution(0, 1),
          },
        ],
      };

      const engine1 = new MonteCarloEngine();
      const result1 = engine1.simulate(config);

      const engine2 = new MonteCarloEngine();
      const result2 = engine2.simulate(config);

      expect(result1.samples.X[0]).toBeCloseTo(result2.samples.X[0], 10);
      expect(result1.samples.X[50]).toBeCloseTo(result2.samples.X[50], 10);
      expect(result1.samples.X[99]).toBeCloseTo(result2.samples.X[99], 10);
    });

    it('should calculate statistics for input variable', () => {
      const rng = new SimpleRNG(12345);
      const engine = new MonteCarloEngine(rng);

      const config: SimulationConfig = {
        iterations: 1000,
        variables: [
          {
            name: 'X',
            type: 'input',
            distribution: new NormalDistribution(50, 10),
          },
        ],
      };

      const result = engine.simulate(config);
      const stats = result.statistics.X;

      // With 1000 samples, mean and std dev should be close (within ~10%)
      expect(stats.mean).toBeCloseTo(50, -1); // Within ~5
      expect(stats.stdDev).toBeCloseTo(10, -1); // Within ~5
      expect(stats.min).toBeLessThan(stats.mean);
      expect(stats.max).toBeGreaterThan(stats.mean);
      expect(stats.p5).toBeLessThan(stats.p25);
      expect(stats.p25).toBeLessThan(stats.median);
      expect(stats.median).toBeLessThan(stats.p75);
      expect(stats.p75).toBeLessThan(stats.p95);
    });

    it('should track execution time', () => {
      const rng = new SimpleRNG(12345);
      const engine = new MonteCarloEngine(rng);

      const config: SimulationConfig = {
        iterations: 100,
        variables: [
          {
            name: 'X',
            type: 'input',
            distribution: new UniformDistribution(0, 100),
          },
        ],
      };

      const result = engine.simulate(config);

      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.executionTime).toBeLessThan(1000); // Should be very fast
    });

    it('should handle small number of iterations', () => {
      const rng = new SimpleRNG(12345);
      const engine = new MonteCarloEngine(rng);

      const config: SimulationConfig = {
        iterations: 10,
        variables: [
          {
            name: 'X',
            type: 'input',
            distribution: new NormalDistribution(0, 1),
          },
        ],
      };

      const result = engine.simulate(config);

      expect(result.samples.X).toHaveLength(10);
      expect(result.iterationsCompleted).toBe(10);
    });

    it('should handle large number of iterations', () => {
      const rng = new SimpleRNG(12345);
      const engine = new MonteCarloEngine(rng);

      const config: SimulationConfig = {
        iterations: 10000,
        variables: [
          {
            name: 'X',
            type: 'input',
            distribution: new UniformDistribution(0, 1),
          },
        ],
      };

      const result = engine.simulate(config);

      expect(result.samples.X).toHaveLength(10000);
      expect(result.iterationsCompleted).toBe(10000);
      expect(result.executionTime).toBeLessThan(1000); // Should be fast
    });

    it('should throw error for zero iterations', () => {
      const engine = new MonteCarloEngine();

      const config: SimulationConfig = {
        iterations: 0,
        variables: [
          {
            name: 'X',
            type: 'input',
            distribution: new NormalDistribution(0, 1),
          },
        ],
      };

      expect(() => engine.simulate(config)).toThrow('Iterations must be positive');
    });

    it('should throw error for negative iterations', () => {
      const engine = new MonteCarloEngine();

      const config: SimulationConfig = {
        iterations: -100,
        variables: [
          {
            name: 'X',
            type: 'input',
            distribution: new NormalDistribution(0, 1),
          },
        ],
      };

      expect(() => engine.simulate(config)).toThrow('Iterations must be positive');
    });

    it('should throw error for empty variables array', () => {
      const engine = new MonteCarloEngine();

      const config: SimulationConfig = {
        iterations: 100,
        variables: [],
      };

      expect(() => engine.simulate(config)).toThrow('At least one variable required');
    });

    it('should throw error for input variable without distribution', () => {
      const engine = new MonteCarloEngine();

      const config: SimulationConfig = {
        iterations: 100,
        variables: [
          {
            name: 'X',
            type: 'input',
            // Missing distribution
          } as Variable,
        ],
      };

      expect(() => engine.simulate(config)).toThrow('Input variable "X" must have a distribution');
    });
  });

  describe('simulate - multiple input variables', () => {
    it('should simulate two independent input variables', () => {
      const rng = new SimpleRNG(12345);
      const engine = new MonteCarloEngine(rng);

      const config: SimulationConfig = {
        iterations: 100,
        variables: [
          {
            name: 'Duration',
            type: 'input',
            distribution: new NormalDistribution(10, 2),
          },
          {
            name: 'Cost',
            type: 'input',
            distribution: new UniformDistribution(100, 200),
          },
        ],
      };

      const result = engine.simulate(config);

      expect(result.samples.Duration).toHaveLength(100);
      expect(result.samples.Cost).toHaveLength(100);
      expect(result.statistics.Duration.mean).toBeCloseTo(10, 0);
      expect(result.statistics.Cost.mean).toBeCloseTo(150, -1);
    });

    it('should simulate multiple input variables', () => {
      const rng = new SimpleRNG(12345);
      const engine = new MonteCarloEngine(rng);

      const config: SimulationConfig = {
        iterations: 100,
        variables: [
          {
            name: 'A',
            type: 'input',
            distribution: new NormalDistribution(0, 1),
          },
          {
            name: 'B',
            type: 'input',
            distribution: new NormalDistribution(10, 5),
          },
          {
            name: 'C',
            type: 'input',
            distribution: new UniformDistribution(0, 100),
          },
        ],
      };

      const result = engine.simulate(config);

      expect(Object.keys(result.samples)).toHaveLength(3);
      expect(Object.keys(result.statistics)).toHaveLength(3);
      expect(result.samples.A).toHaveLength(100);
      expect(result.samples.B).toHaveLength(100);
      expect(result.samples.C).toHaveLength(100);
    });

    it('should generate independent samples for each variable', () => {
      const rng = new SimpleRNG(12345);
      const engine = new MonteCarloEngine(rng);

      const config: SimulationConfig = {
        iterations: 1000,
        variables: [
          {
            name: 'X',
            type: 'input',
            distribution: new NormalDistribution(0, 1),
          },
          {
            name: 'Y',
            type: 'input',
            distribution: new NormalDistribution(0, 1),
          },
        ],
      };

      const result = engine.simulate(config);

      // Check that variables are independent (correlation should be close to 0)
      const xSamples = result.samples.X;
      const ySamples = result.samples.Y;

      // Calculate correlation
      const xMean = xSamples.reduce((a, b) => a + b) / xSamples.length;
      const yMean = ySamples.reduce((a, b) => a + b) / ySamples.length;

      let numerator = 0;
      let xDenom = 0;
      let yDenom = 0;

      for (let i = 0; i < xSamples.length; i++) {
        const xDiff = xSamples[i] - xMean;
        const yDiff = ySamples[i] - yMean;
        numerator += xDiff * yDiff;
        xDenom += xDiff * xDiff;
        yDenom += yDiff * yDiff;
      }

      const correlation = numerator / Math.sqrt(xDenom * yDenom);

      // Correlation should be close to 0 (independent variables)
      expect(Math.abs(correlation)).toBeLessThan(0.1);
    });
  });

  describe('simulate - formula variables', () => {
    it('should evaluate simple formula with one input', () => {
      const rng = new SimpleRNG(12345);
      const engine = new MonteCarloEngine(rng);

      const config: SimulationConfig = {
        iterations: 100,
        variables: [
          {
            name: 'X',
            type: 'input',
            distribution: new UniformDistribution(0, 10),
          },
          {
            name: 'Y',
            type: 'formula',
            formula: 'X * 2',
          },
        ],
      };

      const result = engine.simulate(config);

      expect(result.samples.Y).toHaveLength(100);

      // Check that Y = X * 2 for all iterations
      for (let i = 0; i < 100; i++) {
        expect(result.samples.Y[i]).toBeCloseTo(result.samples.X[i] * 2, 10);
      }
    });

    it('should evaluate formula with multiple inputs', () => {
      const rng = new SimpleRNG(12345);
      const engine = new MonteCarloEngine(rng);

      const config: SimulationConfig = {
        iterations: 100,
        variables: [
          {
            name: 'A',
            type: 'input',
            distribution: new UniformDistribution(1, 10),
          },
          {
            name: 'B',
            type: 'input',
            distribution: new UniformDistribution(1, 10),
          },
          {
            name: 'Sum',
            type: 'formula',
            formula: 'A + B',
          },
        ],
      };

      const result = engine.simulate(config);

      // Check that Sum = A + B for all iterations
      for (let i = 0; i < 100; i++) {
        expect(result.samples.Sum[i]).toBeCloseTo(result.samples.A[i] + result.samples.B[i], 10);
      }
    });

    it('should evaluate complex formulas', () => {
      const rng = new SimpleRNG(12345);
      const engine = new MonteCarloEngine(rng);

      const config: SimulationConfig = {
        iterations: 100,
        variables: [
          {
            name: 'X',
            type: 'input',
            distribution: new UniformDistribution(1, 10),
          },
          {
            name: 'Result',
            type: 'formula',
            formula: 'X^2 + 2*X + 1',
          },
        ],
      };

      const result = engine.simulate(config);

      // Check formula: X^2 + 2*X + 1
      for (let i = 0; i < 100; i++) {
        const x = result.samples.X[i];
        const expected = x * x + 2 * x + 1;
        expect(result.samples.Result[i]).toBeCloseTo(expected, 10);
      }
    });

    it('should handle dependent formulas (chain)', () => {
      const rng = new SimpleRNG(12345);
      const engine = new MonteCarloEngine(rng);

      const config: SimulationConfig = {
        iterations: 100,
        variables: [
          {
            name: 'X',
            type: 'input',
            distribution: new UniformDistribution(1, 10),
          },
          {
            name: 'Y',
            type: 'formula',
            formula: 'X * 2',
          },
          {
            name: 'Z',
            type: 'formula',
            formula: 'Y + 5',
          },
        ],
      };

      const result = engine.simulate(config);

      // Check that Z = (X * 2) + 5
      for (let i = 0; i < 100; i++) {
        const expected = result.samples.X[i] * 2 + 5;
        expect(result.samples.Z[i]).toBeCloseTo(expected, 10);
      }
    });

    it('should throw error for formula variable without formula', () => {
      const engine = new MonteCarloEngine();

      const config: SimulationConfig = {
        iterations: 100,
        variables: [
          {
            name: 'X',
            type: 'formula',
            // Missing formula
          } as Variable,
        ],
      };

      expect(() => engine.simulate(config)).toThrow('Formula variable "X" must have a formula');
    });

    it('should throw error for circular dependency', () => {
      const engine = new MonteCarloEngine();

      const config: SimulationConfig = {
        iterations: 100,
        variables: [
          {
            name: 'A',
            type: 'formula',
            formula: 'B + 1',
          },
          {
            name: 'B',
            type: 'formula',
            formula: 'A + 1',
          },
        ],
      };

      expect(() => engine.simulate(config)).toThrow('Circular dependency detected');
    });

    it('should throw error for undefined variable in formula', () => {
      const engine = new MonteCarloEngine();

      const config: SimulationConfig = {
        iterations: 100,
        variables: [
          {
            name: 'Result',
            type: 'formula',
            formula: 'UndefinedVar + 1',
          },
        ],
      };

      expect(() => engine.simulate(config)).toThrow('Undefined variable "UndefinedVar"');
    });
  });

  describe('simulate - outputs filter', () => {
    it('should track only specified output variables', () => {
      const rng = new SimpleRNG(12345);
      const engine = new MonteCarloEngine(rng);

      const config: SimulationConfig = {
        iterations: 100,
        variables: [
          {
            name: 'X',
            type: 'input',
            distribution: new UniformDistribution(0, 10),
          },
          {
            name: 'Y',
            type: 'formula',
            formula: 'X * 2',
          },
          {
            name: 'Z',
            type: 'formula',
            formula: 'X + 5',
          },
        ],
        outputs: ['Y'], // Only track Y
      };

      const result = engine.simulate(config);

      expect(result.samples.Y).toHaveLength(100);
      expect(result.samples.X).toBeUndefined();
      expect(result.samples.Z).toBeUndefined();
      expect(result.statistics.Y).toBeDefined();
      expect(result.statistics.X).toBeUndefined();
      expect(result.statistics.Z).toBeUndefined();
    });

    it('should track multiple specified outputs', () => {
      const rng = new SimpleRNG(12345);
      const engine = new MonteCarloEngine(rng);

      const config: SimulationConfig = {
        iterations: 100,
        variables: [
          {
            name: 'A',
            type: 'input',
            distribution: new UniformDistribution(0, 10),
          },
          {
            name: 'B',
            type: 'formula',
            formula: 'A * 2',
          },
          {
            name: 'C',
            type: 'formula',
            formula: 'A + 5',
          },
        ],
        outputs: ['B', 'C'],
      };

      const result = engine.simulate(config);

      expect(result.samples.B).toHaveLength(100);
      expect(result.samples.C).toHaveLength(100);
      expect(result.samples.A).toBeUndefined();
    });
  });

  describe('simulate - progress callback', () => {
    it('should call progress callback during simulation', () => {
      const rng = new SimpleRNG(12345);
      const engine = new MonteCarloEngine(rng);

      const progressUpdates: number[] = [];
      const progressCallback = jest.fn((completed: number, total: number, percent: number) => {
        progressUpdates.push(percent);
      });

      const config: SimulationConfig = {
        iterations: 100,
        variables: [
          {
            name: 'X',
            type: 'input',
            distribution: new UniformDistribution(0, 10),
          },
        ],
      };

      engine.simulate(config, progressCallback);

      expect(progressCallback).toHaveBeenCalled();
      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates[progressUpdates.length - 1]).toBe(100);
    });

    it('should not call progress callback if not provided', () => {
      const rng = new SimpleRNG(12345);
      const engine = new MonteCarloEngine(rng);

      const config: SimulationConfig = {
        iterations: 100,
        variables: [
          {
            name: 'X',
            type: 'input',
            distribution: new UniformDistribution(0, 10),
          },
        ],
      };

      // Should not throw error
      expect(() => engine.simulate(config)).not.toThrow();
    });
  });

  describe('simulate - correlated variables', () => {
    it('should accept correlation matrix', () => {
      const rng = new SimpleRNG(12345);
      const engine = new MonteCarloEngine(rng);

      const config: SimulationConfig = {
        iterations: 100,
        variables: [
          {
            name: 'X',
            type: 'input',
            distribution: new NormalDistribution(0, 1),
          },
          {
            name: 'Y',
            type: 'input',
            distribution: new NormalDistribution(0, 1),
          },
        ],
        correlations: {
          'X-Y': 0.7,
        },
      };

      // Should not throw error
      expect(() => engine.simulate(config)).not.toThrow();
    });

    it('should generate correlated samples', () => {
      const rng = new SimpleRNG(12345);
      const engine = new MonteCarloEngine(rng);

      const config: SimulationConfig = {
        iterations: 1000,
        variables: [
          {
            name: 'X',
            type: 'input',
            distribution: new NormalDistribution(0, 1),
          },
          {
            name: 'Y',
            type: 'input',
            distribution: new NormalDistribution(0, 1),
          },
        ],
        correlations: {
          'X-Y': 0.8, // Strong positive correlation
        },
      };

      const result = engine.simulate(config);

      // Calculate correlation between X and Y samples
      const xSamples = result.samples.X;
      const ySamples = result.samples.Y;

      const xMean = xSamples.reduce((a, b) => a + b) / xSamples.length;
      const yMean = ySamples.reduce((a, b) => a + b) / ySamples.length;

      let numerator = 0;
      let xDenom = 0;
      let yDenom = 0;

      for (let i = 0; i < xSamples.length; i++) {
        const xDiff = xSamples[i] - xMean;
        const yDiff = ySamples[i] - yMean;
        numerator += xDiff * yDiff;
        xDenom += xDiff * xDiff;
        yDenom += yDiff * yDiff;
      }

      const correlation = numerator / Math.sqrt(xDenom * yDenom);

      // Correlation should be close to 0.8
      expect(correlation).toBeGreaterThan(0.7);
      expect(correlation).toBeLessThan(0.9);
    });

    it('should handle negative correlation', () => {
      const rng = new SimpleRNG(12345);
      const engine = new MonteCarloEngine(rng);

      const config: SimulationConfig = {
        iterations: 1000,
        variables: [
          {
            name: 'A',
            type: 'input',
            distribution: new NormalDistribution(0, 1),
          },
          {
            name: 'B',
            type: 'input',
            distribution: new NormalDistribution(0, 1),
          },
        ],
        correlations: {
          'A-B': -0.7, // Strong negative correlation
        },
      };

      const result = engine.simulate(config);

      // Calculate correlation
      const aSamples = result.samples.A;
      const bSamples = result.samples.B;

      const aMean = aSamples.reduce((a, b) => a + b) / aSamples.length;
      const bMean = bSamples.reduce((a, b) => a + b) / bSamples.length;

      let numerator = 0;
      let aDenom = 0;
      let bDenom = 0;

      for (let i = 0; i < aSamples.length; i++) {
        const aDiff = aSamples[i] - aMean;
        const bDiff = bSamples[i] - bMean;
        numerator += aDiff * bDiff;
        aDenom += aDiff * aDiff;
        bDenom += bDiff * bDiff;
      }

      const correlation = numerator / Math.sqrt(aDenom * bDenom);

      // Correlation should be close to -0.7
      expect(correlation).toBeLessThan(-0.6);
      expect(correlation).toBeGreaterThan(-0.8);
    });

    it('should handle multiple correlated variables', () => {
      const rng = new SimpleRNG(12345);
      const engine = new MonteCarloEngine(rng);

      const config: SimulationConfig = {
        iterations: 1000,
        variables: [
          {
            name: 'X',
            type: 'input',
            distribution: new NormalDistribution(0, 1),
          },
          {
            name: 'Y',
            type: 'input',
            distribution: new NormalDistribution(0, 1),
          },
          {
            name: 'Z',
            type: 'input',
            distribution: new NormalDistribution(0, 1),
          },
        ],
        correlations: {
          'X-Y': 0.6,
          'X-Z': 0.4,
          'Y-Z': 0.5,
        },
      };

      const result = engine.simulate(config);

      expect(result.samples.X).toHaveLength(1000);
      expect(result.samples.Y).toHaveLength(1000);
      expect(result.samples.Z).toHaveLength(1000);
    });

    it('should throw error for invalid correlation coefficient > 1', () => {
      const engine = new MonteCarloEngine();

      const config: SimulationConfig = {
        iterations: 100,
        variables: [
          {
            name: 'X',
            type: 'input',
            distribution: new NormalDistribution(0, 1),
          },
          {
            name: 'Y',
            type: 'input',
            distribution: new NormalDistribution(0, 1),
          },
        ],
        correlations: {
          'X-Y': 1.5, // Invalid: > 1
        },
      };

      expect(() => engine.simulate(config)).toThrow('Correlation coefficient must be between -1 and 1');
    });

    it('should throw error for invalid correlation coefficient < -1', () => {
      const engine = new MonteCarloEngine();

      const config: SimulationConfig = {
        iterations: 100,
        variables: [
          {
            name: 'X',
            type: 'input',
            distribution: new NormalDistribution(0, 1),
          },
          {
            name: 'Y',
            type: 'input',
            distribution: new NormalDistribution(0, 1),
          },
        ],
        correlations: {
          'X-Y': -1.5, // Invalid: < -1
        },
      };

      expect(() => engine.simulate(config)).toThrow('Correlation coefficient must be between -1 and 1');
    });

    it('should throw error for correlation on non-input variable', () => {
      const engine = new MonteCarloEngine();

      const config: SimulationConfig = {
        iterations: 100,
        variables: [
          {
            name: 'X',
            type: 'input',
            distribution: new NormalDistribution(0, 1),
          },
          {
            name: 'Y',
            type: 'formula',
            formula: 'X * 2',
          },
        ],
        correlations: {
          'X-Y': 0.5, // Y is not an input variable
        },
      };

      expect(() => engine.simulate(config)).toThrow('Correlation can only be applied to input variables');
    });

    it('should throw error for correlation on undefined variable', () => {
      const engine = new MonteCarloEngine();

      const config: SimulationConfig = {
        iterations: 100,
        variables: [
          {
            name: 'X',
            type: 'input',
            distribution: new NormalDistribution(0, 1),
          },
        ],
        correlations: {
          'X-Z': 0.5, // Z doesn't exist
        },
      };

      expect(() => engine.simulate(config)).toThrow('Correlation references undefined variable');
    });

    it('should throw error for non-positive definite correlation matrix', () => {
      const engine = new MonteCarloEngine();

      const config: SimulationConfig = {
        iterations: 100,
        variables: [
          {
            name: 'X',
            type: 'input',
            distribution: new NormalDistribution(0, 1),
          },
          {
            name: 'Y',
            type: 'input',
            distribution: new NormalDistribution(0, 1),
          },
          {
            name: 'Z',
            type: 'input',
            distribution: new NormalDistribution(0, 1),
          },
        ],
        correlations: {
          'X-Y': 0.9,
          'X-Z': 0.9,
          'Y-Z': -0.9, // This creates a non-positive definite matrix
        },
      };

      expect(() => engine.simulate(config)).toThrow('Correlation matrix is not positive definite');
    });
  });
});
