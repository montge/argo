import { Distribution, RandomNumberGenerator } from '../types/Distribution';
import { BetaDistribution } from './BetaDistribution';

/**
 * PERT Distribution (Program Evaluation and Review Technique)
 *
 * A continuous probability distribution used in project management for estimating
 * task durations. It's a special case of the Beta distribution scaled to [min, max]
 * with parameters derived from expert estimates.
 *
 * Properties:
 * - Support: [min, max]
 * - Parameters: min < mode < max
 * - Mean: (min + 4*mode + max) / 6
 * - Variance: ((mean - min) * (max - mean)) / 7
 * - Mode: The most likely value (expert estimate)
 *
 * Common Uses:
 * - Project management (PERT/CPM scheduling)
 * - Task duration estimation
 * - Risk analysis with three-point estimates
 * - Cost estimation
 * - Resource planning
 *
 * Advantages over Triangular:
 * - Smooth, continuous probability near mode
 * - Less probability mass at extremes
 * - Based on Beta distribution (well-studied properties)
 * - More realistic for many real-world scenarios
 *
 * Shape Parameters (derived internally):
 * - α₁ = 1 + λ(mode - min)/(max - min) where λ=4
 * - α₂ = 1 + λ(max - mode)/(max - min) where λ=4
 *
 * Three-Point Estimation:
 * - Optimistic (min): Best case scenario
 * - Most Likely (mode): Expert's best estimate
 * - Pessimistic (max): Worst case scenario
 *
 * @example
 * ```typescript
 * const rng = new SimpleRNG(42);
 * // Task estimated: optimistic=5 days, likely=8 days, pessimistic=15 days
 * const dist = new PERTDistribution(5, 8, 15);
 * const sample = dist.sample(rng); // Returns value in [5, 15]
 * console.log(`Mean: ${dist.mean.toFixed(2)} days`); // ~8.83 days
 * ```
 */
export class PERTDistribution implements Distribution {
  /**
   * Distribution name
   */
  public readonly name = 'PERT';

  /**
   * Minimum value (optimistic estimate)
   */
  public readonly min: number;

  /**
   * Most likely value (mode, expert estimate)
   */
  public readonly mode: number;

  /**
   * Maximum value (pessimistic estimate)
   */
  public readonly max: number;

  /**
   * Internal Beta distribution used for sampling
   */
  private readonly beta: BetaDistribution;

  /**
   * Creates a PERT distribution
   *
   * @param min - Minimum value (must be < mode)
   * @param mode - Most likely value (must be < max)
   * @param max - Maximum value
   * @throws {Error} If parameters are not properly ordered or finite
   */
  constructor(min: number, mode: number, max: number) {
    if (!isFinite(min) || !isFinite(mode) || !isFinite(max)) {
      throw new Error('Parameters must be finite numbers');
    }
    if (min >= mode) {
      throw new Error('Min must be less than mode');
    }
    if (mode >= max) {
      throw new Error('Mode must be less than max');
    }

    this.min = min;
    this.mode = mode;
    this.max = max;

    // Calculate Beta distribution parameters
    // Using λ = 4 (standard PERT formula)
    const range = max - min;
    const lambda = 4;

    const alpha = 1 + lambda * (mode - min) / range;
    const beta = 1 + lambda * (max - mode) / range;

    this.beta = new BetaDistribution(alpha, beta);
  }

  /**
   * Generates a random sample from the PERT distribution
   *
   * Uses underlying Beta distribution and scales to [min, max]
   *
   * @param rng - Random number generator
   * @returns A random sample from the PERT distribution [min, max]
   */
  sample(rng: RandomNumberGenerator): number {
    // Sample from Beta(α, β) which gives value in [0, 1]
    const betaSample = this.beta.sample(rng);

    // Scale to [min, max]
    return this.min + betaSample * (this.max - this.min);
  }

  /**
   * Probability density function
   *
   * PDF(x) = Beta_PDF((x-min)/(max-min)) / (max-min)
   *
   * @param x - Value to evaluate
   * @returns Probability density at x
   */
  pdf(x: number): number {
    if (x < this.min || x > this.max) {
      return 0;
    }

    // Transform to [0,1] for Beta distribution
    const range = this.max - this.min;
    const normalized = (x - this.min) / range;

    // PDF needs to be scaled by 1/range to maintain integral of 1
    return this.beta.pdf(normalized) / range;
  }

  /**
   * Cumulative distribution function
   *
   * CDF(x) = Beta_CDF((x-min)/(max-min))
   *
   * @param x - Value to evaluate
   * @returns Cumulative probability up to x
   */
  cdf(x: number): number {
    if (x <= this.min) {
      return 0;
    }
    if (x >= this.max) {
      return 1;
    }

    // Transform to [0,1] for Beta distribution
    const normalized = (x - this.min) / (this.max - this.min);
    return this.beta.cdf(normalized);
  }

  /**
   * Inverse cumulative distribution function (quantile function)
   *
   * inverseCDF(p) = min + (max-min) * Beta_inverseCDF(p)
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
      return this.min;
    }
    if (p === 1) {
      return this.max;
    }

    // Get quantile from Beta distribution
    const betaQuantile = this.beta.inverseCDF(p);

    // Scale to [min, max]
    return this.min + betaQuantile * (this.max - this.min);
  }

  /**
   * Mean of the distribution
   *
   * @returns (min + 4*mode + max) / 6
   */
  get mean(): number {
    return (this.min + 4 * this.mode + this.max) / 6;
  }

  /**
   * Variance of the distribution
   *
   * @returns ((mean - min) * (max - mean)) / 7
   */
  get variance(): number {
    const mean = this.mean;
    return ((mean - this.min) * (this.max - mean)) / 7;
  }

  /**
   * Validates distribution parameters
   *
   * @returns true if parameters are valid
   * @throws {Error} If parameters are invalid
   */
  validateParameters(): boolean {
    if (this.min >= this.mode) {
      throw new Error('Min must be less than mode');
    }
    if (this.mode >= this.max) {
      throw new Error('Mode must be less than max');
    }
    if (!isFinite(this.min) || !isFinite(this.mode) || !isFinite(this.max)) {
      throw new Error('Parameters must be finite numbers');
    }
    return true;
  }
}
