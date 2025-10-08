/**
 * JSON Schema for Argo Simulation Configuration Files
 *
 * Defines the structure and validation rules for simulation configs
 */

export const simulationConfigSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Argo Simulation Configuration',
  description: 'Configuration for Monte Carlo simulation',
  type: 'object',
  required: ['iterations', 'variables'],
  properties: {
    iterations: {
      type: 'integer',
      minimum: 1,
      maximum: 1000000,
      description: 'Number of Monte Carlo iterations to run',
    },
    seed: {
      type: 'integer',
      description: 'Random seed for reproducibility (optional)',
    },
    variables: {
      type: 'array',
      minItems: 1,
      description: 'List of input and formula variables',
      items: {
        type: 'object',
        required: ['name', 'type'],
        properties: {
          name: {
            type: 'string',
            pattern: '^[a-zA-Z_][a-zA-Z0-9_]*$',
            description: 'Variable name (must be valid identifier)',
          },
          description: {
            type: 'string',
            description: 'Human-readable description',
          },
          type: {
            type: 'string',
            enum: ['input', 'formula'],
            description: 'Variable type: input (distribution) or formula (calculated)',
          },
          distribution: {
            type: 'object',
            description: 'Distribution configuration (required for input variables)',
            required: ['type', 'parameters'],
            properties: {
              type: {
                type: 'string',
                enum: [
                  'Normal',
                  'Uniform',
                  'Triangular',
                  'LogNormal',
                  'Exponential',
                  'Beta',
                  'Gamma',
                  'Weibull',
                  'Pareto',
                  'PERT',
                  'Binomial',
                  'Poisson',
                  'Geometric',
                  'Hypergeometric',
                ],
                description: 'Distribution type',
              },
              parameters: {
                type: 'object',
                description: 'Distribution parameters (varies by type)',
                additionalProperties: {
                  type: 'number',
                },
              },
            },
          },
          formula: {
            type: 'string',
            description: 'Formula expression (required for formula variables)',
          },
          units: {
            type: 'string',
            description: 'Units of measurement (e.g., "days", "$", "hours")',
          },
        },
        allOf: [
          // If type is 'input', distribution is required
          {
            if: {
              properties: { type: { const: 'input' } },
            },
            then: {
              required: ['distribution'],
            },
          },
          // If type is 'formula', formula is required
          {
            if: {
              properties: { type: { const: 'formula' } },
            },
            then: {
              required: ['formula'],
            },
          },
        ],
      },
    },
    correlations: {
      type: 'object',
      description: 'Correlation coefficients between input variables',
      additionalProperties: {
        type: 'number',
        minimum: -1,
        maximum: 1,
      },
      patternProperties: {
        '^[a-zA-Z_][a-zA-Z0-9_]*-[a-zA-Z_][a-zA-Z0-9_]*$': {
          type: 'number',
          minimum: -1,
          maximum: 1,
        },
      },
    },
    outputs: {
      type: 'array',
      description: 'Variables to track as outputs (default: all variables)',
      items: {
        type: 'string',
      },
    },
  },
} as const;

/**
 * Example simulation configuration
 */
export const exampleConfig = {
  iterations: 10000,
  seed: 42,
  variables: [
    {
      name: 'Revenue',
      type: 'input',
      description: 'Annual revenue',
      units: '$',
      distribution: {
        type: 'Normal',
        parameters: {
          mean: 1000000,
          stddev: 150000,
        },
      },
    },
    {
      name: 'Cost',
      type: 'input',
      description: 'Annual costs',
      units: '$',
      distribution: {
        type: 'Normal',
        parameters: {
          mean: 700000,
          stddev: 100000,
        },
      },
    },
    {
      name: 'Profit',
      type: 'formula',
      description: 'Net profit',
      units: '$',
      formula: 'Revenue - Cost',
    },
  ],
  correlations: {
    'Revenue-Cost': 0.3,
  },
  outputs: ['Revenue', 'Cost', 'Profit'],
};
