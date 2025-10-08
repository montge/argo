import { Distribution, RandomNumberGenerator } from '../types/Distribution';

/**
 * Pareto Distribution (Power Law Distribution)
 *
 * A continuous probability distribution characterized by a "heavy tail" and the
 * 80/20 rule (Pareto principle). Named after economist Vilfredo Pareto.
 *
 * Properties:
 * - Support: [x_m, ∞) where x_m is the scale parameter
 * - Parameters: scale (x_m) > 0, shape (α) > 0
 * - Mean: x_m * α / (α - 1) for α > 1; ∞ otherwise
 * - Variance: x_m² * α / ((α-1)² * (α-2)) for α > 2; ∞ otherwise
 * - Mode: x_m (the minimum value)
 *
 * Common Uses:
 * - Income/wealth distribution (Pareto principle)
 * - City population sizes
 * - File size distribution on internet
 * - Frequency of words in text
 * - Insurance claim sizes
 * - Stock price movements
 *
 * Power Law Property:
 * - P(X > x) = (x_m/x)^α for x ≥ x_m
 * - A small number of items account for most of the total
 *
 * Shape Parameter Interpretation:
 * - α < 1: Infinite mean (extremely heavy tail)
 * - α = 1: Infinite mean (heavy tail)
 * - 1 < α < 2: Finite mean, infinite variance
 * - α ≥ 2: Finite mean and variance
 * - α = log(5)/log(4) ≈ 1.16: Classic 80/20 rule
 *
 * @example
 * ```typescript
 * const rng = new SimpleRNG(42);
 * const dist = new ParetoDistribution(1, 2); // scale=1, shape=2
 * const sample = dist.sample(rng); // Returns value in [1, ∞)
 * ```
 */
export class ParetoDistribution implements Distribution {
  /**
   * Distribution name
   */
  public readonly name = 'Pareto';

  /**
   * Scale parameter (x_m > 0) - minimum value of the distribution
   */
  public readonly scale: number;

  /**
   * Shape parameter (α > 0) - controls tail heaviness
   */
  public readonly shape: number;

  /**
   * Creates a Pareto distribution
   *
   * @param scale - Scale parameter x_m (must be > 0, minimum value)
   * @param shape - Shape parameter α (must be > 0, tail parameter)
   * @throws {Error} If scale or shape is not positive
   */
  constructor(scale: number, shape: number) {
    if (!isFinite(scale) || !isFinite(shape)) {
      throw new Error('Parameters must be finite numbers');
    }
    if (scale <= 0) {
      throw new Error('Scale must be positive');
    }
    if (shape <= 0) {
      throw new Error('Shape must be positive');
    }

    this.scale = scale;
    this.shape = shape;
  }

  /**
   * Generates a random sample from the Pareto distribution
   *
   * Uses inverse transform sampling: X = x_m / U^(1/α)
   * where U ~ Uniform(0,1)
   *
   * @param rng - Random number generator
   * @returns A random sample from the Pareto distribution [x_m, ∞)
   */
  sample(rng: RandomNumberGenerator): number {
    const u = rng.next();
    // Inverse transform: X = scale / U^(1/shape)
    return this.scale / Math.pow(u, 1 / this.shape);
  }

  /**
   * Probability density function
   *
   * PDF(x) = α * x_m^α / x^(α+1) for x ≥ x_m
   *
   * @param x - Value to evaluate
   * @returns Probability density at x
   */
  pdf(x: number): number {
    if (x < this.scale) {
      return 0;
    }

    // PDF = α * x_m^α / x^(α+1)
    return (this.shape * Math.pow(this.scale, this.shape)) / Math.pow(x, this.shape + 1);
  }

  /**
   * Cumulative distribution function
   *
   * CDF(x) = 1 - (x_m/x)^α for x ≥ x_m
   *
   * @param x - Value to evaluate
   * @returns Cumulative probability up to x
   */
  cdf(x: number): number {
    if (x < this.scale) {
      return 0;
    }

    if (x === this.scale) {
      return 0;
    }

    // CDF = 1 - (scale/x)^shape
    return 1 - Math.pow(this.scale / x, this.shape);
  }

  /**
   * Inverse cumulative distribution function (quantile function)
   *
   * Closed-form solution: inverseCDF(p) = x_m / (1-p)^(1/α)
   *
   * @param p - Probability (must be in [0, 1])
   * @returns Value x such that CDF(x) = p
   * @throws {Error} If p is not in [0, 1]
   */
  inverseCDF(p: number): number {
    if (p < 0 || p > 1) {
      throw new Error('Probability must be between 0 and 1');
    }

    if (p === 0) {
      return this.scale;
    }

    if (p === 1) {
      return Infinity;
    }

    // Inverse: x = scale / (1-p)^(1/shape)
    return this.scale / Math.pow(1 - p, 1 / this.shape);
  }

  /**
   * Mean of the distribution
   *
   * @returns x_m * α / (α - 1) for α > 1; Infinity otherwise
   */
  get mean(): number {
    if (this.shape <= 1) {
      return Infinity;
    }

    return (this.scale * this.shape) / (this.shape - 1);
  }

  /**
   * Variance of the distribution
   *
   * @returns x_m² * α / ((α-1)² * (α-2)) for α > 2; Infinity otherwise
   */
  get variance(): number {
    if (this.shape <= 2) {
      return Infinity;
    }

    const scale2 = this.scale * this.scale;
    const shapeMinus1 = this.shape - 1;

    return (scale2 * this.shape) / (shapeMinus1 * shapeMinus1 * (this.shape - 2));
  }

  /**
   * Validates distribution parameters
   *
   * @returns true if parameters are valid
   * @throws {Error} If parameters are invalid
   */
  validateParameters(): boolean {
    if (this.scale <= 0) {
      throw new Error('Scale must be positive');
    }
    if (this.shape <= 0) {
      throw new Error('Shape must be positive');
    }
    if (!isFinite(this.scale) || !isFinite(this.shape)) {
      throw new Error('Parameters must be finite numbers');
    }
    return true;
  }
}
