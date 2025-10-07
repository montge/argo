import { Distribution, RandomNumberGenerator } from '../types/Distribution';
import { erf, erfInv } from '../utils/erfUtils';

/**
 * Normal (Gaussian) distribution
 *
 * The normal distribution is a continuous probability distribution characterized by
 * a bell-shaped curve. It is defined by two parameters: mean (μ) and standard
 * deviation (σ).
 *
 * PDF: f(x) = (1 / (σ√(2π))) * exp(-((x-μ)²) / (2σ²))
 * CDF: Φ(x) = (1/2) * (1 + erf((x-μ) / (σ√2)))
 *
 * @example
 * ```typescript
 * const rng = new SimpleRNG(42);
 * const dist = new NormalDistribution(100, 15);
 *
 * // Generate a sample
 * const sample = dist.sample(rng);  // ~100
 *
 * // Calculate PDF at x=100
 * const density = dist.pdf(100);  // Maximum density at mean
 *
 * // Calculate probability of X <= 115
 * const prob = dist.cdf(115);  // ~0.8413 (1 std dev above mean)
 * ```
 */
export class NormalDistribution implements Distribution {
  public readonly name = 'Normal';

  /**
   * Create a normal distribution
   * @param mean Mean (μ) of the distribution
   * @param stddev Standard deviation (σ) of the distribution (must be > 0)
   */
  constructor(
    public readonly mean: number,
    public readonly stddev: number
  ) {
    this.validateParameters();
  }

  /**
   * Generate a random sample from this normal distribution
   * Uses Box-Muller transform for standard normal, then scales
   */
  sample(rng: RandomNumberGenerator): number {
    // Box-Muller transform to generate standard normal
    const u1 = rng.next();
    const u2 = rng.next();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

    // Scale to desired mean and stddev
    return this.mean + this.stddev * z;
  }

  /**
   * Probability density function
   * f(x) = (1 / (σ√(2π))) * exp(-((x-μ)²) / (2σ²))
   */
  pdf(x: number): number {
    const coefficient = 1 / (this.stddev * Math.sqrt(2 * Math.PI));
    const exponent = -Math.pow(x - this.mean, 2) / (2 * Math.pow(this.stddev, 2));
    return coefficient * Math.exp(exponent);
  }

  /**
   * Cumulative distribution function
   * Φ(x) = (1/2) * (1 + erf((x-μ) / (σ√2)))
   */
  cdf(x: number): number {
    return 0.5 * (1 + erf((x - this.mean) / (this.stddev * Math.sqrt(2))));
  }

  /**
   * Inverse cumulative distribution function (quantile function)
   * Φ⁻¹(p) = μ + σ√2 * erf⁻¹(2p - 1)
   */
  inverseCDF(p: number): number {
    if (p < 0 || p > 1) {
      throw new Error('Probability must be between 0 and 1');
    }

    if (p === 0) return -Infinity;
    if (p === 1) return Infinity;
    if (p === 0.5) return this.mean;

    return this.mean + this.stddev * Math.sqrt(2) * erfInv(2 * p - 1);
  }

  /**
   * Validate distribution parameters
   * @throws Error if parameters are invalid
   */
  validateParameters(): boolean {
    if (this.stddev <= 0) {
      throw new Error('Standard deviation must be positive');
    }
    if (!isFinite(this.mean)) {
      throw new Error('Mean must be finite');
    }
    if (!isFinite(this.stddev)) {
      throw new Error('Standard deviation must be finite');
    }
    return true;
  }
}
