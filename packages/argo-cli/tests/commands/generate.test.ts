/**
 * Tests for 'argo generate' command
 *
 * Following TDD - these tests are written BEFORE implementation
 */

import * as fs from 'fs';
import * as path from 'path';
import { generateTemplate } from '../../src/commands/generate';

describe('generate command', () => {
  const testOutputDir = path.join(__dirname, '..', '..', 'test-output');
  const testConfigPath = path.join(testOutputDir, 'test-config.json');

  beforeAll(() => {
    // Create test output directory
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath);
    }
  });

  afterAll(() => {
    // Clean up test directory
    if (fs.existsSync(testOutputDir)) {
      fs.rmdirSync(testOutputDir, { recursive: true });
    }
  });

  describe('generateTemplate', () => {
    it('should create a JSON config file at specified path', () => {
      generateTemplate(testConfigPath, 'json');

      expect(fs.existsSync(testConfigPath)).toBe(true);
    });

    it('should generate valid JSON that can be parsed', () => {
      generateTemplate(testConfigPath, 'json');

      const content = fs.readFileSync(testConfigPath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('should include required fields in template', () => {
      generateTemplate(testConfigPath, 'json');

      const content = fs.readFileSync(testConfigPath, 'utf-8');
      const config = JSON.parse(content);

      expect(config).toHaveProperty('iterations');
      expect(config).toHaveProperty('variables');
      expect(Array.isArray(config.variables)).toBe(true);
    });

    it('should include example input variable', () => {
      generateTemplate(testConfigPath, 'json');

      const content = fs.readFileSync(testConfigPath, 'utf-8');
      const config = JSON.parse(content);

      const inputVar = config.variables.find((v: any) => v.type === 'input');
      expect(inputVar).toBeDefined();
      expect(inputVar).toHaveProperty('name');
      expect(inputVar).toHaveProperty('distribution');
      expect(inputVar.distribution).toHaveProperty('type');
      expect(inputVar.distribution).toHaveProperty('parameters');
    });

    it('should include example formula variable', () => {
      generateTemplate(testConfigPath, 'json');

      const content = fs.readFileSync(testConfigPath, 'utf-8');
      const config = JSON.parse(content);

      const formulaVar = config.variables.find((v: any) => v.type === 'formula');
      expect(formulaVar).toBeDefined();
      expect(formulaVar).toHaveProperty('name');
      expect(formulaVar).toHaveProperty('formula');
    });

    it('should throw error if file already exists without overwrite flag', () => {
      // Create file first
      fs.writeFileSync(testConfigPath, 'existing content');

      expect(() => generateTemplate(testConfigPath, 'json', false)).toThrow('already exists');
    });

    it('should overwrite existing file when overwrite flag is true', () => {
      // Create file first
      fs.writeFileSync(testConfigPath, 'existing content');

      expect(() => generateTemplate(testConfigPath, 'json', true)).not.toThrow();

      const content = fs.readFileSync(testConfigPath, 'utf-8');
      expect(content).not.toBe('existing content');
    });

    it('should format JSON with proper indentation', () => {
      generateTemplate(testConfigPath, 'json');

      const content = fs.readFileSync(testConfigPath, 'utf-8');

      // Check for proper indentation (2 spaces)
      expect(content).toContain('  "iterations"');
      expect(content).toContain('    "name"');
    });
  });
});
