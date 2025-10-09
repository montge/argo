/**
 * Tests for 'argo simulate' command
 *
 * Following TDD - these tests are written BEFORE implementation
 */

import * as fs from 'fs';
import * as path from 'path';
import { runSimulation, parseConfig, executeSimulateCommand } from '../../src/commands/simulate';

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

  describe('executeSimulateCommand', () => {
    let consoleLogSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;
    let processExitSpy: jest.SpyInstance;
    const testOutputPath = path.join(testOutputDir, 'results.json');

    beforeEach(() => {
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

      // Clean up output file
      if (fs.existsSync(testOutputPath)) {
        fs.unlinkSync(testOutputPath);
      }
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
      processExitSpy.mockRestore();

      // Clean up
      if (fs.existsSync(testOutputPath)) {
        fs.unlinkSync(testOutputPath);
      }
    });

    it('should print simulation header', () => {
      executeSimulateCommand(testConfigPath);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Running simulation from: ${testConfigPath}`)
      );
    });

    it('should print completion message with statistics', () => {
      executeSimulateCommand(testConfigPath);

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Simulation complete!'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Iterations:'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Execution time:'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Performance:'));
    });

    it('should print results for all variables', () => {
      executeSimulateCommand(testConfigPath);

      // Should print results header
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Results (3 variables)')
      );

      // Should print variable names
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('X:'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Y:'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Z:'));

      // Should print statistics (Mean, Median, etc.)
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Mean:'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Median:'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Std Dev:'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Min:'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Max:'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('P5:'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('P95:'));
    });

    it('should save results to JSON file when output option provided', () => {
      executeSimulateCommand(testConfigPath, { output: testOutputPath });

      // File should exist
      expect(fs.existsSync(testOutputPath)).toBe(true);

      // Should contain valid JSON
      const content = fs.readFileSync(testOutputPath, 'utf-8');
      const data = JSON.parse(content);

      // Should have config and results
      expect(data).toHaveProperty('config');
      expect(data).toHaveProperty('results');
      expect(data.results).toHaveProperty('statistics');
      expect(data.results).toHaveProperty('executionTime');
      expect(data.results).toHaveProperty('iterationsCompleted');

      // Should print save confirmation
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Results saved to: ${testOutputPath}`)
      );
    });

    it('should include samples in output when verbose flag is set', () => {
      executeSimulateCommand(testConfigPath, { output: testOutputPath, verbose: true });

      const content = fs.readFileSync(testOutputPath, 'utf-8');
      const data = JSON.parse(content);

      // Should include samples
      expect(data.results).toHaveProperty('samples');
      expect(data.results.samples).toHaveProperty('X');
      expect(data.results.samples.X.length).toBe(1000); // Iterations from config
    });

    it('should not include samples when verbose flag is false', () => {
      executeSimulateCommand(testConfigPath, { output: testOutputPath, verbose: false });

      const content = fs.readFileSync(testOutputPath, 'utf-8');
      const data = JSON.parse(content);

      // Should NOT include samples
      expect(data.results).not.toHaveProperty('samples');
    });

    it('should handle errors and exit with code 1', () => {
      const invalidPath = path.join(testOutputDir, 'nonexistent.json');

      try {
        executeSimulateCommand(invalidPath);
      } catch (error) {
        // Catch any errors that escape
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error:')
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });
});
