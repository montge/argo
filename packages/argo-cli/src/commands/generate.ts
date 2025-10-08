/**
 * Generate Command
 *
 * Generates template simulation configuration files
 */

import * as fs from 'fs';
import * as path from 'path';
import { exampleConfig } from '../config/schema';

/**
 * Generate a template configuration file
 *
 * @param outputPath - Path where the config file should be created
 * @param format - Output format (json or yaml)
 * @param overwrite - Whether to overwrite existing files
 * @throws Error if file exists and overwrite is false
 */
export function generateTemplate(
  outputPath: string,
  format: 'json' | 'yaml' = 'json',
  overwrite: boolean = false
): void {
  // Check if file exists
  if (fs.existsSync(outputPath) && !overwrite) {
    throw new Error(`File already exists: ${outputPath}. Use --overwrite to replace it.`);
  }

  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Generate content based on format
  let content: string;

  if (format === 'json') {
    content = JSON.stringify(exampleConfig, null, 2);
  } else {
    // YAML format (to be implemented later)
    throw new Error('YAML format not yet implemented. Use "json" format.');
  }

  // Write file
  fs.writeFileSync(outputPath, content, 'utf-8');
}

/**
 * Execute the generate command
 *
 * @param outputPath - Path for the generated config file
 * @param options - Command options
 */
export function executeGenerateCommand(
  outputPath: string,
  options: { format?: string; overwrite?: boolean } = {}
): void {
  const format = (options.format || 'json') as 'json' | 'yaml';
  const overwrite = options.overwrite || false;

  try {
    generateTemplate(outputPath, format, overwrite);
    console.log(`✅ Template configuration generated: ${outputPath}`);
    console.log(`\nEdit this file with your simulation parameters, then run:`);
    console.log(`  argo simulate ${outputPath}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
    throw error;
  }
}
