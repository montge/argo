/**
 * Simulation Types
 *
 * Core type definitions for Monte Carlo simulation engine.
 */

import type { Distribution } from './Distribution';

/**
 * Represents a single variable in a simulation model.
 *
 * Variables can be either:
 * - **Input variables**: Defined by a probability distribution
 * - **Formula variables**: Calculated from other variables using a formula
 */
export interface Variable {
  /** Unique identifier for the variable */
  name: string;

  /** Human-readable description */
  description?: string;

  /** Type of variable */
  type: 'input' | 'formula';

  /** Distribution for input variables (undefined for formula variables) */
  distribution?: Distribution;

  /** Formula expression for calculated variables (undefined for input variables) */
  formula?: string;

  /** Units of measurement (e.g., "days", "$", "hours") */
  units?: string;
}

/**
 * Configuration for a Monte Carlo simulation.
 */
export interface SimulationConfig {
  /** Number of iterations to run */
  iterations: number;

  /** Random seed for reproducibility (optional) */
  seed?: number;

  /** Variables to simulate */
  variables: Variable[];

  /** Correlation matrix (optional) - maps pairs of variable names to correlation coefficients */
  correlations?: CorrelationMatrix;

  /** Names of output variables to track (if not specified, all formula variables are tracked) */
  outputs?: string[];
}

/**
 * Correlation matrix for input variables.
 *
 * Maps pairs of variable names to their correlation coefficient (-1 to 1).
 * Only applies to input variables with distributions.
 *
 * @example
 * ```typescript
 * const correlations = {
 *   'Duration-Cost': 0.7,  // Duration and Cost are positively correlated
 *   'Risk-Quality': -0.5   // Risk and Quality are negatively correlated
 * };
 * ```
 */
export interface CorrelationMatrix {
  [key: string]: number; // Key format: "Variable1-Variable2"
}

/**
 * Results from a Monte Carlo simulation run.
 */
export interface SimulationResult {
  /** Configuration used for this simulation */
  config: SimulationConfig;

  /** All sampled values for each output variable [variable][iteration] */
  samples: { [variableName: string]: number[] };

  /** Summary statistics for each output variable */
  statistics: { [variableName: string]: VariableStatistics };

  /** Execution time in milliseconds */
  executionTime: number;

  /** Number of iterations completed */
  iterationsCompleted: number;
}

/**
 * Statistical summary for a single variable.
 */
export interface VariableStatistics {
  /** Arithmetic mean */
  mean: number;

  /** Median (50th percentile) */
  median: number;

  /** Standard deviation */
  stdDev: number;

  /** Minimum value observed */
  min: number;

  /** Maximum value observed */
  max: number;

  /** 5th percentile */
  p5: number;

  /** 25th percentile (Q1) */
  p25: number;

  /** 75th percentile (Q3) */
  p75: number;

  /** 95th percentile */
  p95: number;

  /** Skewness */
  skewness: number;

  /** Kurtosis */
  kurtosis: number;
}

/**
 * Progress callback function for long-running simulations.
 *
 * @param completed - Number of iterations completed
 * @param total - Total number of iterations
 * @param percentComplete - Percentage complete (0-100)
 */
export type ProgressCallback = (completed: number, total: number, percentComplete: number) => void;
