/**
 * Tests for 'argo generate' command
 *
 * Following TDD - these tests are written BEFORE implementation
 */

import * as fs from 'fs';
import * as path from 'path';
import { generateTemplate, executeGenerateCommand } from '../../src/commands/generate';

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

  describe('executeGenerateCommand', () => {
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

    it('should print success message after generating template', () => {
      executeGenerateCommand(testConfigPath, { overwrite: true });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Template configuration generated: ${testConfigPath}`)
      );
    });

    it('should print usage instructions after generating', () => {
      executeGenerateCommand(testConfigPath, { overwrite: true });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Edit this file with your simulation parameters')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(`argo simulate ${testConfigPath}`)
      );
    });

    it('should handle errors and exit with code 1', () => {
      // Try to generate without overwrite when file exists
      fs.writeFileSync(testConfigPath, 'existing');

      // The error will be thrown, caught, logged, and process.exit called
      // Since process.exit is mocked, execution continues
      try {
        executeGenerateCommand(testConfigPath, { overwrite: false });
      } catch (error) {
        // Catch any errors that escape the executeGenerateCommand error handling
      }

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error:')
      );
      // Verify process.exit(1) was called
      expect(processExitSpy).toHaveBeenCalledWith(1);

      // Clean up for next tests
      if (fs.existsSync(testConfigPath)) {
        fs.unlinkSync(testConfigPath);
      }
    });

    it('should use json format by default', () => {
      executeGenerateCommand(testConfigPath, { overwrite: true });

      const content = fs.readFileSync(testConfigPath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('should respect overwrite option', () => {
      executeGenerateCommand(testConfigPath, { overwrite: true, format: 'json' });

      expect(fs.existsSync(testConfigPath)).toBe(true);
    });
  });
});
