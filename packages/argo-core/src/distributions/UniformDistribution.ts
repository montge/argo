import { Distribution, RandomNumberGenerator } from '../types/Distribution';

/**
 * Continuous Uniform distribution
 *
 * The uniform distribution is a continuous probability distribution where all values
 * in a given interval [min, max) are equally likely.
 *
 * PDF: f(x) = 1/(max-min) for x in [min, max), 0 otherwise
 * CDF: F(x) = (x-min)/(max-min) for x in [min, max)
 *
 * @example
 * ```typescript
 * const rng = new SimpleRNG(42);
 * const dist = new UniformDistribution(0, 10);
 *
 * // Generate a sample
 * const sample = dist.sample(rng);  // Random value in [0, 10)
 *
 * // Calculate PDF - constant within range
 * const density = dist.pdf(5);  // 0.1 (same for any x in [0, 10))
 *
 * // Calculate probability of X <= 5
 * const prob = dist.cdf(5);  // 0.5 (50%)
 * ```
 */
export class UniformDistribution implements Distribution {
  public readonly name = 'Uniform';

  /**
   * Create a uniform distribution
   * @param min Minimum value (inclusive)
   * @param max Maximum value (exclusive)
   */
  constructor(
    public readonly min: number,
    public readonly max: number
  ) {
    this.validateParameters();
  }

  /**
   * Generate a random sample from this uniform distribution
   */
  sample(rng: RandomNumberGenerator): number {
    return this.min + rng.next() * (this.max - this.min);
  }

  /**
   * Probability density function
   * f(x) = 1/(max-min) for x in [min, max), 0 otherwise
   */
  pdf(x: number): number {
    if (x < this.min || x >= this.max) {
      return 0;
    }
    return 1 / (this.max - this.min);
  }

  /**
   * Cumulative distribution function
   * F(x) = 0 for x < min
   * F(x) = (x-min)/(max-min) for x in [min, max)
   * F(x) = 1 for x >= max
   */
  cdf(x: number): number {
    if (x < this.min) {
      return 0;
    }
    if (x >= this.max) {
      return 1;
    }
    return (x - this.min) / (this.max - this.min);
  }

  /**
   * Inverse cumulative distribution function (quantile function)
   * F^(-1)(p) = min + p * (max - min)
   */
  inverseCDF(p: number): number {
    if (p < 0 || p > 1) {
      throw new Error('Probability must be between 0 and 1');
    }
    return this.min + p * (this.max - this.min);
  }

  /**
   * Validate distribution parameters
   * @throws Error if parameters are invalid
   */
  validateParameters(): boolean {
    if (!isFinite(this.min) || !isFinite(this.max)) {
      throw new Error('min and max must be finite');
    }
    if (this.min >= this.max) {
      throw new Error('max must be greater than min');
    }
    return true;
  }
}
