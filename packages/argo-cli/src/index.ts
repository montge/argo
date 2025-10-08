#!/usr/bin/env node

/**
 * Argo CLI - Command Line Interface for Monte Carlo Simulation
 *
 * Main entry point for the CLI application
 */

import { Command } from 'commander';
import { executeDistributionsCommand } from './commands/distributions';

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

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
