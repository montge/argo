import { Distribution, RandomNumberGenerator } from '../types/Distribution';

/**
 * Exponential distribution
 *
 * The exponential distribution is a continuous probability distribution that models
 * the time between events in a Poisson point process. It is characterized by a
 * single parameter lambda (λ), the rate parameter.
 *
 * The exponential distribution is memoryless: P(X > s+t | X > s) = P(X > t)
 *
 * PDF: f(x) = λ * exp(-λx) for x ≥ 0
 * CDF: F(x) = 1 - exp(-λx) for x ≥ 0
 *
 * Mean: 1/λ
 * Variance: 1/λ²
 *
 * @example
 * ```typescript
 * const rng = new SimpleRNG(42);
 * const dist = new ExponentialDistribution(2.0);  // Mean = 0.5
 *
 * // Generate a sample (time to next event)
 * const sample = dist.sample(rng);  // ~0.5
 *
 * // Calculate PDF at x=1
 * const density = dist.pdf(1);  // ~0.27
 *
 * // Calculate probability of X <= 1
 * const prob = dist.cdf(1);  // ~0.86
 * ```
 */
export class ExponentialDistribution implements Distribution {
  public readonly name = 'Exponential';

  /**
   * Create an exponential distribution
   * @param lambda Rate parameter (λ) of the distribution (must be > 0)
   */
  constructor(public readonly lambda: number) {
    this.validateParameters();
  }

  /**
   * Generate a random sample from this exponential distribution
   * Uses inverse transform method: X = -ln(U) / λ
   */
  sample(rng: RandomNumberGenerator): number {
    const u = rng.next();
    // Inverse CDF: -ln(1-u)/lambda = -ln(u)/lambda (since 1-u ~ u)
    return -Math.log(u) / this.lambda;
  }

  /**
   * Probability density function
   * f(x) = λ * exp(-λx) for x ≥ 0
   */
  pdf(x: number): number {
    if (x < 0) return 0;
    return this.lambda * Math.exp(-this.lambda * x);
  }

  /**
   * Cumulative distribution function
   * F(x) = 1 - exp(-λx) for x ≥ 0
   */
  cdf(x: number): number {
    if (x < 0) return 0;
    return 1 - Math.exp(-this.lambda * x);
  }

  /**
   * Inverse cumulative distribution function (quantile function)
   * F⁻¹(p) = -ln(1-p) / λ
   */
  inverseCDF(p: number): number {
    if (p < 0 || p >= 1) {
      throw new Error('Probability must be in [0, 1)');
    }

    if (p === 0) return 0;

    // Inverse CDF: -ln(1-p) / lambda
    return -Math.log(1 - p) / this.lambda;
  }

  /**
   * Mean of the exponential distribution
   * Mean = 1/λ
   */
  get mean(): number {
    return 1 / this.lambda;
  }

  /**
   * Variance of the exponential distribution
   * Variance = 1/λ²
   */
  get variance(): number {
    return 1 / (this.lambda * this.lambda);
  }

  /**
   * Validate distribution parameters
   * @throws Error if parameters are invalid
   */
  validateParameters(): boolean {
    if (this.lambda <= 0) {
      throw new Error('Lambda (rate) must be positive');
    }
    if (!isFinite(this.lambda)) {
      throw new Error('Lambda must be finite');
    }
    return true;
  }
}
