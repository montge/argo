/**
 * Tests for 'argo validate' command
 *
 * Following TDD - these tests are written BEFORE implementation
 */

import * as fs from 'fs';
import * as path from 'path';
import { validateConfig, executeValidateCommand } from '../../src/commands/validate';

describe('validate command', () => {
  const testOutputDir = path.join(__dirname, '..', '..', 'test-output');
  const validConfigPath = path.join(testOutputDir, 'valid-config.json');
  const invalidConfigPath = path.join(testOutputDir, 'invalid-config.json');

  beforeAll(() => {
    // Create test output directory
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }

    // Create a valid config file
    const validConfig = {
      iterations: 10000,
      variables: [
        {
          name: 'X',
          type: 'input',
          distribution: {
            type: 'Normal',
            parameters: { mean: 0, stddev: 1 },
          },
        },
      ],
    };
    fs.writeFileSync(validConfigPath, JSON.stringify(validConfig, null, 2));

    // Create an invalid config file (missing required fields)
    const invalidConfig = {
      iterations: 10000,
      // Missing variables field
    };
    fs.writeFileSync(invalidConfigPath, JSON.stringify(invalidConfig, null, 2));
  });

  afterAll(() => {
    // Clean up test files
    if (fs.existsSync(validConfigPath)) {
      fs.unlinkSync(validConfigPath);
    }
    if (fs.existsSync(invalidConfigPath)) {
      fs.unlinkSync(invalidConfigPath);
    }
    if (fs.existsSync(testOutputDir)) {
      fs.rmdirSync(testOutputDir, { recursive: true });
    }
  });

  describe('validateConfig', () => {
    it('should return true for valid configuration', () => {
      const result = validateConfig(validConfigPath);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return false for invalid configuration', () => {
      const result = validateConfig(invalidConfigPath);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should throw error if file does not exist', () => {
      expect(() => validateConfig('nonexistent.json')).toThrow('does not exist');
    });

    it('should throw error for invalid JSON syntax', () => {
      const badJsonPath = path.join(testOutputDir, 'bad.json');
      fs.writeFileSync(badJsonPath, '{invalid json}');

      expect(() => validateConfig(badJsonPath)).toThrow();

      fs.unlinkSync(badJsonPath);
    });

    it('should detect missing iterations field', () => {
      const noIterationsPath = path.join(testOutputDir, 'no-iterations.json');
      fs.writeFileSync(
        noIterationsPath,
        JSON.stringify({ variables: [] }, null, 2)
      );

      const result = validateConfig(noIterationsPath);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('iterations'))).toBe(true);

      fs.unlinkSync(noIterationsPath);
    });

    it('should detect invalid variable type', () => {
      const badVarPath = path.join(testOutputDir, 'bad-var.json');
      fs.writeFileSync(
        badVarPath,
        JSON.stringify(
          {
            iterations: 1000,
            variables: [{ name: 'X', type: 'invalid_type' }],
          },
          null,
          2
        )
      );

      const result = validateConfig(badVarPath);

      expect(result.valid).toBe(false);

      fs.unlinkSync(badVarPath);
    });

    it('should detect missing distribution for input variable', () => {
      const noDistPath = path.join(testOutputDir, 'no-dist.json');
      fs.writeFileSync(
        noDistPath,
        JSON.stringify(
          {
            iterations: 1000,
            variables: [{ name: 'X', type: 'input' }],
          },
          null,
          2
        )
      );

      const result = validateConfig(noDistPath);

      expect(result.valid).toBe(false);

      fs.unlinkSync(noDistPath);
    });
  });

  describe('executeValidateCommand', () => {
    let consoleLogSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;
    let processExitSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
      processExitSpy.mockRestore();
    });

    it('should print success message for valid configuration', () => {
      executeValidateCommand(validConfigPath);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Configuration is valid: ${validConfigPath}`)
      );
    });

    it('should print usage instructions for valid configuration', () => {
      executeValidateCommand(validConfigPath);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Ready to run simulation:')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(`argo simulate ${validConfigPath}`)
      );
    });

    it('should print error message and exit for invalid configuration', () => {
      try {
        executeValidateCommand(invalidConfigPath);
      } catch (error) {
        // Catch any errors that escape
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Configuration is invalid: ${invalidConfigPath}`)
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Errors:')
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should print all validation errors', () => {
      try {
        executeValidateCommand(invalidConfigPath);
      } catch (error) {
        // Catch any errors that escape
      }

      // Should print numbered error list
      const errorCalls = consoleErrorSpy.mock.calls;
      const hasNumberedErrors = errorCalls.some(call =>
        call[0].match(/\d+\./)
      );

      expect(hasNumberedErrors).toBe(true);
    });

    it('should handle file read errors and exit', () => {
      const nonexistentPath = path.join(testOutputDir, 'does-not-exist.json');

      try {
        executeValidateCommand(nonexistentPath);
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
