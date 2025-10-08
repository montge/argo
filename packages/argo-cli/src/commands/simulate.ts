/**
 * Simulate Command
 *
 * Runs Monte Carlo simulations from configuration files
 */

import * as fs from 'fs';
import {
  MonteCarloEngine,
  SimpleRNG,
  NormalDistribution,
  UniformDistribution,
  TriangularDistribution,
  LogNormalDistribution,
  ExponentialDistribution,
  BetaDistribution,
  GammaDistribution,
  WeibullDistribution,
  ParetoDistribution,
  PERTDistribution,
  BinomialDistribution,
  PoissonDistribution,
  GeometricDistribution,
  HypergeometricDistribution,
  Distribution,
  SimulationConfig,
  SimulationResult,
} from '@argo/core';

/**
 * Parse configuration from file
 *
 * @param configPath - Path to config file
 * @returns Parsed configuration object
 */
export function parseConfig(configPath: string): any {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration file not found: ${configPath}`);
  }

  const content = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Create distribution instance from config
 *
 * @param distConfig - Distribution configuration
 * @returns Distribution instance
 */
function createDistribution(distConfig: any): Distribution {
  const { type, parameters } = distConfig;

  switch (type) {
    case 'Normal':
      return new NormalDistribution(parameters.mean, parameters.stddev);

    case 'Uniform':
      return new UniformDistribution(parameters.min, parameters.max);

    case 'Triangular':
      return new TriangularDistribution(parameters.min, parameters.mode, parameters.max);

    case 'LogNormal':
      return new LogNormalDistribution(parameters.mu, parameters.sigma);

    case 'Exponential':
      return new ExponentialDistribution(parameters.rate);

    case 'Beta':
      return new BetaDistribution(parameters.alpha, parameters.beta);

    case 'Gamma':
      return new GammaDistribution(parameters.shape, parameters.rate);

    case 'Weibull':
      return new WeibullDistribution(parameters.shape, parameters.scale);

    case 'Pareto':
      return new ParetoDistribution(parameters.scale, parameters.shape);

    case 'PERT':
      return new PERTDistribution(parameters.min, parameters.mode, parameters.max);

    case 'Binomial':
      return new BinomialDistribution(parameters.n, parameters.p);

    case 'Poisson':
      return new PoissonDistribution(parameters.lambda);

    case 'Geometric':
      return new GeometricDistribution(parameters.p);

    case 'Hypergeometric':
      return new HypergeometricDistribution(parameters.N, parameters.K, parameters.n);

    default:
      throw new Error(`Unknown distribution type: ${type}`);
  }
}

/**
 * Run simulation from configuration
 *
 * @param config - Simulation configuration
 * @returns Simulation results
 */
export function runSimulation(config: any): SimulationResult {
  // Create RNG with seed if provided
  const rng = config.seed !== undefined ? new SimpleRNG(config.seed) : new SimpleRNG();

  // Create simulation engine
  const engine = new MonteCarloEngine(rng);

  // Build simulation config
  const simConfig: SimulationConfig = {
    iterations: config.iterations,
    seed: config.seed,
    variables: config.variables.map((varConfig: any) => {
      const variable: any = {
        name: varConfig.name,
        type: varConfig.type,
        description: varConfig.description,
        units: varConfig.units,
      };

      if (varConfig.type === 'input' && varConfig.distribution) {
        variable.distribution = createDistribution(varConfig.distribution);
      } else if (varConfig.type === 'formula' && varConfig.formula) {
        variable.formula = varConfig.formula;
      }

      return variable;
    }),
    correlations: config.correlations,
    outputs: config.outputs,
  };

  // Run simulation
  return engine.simulate(simConfig);
}

/**
 * Format statistics for display
 *
 * @param stats - Variable statistics
 * @returns Formatted string
 */
function formatStats(stats: any): string {
  return `
    Mean:   ${stats.mean.toFixed(2)}
    Median: ${stats.median.toFixed(2)}
    Std Dev: ${stats.stdDev.toFixed(2)}
    Min:    ${stats.min.toFixed(2)}
    Max:    ${stats.max.toFixed(2)}
    P5:     ${stats.p5.toFixed(2)}
    P25:    ${stats.p25.toFixed(2)}
    P75:    ${stats.p75.toFixed(2)}
    P95:    ${stats.p95.toFixed(2)}
  `;
}

/**
 * Execute the simulate command
 *
 * @param configPath - Path to configuration file
 * @param options - Command options
 */
export function executeSimulateCommand(
  configPath: string,
  options: { output?: string; verbose?: boolean } = {}
): void {
  try {
    console.log(`📊 Running simulation from: ${configPath}\n`);

    // Parse configuration
    const config = parseConfig(configPath);

    // Run simulation
    const results = runSimulation(config);

    // Display results
    console.log(`✅ Simulation complete!`);
    console.log(`   Iterations: ${results.iterationsCompleted.toLocaleString()}`);
    console.log(`   Execution time: ${results.executionTime.toFixed(0)}ms`);
    console.log(
      `   Performance: ${(results.iterationsCompleted / (results.executionTime / 1000)).toLocaleString(
        undefined,
        { maximumFractionDigits: 0 }
      )} iterations/second\n`
    );

    // Display statistics for each variable
    const varNames = Object.keys(results.statistics);
    console.log(`📈 Results (${varNames.length} variables):\n`);

    for (const varName of varNames) {
      const stats = results.statistics[varName];
      console.log(`${varName}:${formatStats(stats)}`);
    }

    // Save output if requested
    if (options.output) {
      const outputData = {
        config,
        results: {
          statistics: results.statistics,
          executionTime: results.executionTime,
          iterationsCompleted: results.iterationsCompleted,
        },
      };

      // Include samples if verbose
      if (options.verbose) {
        (outputData.results as any).samples = results.samples;
      }

      fs.writeFileSync(options.output, JSON.stringify(outputData, null, 2));
      console.log(`\n💾 Results saved to: ${options.output}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`\n❌ Error: ${error.message}`);
      process.exit(1);
    }
    throw error;
  }
}
