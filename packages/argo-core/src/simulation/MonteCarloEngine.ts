/**
 * Monte Carlo Simulation Engine
 *
 * Core engine for running Monte Carlo simulations with support for:
 * - Multiple input variables with probability distributions
 * - Formula-based calculated variables
 * - Dependency resolution and topological sorting
 * - Progress reporting
 * - Statistical analysis
 */

import { create, all, MathJsInstance } from 'mathjs';
import { SimpleRNG } from '../utils/SimpleRNG';
import { mean, standardDeviation, min, max, skewness, kurtosis } from '../stats/descriptive';
import { percentile } from '../stats/percentiles';
import type { RandomNumberGenerator } from '../types/Distribution';
import type {
  SimulationConfig,
  SimulationResult,
  Variable,
  VariableStatistics,
  ProgressCallback,
} from '../types/Simulation';

/**
 * Monte Carlo simulation engine.
 *
 * Executes Monte Carlo simulations with support for input variables,
 * formula variables, and dependency management.
 */
export class MonteCarloEngine {
  private rng: RandomNumberGenerator;
  private math: MathJsInstance;

  /**
   * Create a new Monte Carlo engine.
   *
   * @param rngOrSeed - Random number generator or seed (optional)
   */
  constructor(rngOrSeed?: RandomNumberGenerator | number) {
    if (typeof rngOrSeed === 'number') {
      this.rng = new SimpleRNG(rngOrSeed);
    } else if (rngOrSeed) {
      this.rng = rngOrSeed;
    } else {
      this.rng = new SimpleRNG();
    }

    // Create math.js instance for formula evaluation
    this.math = create(all, {});
  }

  /**
   * Run a Monte Carlo simulation.
   *
   * @param config - Simulation configuration
   * @param progressCallback - Optional callback for progress updates
   * @returns Simulation results with samples and statistics
   * @throws {Error} If configuration is invalid
   */
  simulate(config: SimulationConfig, progressCallback?: ProgressCallback): SimulationResult {
    const startTime = performance.now();

    // Validate configuration
    this.validateConfig(config);

    // Use config seed if provided
    if (config.seed !== undefined) {
      this.rng.setSeed(config.seed);
    }

    // Determine which variables to track as outputs
    const outputVars = this.determineOutputs(config);

    // Build dependency graph and get evaluation order
    const evalOrder = this.buildDependencyGraph(config.variables);

    // Get input variables for correlation
    const inputVars = config.variables.filter((v) => v.type === 'input');

    // Validate and prepare correlation matrix
    let choleskyMatrix: number[][] | null = null;
    if (config.correlations && Object.keys(config.correlations).length > 0) {
      this.validateCorrelations(config.correlations, config.variables, inputVars);
      const corrMatrix = this.buildCorrelationMatrix(config.correlations, inputVars);
      choleskyMatrix = this.choleskyDecomposition(corrMatrix);
    }

    // Initialize sample storage
    const allSamples: { [name: string]: number[] } = {};
    for (const varName of outputVars) {
      allSamples[varName] = [];
    }

    // Run iterations
    for (let iteration = 0; iteration < config.iterations; iteration++) {
      // Generate samples for this iteration
      const iterationValues: { [name: string]: number } = {};

      // Generate correlated or independent samples for input variables
      if (choleskyMatrix) {
        // Generate correlated samples
        const correlatedSamples = this.generateCorrelatedSamples(inputVars, choleskyMatrix);
        for (let i = 0; i < inputVars.length; i++) {
          iterationValues[inputVars[i].name] = correlatedSamples[i];
        }
      } else {
        // Generate independent samples
        for (const variable of inputVars) {
          iterationValues[variable.name] = variable.distribution!.sample(this.rng);
        }
      }

      // Evaluate formula variables in dependency order
      for (const varName of evalOrder) {
        const variable = config.variables.find((v) => v.name === varName)!;

        if (variable.type === 'formula') {
          // Evaluate formula
          iterationValues[varName] = this.evaluateFormula(variable.formula!, iterationValues);
        }
      }

      // Store outputs for this iteration
      for (const varName of outputVars) {
        allSamples[varName].push(iterationValues[varName]);
      }

      // Report progress
      if (progressCallback && (iteration % Math.ceil(config.iterations / 100) === 0 || iteration === config.iterations - 1)) {
        const percentComplete = ((iteration + 1) / config.iterations) * 100;
        progressCallback(iteration + 1, config.iterations, percentComplete);
      }
    }

    // Calculate statistics for each output
    const statistics: { [name: string]: VariableStatistics } = {};
    for (const varName of outputVars) {
      statistics[varName] = this.calculateStatistics(allSamples[varName]);
    }

    const endTime = performance.now();

    return {
      config,
      samples: allSamples,
      statistics,
      executionTime: endTime - startTime,
      iterationsCompleted: config.iterations,
    };
  }

  /**
   * Validate simulation configuration.
   *
   * @param config - Configuration to validate
   * @throws {Error} If configuration is invalid
   */
  private validateConfig(config: SimulationConfig): void {
    if (config.iterations <= 0) {
      throw new Error('Iterations must be positive');
    }

    if (config.variables.length === 0) {
      throw new Error('At least one variable required');
    }

    for (const variable of config.variables) {
      if (variable.type === 'input' && !variable.distribution) {
        throw new Error(`Input variable "${variable.name}" must have a distribution`);
      }

      if (variable.type === 'formula' && !variable.formula) {
        throw new Error(`Formula variable "${variable.name}" must have a formula`);
      }
    }
  }

  /**
   * Determine which variables to track as outputs.
   *
   * @param config - Simulation configuration
   * @returns Array of output variable names
   */
  private determineOutputs(config: SimulationConfig): string[] {
    if (config.outputs && config.outputs.length > 0) {
      return config.outputs;
    }

    // If no outputs specified, track all variables
    return config.variables.map((v) => v.name);
  }

  /**
   * Build dependency graph and return evaluation order.
   *
   * Uses topological sort to determine correct evaluation order
   * and detect circular dependencies.
   *
   * @param variables - Variables to sort
   * @returns Array of variable names in evaluation order
   * @throws {Error} If circular dependency detected or undefined variable referenced
   */
  private buildDependencyGraph(variables: Variable[]): string[] {
    const varMap = new Map<string, Variable>();
    for (const variable of variables) {
      varMap.set(variable.name, variable);
    }

    // Build adjacency list (dependencies)
    const dependencies = new Map<string, Set<string>>();
    for (const variable of variables) {
      dependencies.set(variable.name, new Set());

      if (variable.type === 'formula' && variable.formula) {
        // Extract variable names from formula
        const referencedVars = this.extractVariables(variable.formula);

        for (const refVar of referencedVars) {
          if (!varMap.has(refVar)) {
            throw new Error(`Undefined variable "${refVar}" referenced in formula for "${variable.name}"`);
          }
          dependencies.get(variable.name)!.add(refVar);
        }
      }
    }

    // Topological sort using Kahn's algorithm
    // In-degree = number of dependencies a variable has
    const inDegree = new Map<string, number>();
    for (const [varName, deps] of dependencies.entries()) {
      inDegree.set(varName, deps.size);
    }

    // Queue of variables with no dependencies (in-degree = 0)
    const queue: string[] = [];
    for (const [varName, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(varName);
      }
    }

    const sorted: string[] = [];

    while (queue.length > 0) {
      const varName = queue.shift()!;
      sorted.push(varName);

      // For each variable that depends on varName
      for (const [dependentVar, deps] of dependencies.entries()) {
        if (deps.has(varName)) {
          deps.delete(varName);
          // If this dependent variable now has no dependencies, add to queue
          if (deps.size === 0 && !sorted.includes(dependentVar) && !queue.includes(dependentVar)) {
            queue.push(dependentVar);
          }
        }
      }
    }

    // If not all variables were sorted, there's a cycle
    if (sorted.length !== variables.length) {
      throw new Error('Circular dependency detected in variable formulas');
    }

    // Sorted is already in evaluation order (dependencies first)
    return sorted;
  }

  /**
   * Extract variable names from a formula.
   *
   * @param formula - Formula string
   * @returns Set of variable names
   */
  private extractVariables(formula: string): Set<string> {
    const variables = new Set<string>();

    // Match identifiers (variable names) - letters, digits, underscore
    // But exclude math functions and constants
    const identifierRegex = /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g;
    const matches = formula.match(identifierRegex) || [];

    // Filter out math.js built-in functions and constants
    const builtins = new Set([
      'sin',
      'cos',
      'tan',
      'sqrt',
      'abs',
      'log',
      'ln',
      'exp',
      'pow',
      'min',
      'max',
      'ceil',
      'floor',
      'round',
      'e',
      'pi',
      'E',
      'PI',
    ]);

    for (const match of matches) {
      if (!builtins.has(match)) {
        variables.add(match);
      }
    }

    return variables;
  }

  /**
   * Evaluate a formula with given variable values.
   *
   * @param formula - Formula string
   * @param values - Variable values
   * @returns Evaluated result
   */
  private evaluateFormula(formula: string, values: { [name: string]: number }): number {
    try {
      return this.math.evaluate(formula, values) as number;
    } catch (error) {
      throw new Error(`Error evaluating formula "${formula}": ${error}`);
    }
  }

  /**
   * Calculate statistics for a sample array.
   *
   * @param samples - Array of sample values
   * @returns Statistical summary
   */
  private calculateStatistics(samples: number[]): VariableStatistics {
    return {
      mean: mean(samples),
      median: percentile(samples, 50),
      stdDev: standardDeviation(samples, true),
      min: min(samples),
      max: max(samples),
      p5: percentile(samples, 5),
      p25: percentile(samples, 25),
      p75: percentile(samples, 75),
      p95: percentile(samples, 95),
      skewness: skewness(samples),
      kurtosis: kurtosis(samples),
    };
  }

  /**
   * Validate correlation matrix.
   *
   * @param correlations - Correlation matrix
   * @param allVars - All variables (input and formula)
   * @param inputVars - Input variables only
   * @throws {Error} If correlations are invalid
   */
  private validateCorrelations(
    correlations: { [key: string]: number },
    allVars: Variable[],
    inputVars: Variable[]
  ): void {
    const allVarMap = new Map(allVars.map((v) => [v.name, v]));
    const inputVarMap = new Map(inputVars.map((v) => [v.name, v]));

    for (const [key, value] of Object.entries(correlations)) {
      // Check correlation coefficient range
      if (value < -1 || value > 1) {
        throw new Error(`Correlation coefficient must be between -1 and 1, got ${value} for "${key}"`);
      }

      // Parse variable names from key (format: "Var1-Var2")
      const vars = key.split('-');
      if (vars.length !== 2) {
        throw new Error(`Invalid correlation key format: "${key}". Expected "Var1-Var2"`);
      }

      // Check that both variables exist first
      if (!allVarMap.has(vars[0])) {
        throw new Error(`Correlation references undefined variable "${vars[0]}"`);
      }
      if (!allVarMap.has(vars[1])) {
        throw new Error(`Correlation references undefined variable "${vars[1]}"`);
      }

      // Check that both are input variables
      if (!inputVarMap.has(vars[0]) || !inputVarMap.has(vars[1])) {
        throw new Error(`Correlation can only be applied to input variables`);
      }
    }
  }

  /**
   * Build correlation matrix from correlation map.
   *
   * @param correlations - Correlation specifications
   * @param inputVars - Input variables
   * @returns Full correlation matrix
   */
  private buildCorrelationMatrix(
    correlations: { [key: string]: number },
    inputVars: Variable[]
  ): number[][] {
    const n = inputVars.length;
    const matrix: number[][] = [];

    // Initialize identity matrix
    for (let i = 0; i < n; i++) {
      matrix[i] = [];
      for (let j = 0; j < n; j++) {
        matrix[i][j] = i === j ? 1 : 0;
      }
    }

    // Fill in correlations
    for (const [key, value] of Object.entries(correlations)) {
      const [var1, var2] = key.split('-');
      const i = inputVars.findIndex((v) => v.name === var1);
      const j = inputVars.findIndex((v) => v.name === var2);

      if (i !== -1 && j !== -1) {
        matrix[i][j] = value;
        matrix[j][i] = value; // Symmetric
      }
    }

    return matrix;
  }

  /**
   * Perform Cholesky decomposition of correlation matrix.
   *
   * Decomposes a symmetric positive-definite matrix A into L * L^T
   * where L is a lower triangular matrix.
   *
   * @param matrix - Symmetric positive-definite correlation matrix
   * @returns Lower triangular Cholesky matrix
   * @throws {Error} If matrix is not positive definite
   */
  private choleskyDecomposition(matrix: number[][]): number[][] {
    const n = matrix.length;
    const L: number[][] = [];

    // Initialize L
    for (let i = 0; i < n; i++) {
      L[i] = new Array(n).fill(0);
    }

    // Cholesky-Banachiewicz algorithm
    for (let i = 0; i < n; i++) {
      for (let j = 0; j <= i; j++) {
        let sum = 0;

        for (let k = 0; k < j; k++) {
          sum += L[i][k] * L[j][k];
        }

        if (i === j) {
          const value = matrix[i][i] - sum;
          if (value <= 0) {
            throw new Error(
              'Correlation matrix is not positive definite. Check that correlations are mathematically consistent.'
            );
          }
          L[i][j] = Math.sqrt(value);
        } else {
          L[i][j] = (matrix[i][j] - sum) / L[j][j];
        }
      }
    }

    return L;
  }

  /**
   * Generate correlated samples using Cholesky decomposition.
   *
   * Uses the Cholesky matrix to transform independent standard normal
   * samples into correlated samples, then applies inverse CDF to get
   * samples from the actual distributions.
   *
   * @param inputVars - Input variables
   * @param choleskyMatrix - Cholesky decomposition of correlation matrix
   * @returns Array of correlated samples
   */
  private generateCorrelatedSamples(inputVars: Variable[], choleskyMatrix: number[][]): number[] {
    const n = inputVars.length;

    // Generate independent standard normal samples
    const independentNormals: number[] = [];
    for (let i = 0; i < n; i++) {
      // Box-Muller transform for standard normal
      const u1 = this.rng.next();
      const u2 = this.rng.next();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      independentNormals.push(z);
    }

    // Apply Cholesky matrix to get correlated normals
    const correlatedNormals: number[] = [];
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j <= i; j++) {
        sum += choleskyMatrix[i][j] * independentNormals[j];
      }
      correlatedNormals.push(sum);
    }

    // Convert correlated standard normals to correlated samples from actual distributions
    // using Normal CDF -> Uniform -> Inverse CDF of target distribution
    const samples: number[] = [];
    for (let i = 0; i < n; i++) {
      // Convert standard normal to uniform [0,1] using normal CDF
      const normalCDF = 0.5 * (1 + this.erf(correlatedNormals[i] / Math.sqrt(2)));

      // Apply inverse CDF of target distribution
      const sample = inputVars[i].distribution!.inverseCDF(normalCDF);
      samples.push(sample);
    }

    return samples;
  }

  /**
   * Error function approximation.
   *
   * @param x - Input value
   * @returns erf(x)
   */
  private erf(x: number): number {
    // Abramowitz and Stegun approximation
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const t = 1 / (1 + p * x);
    const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }
}
