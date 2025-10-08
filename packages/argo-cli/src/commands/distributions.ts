/**
 * Distributions Command
 *
 * Lists all available probability distributions in Argo
 */

export interface DistributionInfo {
  name: string;
  type: 'continuous' | 'discrete';
  description: string;
  parameters: string[];
}

/**
 * Get list of all available distributions with metadata
 *
 * @returns Array of distribution information objects
 */
export function listDistributions(): DistributionInfo[] {
  const distributions: DistributionInfo[] = [
    // Continuous Distributions
    {
      name: 'Beta',
      type: 'continuous',
      description: 'Beta distribution - bounded continuous distribution on [0,1]',
      parameters: ['alpha', 'beta'],
    },
    {
      name: 'Exponential',
      type: 'continuous',
      description: 'Exponential distribution - models time between events',
      parameters: ['rate'],
    },
    {
      name: 'Gamma',
      type: 'continuous',
      description: 'Gamma distribution - generalizes exponential distribution',
      parameters: ['shape', 'rate'],
    },
    {
      name: 'LogNormal',
      type: 'continuous',
      description: 'Log-normal distribution - log of variable is normally distributed',
      parameters: ['mu', 'sigma'],
    },
    {
      name: 'Normal',
      type: 'continuous',
      description: 'Normal (Gaussian) distribution - bell curve',
      parameters: ['mean', 'stddev'],
    },
    {
      name: 'PERT',
      type: 'continuous',
      description: 'PERT distribution - smooth three-point estimation',
      parameters: ['min', 'mode', 'max'],
    },
    {
      name: 'Pareto',
      type: 'continuous',
      description: 'Pareto distribution - power law (80/20 rule)',
      parameters: ['scale', 'shape'],
    },
    {
      name: 'Triangular',
      type: 'continuous',
      description: 'Triangular distribution - simple three-point estimation',
      parameters: ['min', 'mode', 'max'],
    },
    {
      name: 'Uniform',
      type: 'continuous',
      description: 'Uniform distribution - equal probability over range',
      parameters: ['min', 'max'],
    },
    {
      name: 'Weibull',
      type: 'continuous',
      description: 'Weibull distribution - reliability analysis and life data',
      parameters: ['shape', 'scale'],
    },

    // Discrete Distributions
    {
      name: 'Binomial',
      type: 'discrete',
      description: 'Binomial distribution - number of successes in n trials',
      parameters: ['n', 'p'],
    },
    {
      name: 'Geometric',
      type: 'discrete',
      description: 'Geometric distribution - trials until first success',
      parameters: ['p'],
    },
    {
      name: 'Hypergeometric',
      type: 'discrete',
      description: 'Hypergeometric distribution - sampling without replacement',
      parameters: ['N', 'K', 'n'],
    },
    {
      name: 'Poisson',
      type: 'discrete',
      description: 'Poisson distribution - events in fixed interval',
      parameters: ['lambda'],
    },
  ];

  // Sort alphabetically by name (case-insensitive)
  return distributions.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
}

/**
 * Execute the distributions command
 *
 * Prints a formatted table of all available distributions
 */
export function executeDistributionsCommand(): void {
  const distributions = listDistributions();

  console.log('\n📊 Argo Probability Distributions\n');
  console.log(`Total: ${distributions.length} distributions (${
    distributions.filter((d) => d.type === 'continuous').length
  } continuous, ${distributions.filter((d) => d.type === 'discrete').length} discrete)\n`);

  console.log('Continuous Distributions:');
  distributions
    .filter((d) => d.type === 'continuous')
    .forEach((d) => {
      console.log(`  • ${d.name.padEnd(15)} - ${d.description}`);
      console.log(`    Parameters: ${d.parameters.join(', ')}`);
    });

  console.log('\nDiscrete Distributions:');
  distributions
    .filter((d) => d.type === 'discrete')
    .forEach((d) => {
      console.log(`  • ${d.name.padEnd(15)} - ${d.description}`);
      console.log(`    Parameters: ${d.parameters.join(', ')}`);
    });

  console.log('\nFor more information, visit: https://github.com/montge/argo\n');
}
