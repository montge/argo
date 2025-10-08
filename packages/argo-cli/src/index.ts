#!/usr/bin/env node

/**
 * Argo CLI - Command Line Interface for Monte Carlo Simulation
 *
 * Main entry point for the CLI application
 */

import { Command } from 'commander';
import { executeDistributionsCommand } from './commands/distributions';
import { executeGenerateCommand } from './commands/generate';
import { executeValidateCommand } from './commands/validate';
import { executeSimulateCommand } from './commands/simulate';

const program = new Command();

program
  .name('argo')
  .description('Argo Monte Carlo Simulation - Command Line Interface')
  .version('5.0.0-alpha.1');

// Distributions command
program
  .command('distributions')
  .alias('dist')
  .description('List all available probability distributions')
  .action(() => {
    executeDistributionsCommand();
  });

// Generate command
program
  .command('generate <output>')
  .alias('gen')
  .description('Generate a template simulation configuration file')
  .option('-f, --format <format>', 'Output format (json or yaml)', 'json')
  .option('-o, --overwrite', 'Overwrite existing file', false)
  .action((output: string, options: { format?: string; overwrite?: boolean }) => {
    executeGenerateCommand(output, options);
  });

// Validate command
program
  .command('validate <config>')
  .alias('val')
  .description('Validate a simulation configuration file')
  .action((config: string) => {
    executeValidateCommand(config);
  });

// Simulate command
program
  .command('simulate <config>')
  .alias('sim')
  .description('Run a Monte Carlo simulation from configuration file')
  .option('-o, --output <file>', 'Save results to JSON file')
  .option('-v, --verbose', 'Include all samples in output (large file)', false)
  .action((config: string, options: { output?: string; verbose?: boolean }) => {
    executeSimulateCommand(config, options);
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
