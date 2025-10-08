import { Distribution, RandomNumberGenerator } from '../types/Distribution';

/**
 * Weibull Distribution
 *
 * A continuous probability distribution with two parameters: shape (k) and scale (λ).
 * Widely used in reliability engineering and failure analysis.
 *
 * Properties:
 * - Support: [0, ∞)
 * - Parameters: shape (k) > 0, scale (λ) > 0
 * - Mean: λ * Γ(1 + 1/k)
 * - Variance: λ² * [Γ(1 + 2/k) - Γ²(1 + 1/k)]
 * - Mode: λ * ((k-1)/k)^(1/k) for k > 1; 0 for k ≤ 1
 *
 * Common Uses:
 * - Reliability engineering (time to failure, lifetime modeling)
 * - Wind speed analysis
 * - Material strength modeling
 * - Extreme value analysis
 * - Survival analysis
 *
 * Special Cases:
 * - Weibull(1, λ) = Exponential(1/λ)
 * - Weibull(2, λ) = Rayleigh distribution (with scale σ = λ/√2)
 * - As k → ∞, approaches degenerate distribution at λ
 *
 * Interpretation of shape parameter k:
 * - k < 1: Decreasing failure rate (infant mortality)
 * - k = 1: Constant failure rate (exponential, random failures)
 * - k > 1: Increasing failure rate (wear-out failures)
 *
 * @example
 * ```typescript
 * const rng = new SimpleRNG(42);
 * const dist = new WeibullDistribution(2, 1); // Rayleigh-like
 * const sample = dist.sample(rng); // Returns value in [0, ∞)
 * ```
 */
export class WeibullDistribution implements Distribution {
  /**
   * Distribution name
   */
  public readonly name = 'Weibull';

  /**
   * Shape parameter (k > 0)
   */
  public readonly shape: number;

  /**
   * Scale parameter (λ > 0)
   */
  public readonly scale: number;

  /**
   * Creates a Weibull distribution
   *
   * @param shape - Shape parameter k (must be > 0)
   * @param scale - Scale parameter λ (must be > 0)
   * @throws {Error} If shape or scale is not positive
   */
  constructor(shape: number, scale: number) {
    if (!isFinite(shape) || !isFinite(scale)) {
      throw new Error('Parameters must be finite numbers');
    }
    if (shape <= 0) {
      throw new Error('Shape must be positive');
    }
    if (scale <= 0) {
      throw new Error('Scale must be positive');
    }

    this.shape = shape;
    this.scale = scale;
  }

  /**
   * Generates a random sample from the Weibull distribution
   *
   * Uses inverse transform sampling: X = λ * (-ln(U))^(1/k)
   * where U ~ Uniform(0,1)
   *
   * @param rng - Random number generator
   * @returns A random sample from the Weibull distribution [0, ∞)
   */
  sample(rng: RandomNumberGenerator): number {
    const u = rng.next();
    // Inverse transform: X = scale * (-ln(U))^(1/shape)
    return this.scale * Math.pow(-Math.log(u), 1 / this.shape);
  }

  /**
   * Probability density function
   *
   * PDF(x) = (k/λ) * (x/λ)^(k-1) * exp(-(x/λ)^k) for x ≥ 0
   *
   * @param x - Value to evaluate
   * @returns Probability density at x
   */
  pdf(x: number): number {
    if (x < 0) {
      return 0;
    }

    if (x === 0) {
      if (this.shape > 1) {
        return 0;
      } else if (this.shape === 1) {
        return 1 / this.scale;
      } else {
        return Infinity;
      }
    }

    // PDF = (k/λ) * (x/λ)^(k-1) * exp(-(x/λ)^k)
    const xOverLambda = x / this.scale;
    const xOverLambdaPowK = Math.pow(xOverLambda, this.shape);

    return (
      (this.shape / this.scale) * Math.pow(xOverLambda, this.shape - 1) * Math.exp(-xOverLambdaPowK)
    );
  }

  /**
   * Cumulative distribution function
   *
   * CDF(x) = 1 - exp(-(x/λ)^k) for x ≥ 0
   *
   * @param x - Value to evaluate
   * @returns Cumulative probability up to x
   */
  cdf(x: number): number {
    if (x <= 0) {
      return 0;
    }

    // CDF = 1 - exp(-(x/λ)^k)
    const xOverLambda = x / this.scale;
    return 1 - Math.exp(-Math.pow(xOverLambda, this.shape));
  }

  /**
   * Inverse cumulative distribution function (quantile function)
   *
   * Closed-form solution: inverseCDF(p) = λ * (-ln(1-p))^(1/k)
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
      return 0;
    }

    if (p === 1) {
      // Return a very large but finite value
      return this.mean + 10 * Math.sqrt(this.variance);
    }

    // Inverse: x = λ * (-ln(1-p))^(1/k)
    return this.scale * Math.pow(-Math.log(1 - p), 1 / this.shape);
  }

  /**
   * Mean of the distribution
   *
   * @returns λ * Γ(1 + 1/k)
   */
  get mean(): number {
    return this.scale * this.gamma(1 + 1 / this.shape);
  }

  /**
   * Variance of the distribution
   *
   * @returns λ² * [Γ(1 + 2/k) - Γ²(1 + 1/k)]
   */
  get variance(): number {
    const gamma1Plus1OverK = this.gamma(1 + 1 / this.shape);
    const gamma1Plus2OverK = this.gamma(1 + 2 / this.shape);

    return this.scale * this.scale * (gamma1Plus2OverK - gamma1Plus1OverK * gamma1Plus1OverK);
  }

  /**
   * Validates distribution parameters
   *
   * @returns true if parameters are valid
   * @throws {Error} If parameters are invalid
   */
  validateParameters(): boolean {
    if (this.shape <= 0) {
      throw new Error('Shape must be positive');
    }
    if (this.scale <= 0) {
      throw new Error('Scale must be positive');
    }
    if (!isFinite(this.shape) || !isFinite(this.scale)) {
      throw new Error('Parameters must be finite numbers');
    }
    return true;
  }

  /**
   * Gamma function implementation using Lanczos approximation
   *
   * @param z - Input value
   * @returns Gamma(z)
   */
  private gamma(z: number): number {
    // For small integers, use factorial
    if (z === 1) return 1;
    if (z === 2) return 1;
    if (z === 3) return 2;
    if (z === 4) return 6;

    // Lanczos approximation coefficients for g = 7
    const coef = [
      0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
      -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
      1.5056327351493116e-7,
    ];

    if (z < 0.5) {
      // Use reflection formula: Γ(z)Γ(1-z) = π/sin(πz)
      return Math.PI / (Math.sin(Math.PI * z) * this.gamma(1 - z));
    }

    z -= 1;
    let x = coef[0];
    for (let i = 1; i < coef.length; i++) {
      x += coef[i] / (z + i);
    }

    const t = z + 7.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
  }
}
