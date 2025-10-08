import { Distribution, RandomNumberGenerator } from '../types/Distribution';

/**
 * Geometric Distribution
 *
 * A discrete probability distribution representing the number of Bernoulli trials
 * needed to get the first success. Models "waiting time" until first success.
 *
 * Properties:
 * - Support: {1, 2, 3, ...} (positive integers)
 * - Parameter: p (success probability, 0 < p ≤ 1)
 * - Mean: 1/p
 * - Variance: (1-p)/p²
 * - Mode: 1
 * - Memoryless property: P(X > s+t | X > s) = P(X > t)
 *
 * Common Uses:
 * - Number of attempts until first success
 * - Time until first occurrence of an event
 * - Quality control (items inspected until first defect)
 * - Reliability testing (trials until first failure)
 * - Sales (calls until first sale)
 *
 * Memoryless Property:
 * - Only discrete distribution with this property
 * - Past trials don't affect future probability
 * - Similar to exponential distribution (continuous analog)
 *
 * Relationship to Other Distributions:
 * - Special case of Negative Binomial (r=1)
 * - Discrete analog of Exponential distribution
 * - Related to Binomial (but indefinite trials)
 *
 * Sampling Algorithm:
 * - Uses inverse transform method with logarithm
 * - Very efficient: O(1) time complexity
 *
 * @example
 * ```typescript
 * const rng = new SimpleRNG(42);
 * // Flip coin until first heads (p=0.5)
 * const dist = new GeometricDistribution(0.5);
 * const flips = dist.sample(rng); // Number of flips until first heads
 * console.log(`Got heads on flip ${flips}`);
 * console.log(`Expected flips: ${dist.mean}`); // 2
 * console.log(`P(first flip) = ${dist.pmf(1)}`); // 0.5
 * ```
 */
export class GeometricDistribution implements Distribution {
  /**
   * Distribution name
   */
  public readonly name = 'Geometric';

  /**
   * Success probability
   */
  public readonly p: number;

  /**
   * Creates a Geometric distribution
   *
   * @param p - Probability of success (must be in (0, 1])
   * @throws {Error} If p is not in valid range
   */
  constructor(p: number) {
    if (!isFinite(p)) {
      throw new Error('p must be a finite number');
    }
    if (p <= 0 || p > 1) {
      throw new Error('p must be in (0, 1]');
    }

    this.p = p;
  }

  /**
   * Generates a random sample from the Geometric distribution
   *
   * Uses inverse transform method:
   * X = ceil(log(U) / log(1-p)) where U ~ Uniform(0,1)
   *
   * This is highly efficient with O(1) complexity.
   *
   * @param rng - Random number generator
   * @returns Number of trials until first success (positive integer)
   */
  sample(rng: RandomNumberGenerator): number {
    if (this.p === 1) {
      return 1; // Always succeed on first trial
    }

    // Inverse transform method
    const u = rng.next();
    return Math.ceil(Math.log(u) / Math.log(1 - this.p));
  }

  /**
   * Probability mass function (PMF)
   *
   * PMF(k) = p × (1-p)^(k-1) for k = 1, 2, 3, ...
   *
   * Represents probability of first success on the k-th trial.
   *
   * @param k - Number of trials
   * @returns Probability of first success on trial k
   */
  pmf(k: number): number {
    if (!Number.isInteger(k) || k < 1) {
      return 0;
    }

    if (this.p === 1) {
      return k === 1 ? 1 : 0;
    }

    // PMF(k) = p × (1-p)^(k-1)
    return this.p * Math.pow(1 - this.p, k - 1);
  }

  /**
   * Cumulative distribution function (CDF)
   *
   * CDF(k) = P(X ≤ k) = 1 - (1-p)^k for k = 1, 2, 3, ...
   *
   * Closed form avoids summing PMF values.
   *
   * @param k - Value to evaluate
   * @returns Probability that X ≤ k
   */
  cdf(k: number): number {
    if (k < 1) {
      return 0;
    }

    if (this.p === 1) {
      return 1;
    }

    // Use integer floor for non-integer k
    const kInt = Math.floor(k);

    // CDF(k) = 1 - (1-p)^k
    return 1 - Math.pow(1 - this.p, kInt);
  }

  /**
   * Inverse cumulative distribution function (quantile function)
   *
   * Returns smallest k such that CDF(k) ≥ prob
   *
   * Uses closed form: k = ceil(log(1-prob) / log(1-p))
   *
   * @param prob - Probability (must be in [0, 1])
   * @returns Smallest k where P(X ≤ k) ≥ prob
   * @throws {Error} If prob is not in [0, 1]
   */
  inverseCDF(prob: number): number {
    if (prob < 0 || prob > 1) {
      throw new Error('Probability must be between 0 and 1');
    }

    if (prob === 0) {
      return 1; // Minimum value
    }

    if (prob === 1 || this.p === 1) {
      if (this.p === 1) {
        return 1;
      }
      // Return a very large but reasonable value
      return Math.ceil(this.mean + 10 * Math.sqrt(this.variance));
    }

    // Inverse CDF: k = ceil(log(1-prob) / log(1-p))
    return Math.ceil(Math.log(1 - prob) / Math.log(1 - this.p));
  }

  /**
   * Mean of the distribution
   *
   * Expected number of trials until first success.
   *
   * @returns 1/p
   */
  get mean(): number {
    return 1 / this.p;
  }

  /**
   * Variance of the distribution
   *
   * @returns (1-p)/p²
   */
  get variance(): number {
    return (1 - this.p) / (this.p * this.p);
  }

  /**
   * Validates distribution parameters
   *
   * @returns true if parameters are valid
   * @throws {Error} If parameters are invalid
   */
  validateParameters(): boolean {
    if (!isFinite(this.p)) {
      throw new Error('p must be a finite number');
    }
    if (this.p <= 0 || this.p > 1) {
      throw new Error('p must be in (0, 1]');
    }
    return true;
  }

  /**
   * Probability density function (not applicable for discrete distribution)
   *
   * For discrete distributions, use pmf() instead.
   * This method is included for interface compatibility.
   *
   * @param x - Value to evaluate
   * @returns 0 (discrete distributions don't have PDFs)
   */
  pdf(x: number): number {
    // Discrete distributions don't have a PDF, use PMF instead
    return 0;
  }
}
