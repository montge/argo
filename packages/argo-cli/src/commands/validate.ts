/**
 * Validate Command
 *
 * Validates simulation configuration files against the JSON schema
 */

import * as fs from 'fs';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { simulationConfigSchema } from '../config/schema';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const validate = ajv.compile(simulationConfigSchema);

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a simulation configuration file
 *
 * @param configPath - Path to the configuration file
 * @returns Validation result with errors if any
 * @throws Error if file doesn't exist or isn't valid JSON
 */
export function validateConfig(configPath: string): ValidationResult {
  // Check if file exists
  if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration file does not exist: ${configPath}`);
  }

  // Read and parse the config file
  let config: any;
  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    config = JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Validate against schema
  const valid = validate(config);

  if (!valid && validate.errors) {
    const errors = validate.errors.map((error) => {
      const path = error.instancePath || '(root)';
      const message = error.message || 'unknown error';
      return `${path}: ${message}`;
    });

    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}

/**
 * Execute the validate command
 *
 * @param configPath - Path to configuration file
 */
export function executeValidateCommand(configPath: string): void {
  try {
    const result = validateConfig(configPath);

    if (result.valid) {
      console.log(`✅ Configuration is valid: ${configPath}`);
      console.log(`\nReady to run simulation:`);
      console.log(`  argo simulate ${configPath}`);
    } else {
      console.error(`❌ Configuration is invalid: ${configPath}\n`);
      console.error('Errors:');
      result.errors.forEach((error, index) => {
        console.error(`  ${index + 1}. ${error}`);
      });
      process.exit(1);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
    throw error;
  }
}
