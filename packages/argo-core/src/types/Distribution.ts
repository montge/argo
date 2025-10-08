/**
 * Random number generator interface
 */
export interface RandomNumberGenerator {
  /**
   * Generate a random number between 0 and 1
   */
  next(): number;

  /**
   * Set the random seed for reproducibility
   * @param seed - Seed value
   */
  setSeed(seed: number): void;
}

/**
 * Base interface for probability distributions
 */
export interface Distribution {
  /**
   * Name of the distribution
   */
  readonly name: string;

  /**
   * Generate a random sample from this distribution
   * @param rng Random number generator
   * @returns A random sample
   */
  sample(rng: RandomNumberGenerator): number;

  /**
   * Probability density function (PDF)
   * @param x Value to evaluate
   * @returns Probability density at x
   */
  pdf(x: number): number;

  /**
   * Cumulative distribution function (CDF)
   * @param x Value to evaluate
   * @returns Probability that a random variable is less than or equal to x
   */
  cdf(x: number): number;

  /**
   * Inverse cumulative distribution function (quantile function)
   * @param p Probability (0 to 1)
   * @returns Value x such that CDF(x) = p
   */
  inverseCDF(p: number): number;

  /**
   * Validate distribution parameters
   * @returns true if parameters are valid
   * @throws Error if parameters are invalid
   */
  validateParameters(): boolean;
}
