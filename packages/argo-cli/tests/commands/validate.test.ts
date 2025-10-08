/**
 * Tests for 'argo validate' command
 *
 * Following TDD - these tests are written BEFORE implementation
 */

import * as fs from 'fs';
import * as path from 'path';
import { validateConfig } from '../../src/commands/validate';

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
});
