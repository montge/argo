/**
 * Tests for 'argo simulate' command
 *
 * Following TDD - these tests are written BEFORE implementation
 */

import * as fs from 'fs';
import * as path from 'path';
import { runSimulation, parseConfig } from '../../src/commands/simulate';

describe('simulate command', () => {
  const testOutputDir = path.join(__dirname, '..', '..', 'test-output');
  const testConfigPath = path.join(testOutputDir, 'sim-config.json');

  beforeAll(() => {
    // Create test output directory
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }

    // Create a valid simulation config
    const config = {
      iterations: 1000,
      seed: 42,
      variables: [
        {
          name: 'X',
          type: 'input',
          distribution: {
            type: 'Normal',
            parameters: { mean: 100, stddev: 15 },
          },
        },
        {
          name: 'Y',
          type: 'input',
          distribution: {
            type: 'Uniform',
            parameters: { min: 0, max: 10 },
          },
        },
        {
          name: 'Z',
          type: 'formula',
          formula: 'X + Y',
        },
      ],
    };

    fs.writeFileSync(testConfigPath, JSON.stringify(config, null, 2));
  });

  afterAll(() => {
    // Clean up
    if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath);
    }
    if (fs.existsSync(testOutputDir)) {
      fs.rmdirSync(testOutputDir, { recursive: true });
    }
  });

  describe('parseConfig', () => {
    it('should parse valid JSON config file', () => {
      const config = parseConfig(testConfigPath);

      expect(config).toHaveProperty('iterations');
      expect(config).toHaveProperty('variables');
      expect(config.iterations).toBe(1000);
    });

    it('should throw error for non-existent file', () => {
      expect(() => parseConfig('nonexistent.json')).toThrow();
    });

    it('should throw error for invalid JSON', () => {
      const badJsonPath = path.join(testOutputDir, 'bad.json');
      fs.writeFileSync(badJsonPath, '{invalid}');

      expect(() => parseConfig(badJsonPath)).toThrow();

      fs.unlinkSync(badJsonPath);
    });
  });

  describe('runSimulation', () => {
    it('should return simulation results', () => {
      const config = parseConfig(testConfigPath);
      const results = runSimulation(config);

      expect(results).toHaveProperty('statistics');
      expect(results).toHaveProperty('samples');
      expect(results).toHaveProperty('executionTime');
      expect(results).toHaveProperty('iterationsCompleted');
    });

    it('should complete all iterations', () => {
      const config = parseConfig(testConfigPath);
      const results = runSimulation(config);

      expect(results.iterationsCompleted).toBe(config.iterations);
    });

    it('should generate statistics for all output variables', () => {
      const config = parseConfig(testConfigPath);
      const results = runSimulation(config);

      expect(results.statistics).toHaveProperty('X');
      expect(results.statistics).toHaveProperty('Y');
      expect(results.statistics).toHaveProperty('Z');
    });

    it('should generate samples for all output variables', () => {
      const config = parseConfig(testConfigPath);
      const results = runSimulation(config);

      expect(results.samples.X).toHaveLength(config.iterations);
      expect(results.samples.Y).toHaveLength(config.iterations);
      expect(results.samples.Z).toHaveLength(config.iterations);
    });

    it('should include mean, median, stdDev in statistics', () => {
      const config = parseConfig(testConfigPath);
      const results = runSimulation(config);

      expect(results.statistics.X).toHaveProperty('mean');
      expect(results.statistics.X).toHaveProperty('median');
      expect(results.statistics.X).toHaveProperty('stdDev');
      expect(results.statistics.X).toHaveProperty('min');
      expect(results.statistics.X).toHaveProperty('max');
    });

    it('should respect seed for reproducibility', () => {
      const config = parseConfig(testConfigPath);

      const results1 = runSimulation(config);
      const results2 = runSimulation(config);

      // Should get same results with same seed
      expect(results1.statistics.X.mean).toBeCloseTo(results2.statistics.X.mean, 5);
      expect(results1.statistics.Y.mean).toBeCloseTo(results2.statistics.Y.mean, 5);
    });

    it('should evaluate formula variables correctly', () => {
      const config = parseConfig(testConfigPath);
      const results = runSimulation(config);

      // Z = X + Y, so mean(Z) ≈ mean(X) + mean(Y)
      const expectedMean = results.statistics.X.mean + results.statistics.Y.mean;
      expect(results.statistics.Z.mean).toBeCloseTo(expectedMean, 0);
    });
  });
});
