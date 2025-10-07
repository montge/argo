import { Distribution, RandomNumberGenerator } from '../types/Distribution';
import { erf, erfInv } from '../utils/erfUtils';

/**
 * Log-Normal distribution
 *
 * The log-normal distribution is a continuous probability distribution of a random
 * variable whose logarithm is normally distributed. It is characterized by two
 * parameters: mu (μ) and sigma (σ), which are the mean and standard deviation of
 * the variable's natural logarithm.
 *
 * If X ~ LogNormal(μ, σ), then ln(X) ~ Normal(μ, σ)
 *
 * PDF: f(x) = (1 / (xσ√(2π))) * exp(-((ln(x)-μ)²) / (2σ²)) for x > 0
 * CDF: Φ((ln(x)-μ) / σ) where Φ is the standard normal CDF
 *
 * Mean: exp(μ + σ²/2)
 * Variance: (exp(σ²) - 1) * exp(2μ + σ²)
 *
 * @example
 * ```typescript
 * const rng = new SimpleRNG(42);
 * const dist = new LogNormalDistribution(0, 1);  // Standard log-normal
 *
 * // Generate a sample (always positive)
 * const sample = dist.sample(rng);  // ~1.65 (median = e^μ = 1)
 *
 * // Calculate PDF at x=2
 * const density = dist.pdf(2);
 *
 * // Calculate probability of X <= 5
 * const prob = dist.cdf(5);
 * ```
 */
export class LogNormalDistribution implements Distribution {
  public readonly name = 'LogNormal';

  /**
   * Create a log-normal distribution
   * @param mu Mean (μ) of the underlying normal distribution (can be any real number)
   * @param sigma Standard deviation (σ) of the underlying normal distribution (must be > 0)
   */
  constructor(
    public readonly mu: number,
    public readonly sigma: number
  ) {
    this.validateParameters();
  }

  /**
   * Generate a random sample from this log-normal distribution
   * Uses Box-Muller transform to generate standard normal, then transforms to log-normal
   */
  sample(rng: RandomNumberGenerator): number {
    // Generate standard normal using Box-Muller transform
    const u1 = rng.next();
    const u2 = rng.next();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

    // Transform to log-normal: X = exp(μ + σ*Z)
    return Math.exp(this.mu + this.sigma * z);
  }

  /**
   * Probability density function
   * f(x) = (1 / (xσ√(2π))) * exp(-((ln(x)-μ)²) / (2σ²)) for x > 0
   */
  pdf(x: number): number {
    if (x <= 0) return 0;

    const logX = Math.log(x);
    const coefficient = 1 / (x * this.sigma * Math.sqrt(2 * Math.PI));
    const exponent = -Math.pow(logX - this.mu, 2) / (2 * Math.pow(this.sigma, 2));
    return coefficient * Math.exp(exponent);
  }

  /**
   * Cumulative distribution function
   * CDF(x) = Φ((ln(x) - μ) / σ) where Φ is the standard normal CDF
   */
  cdf(x: number): number {
    if (x <= 0) return 0;

    const logX = Math.log(x);
    return 0.5 * (1 + erf((logX - this.mu) / (this.sigma * Math.sqrt(2))));
  }

  /**
   * Inverse cumulative distribution function (quantile function)
   * InverseCDF(p) = exp(μ + σ√2 * erf⁻¹(2p - 1))
   */
  inverseCDF(p: number): number {
    if (p <= 0 || p >= 1) {
      throw new Error('Probability must be in (0, 1)');
    }

    if (p === 0.5) return Math.exp(this.mu);

    // Use inverse of normal distribution on log scale
    return Math.exp(this.mu + this.sigma * Math.sqrt(2) * erfInv(2 * p - 1));
  }

  /**
   * Mean of the log-normal distribution
   * Mean = exp(μ + σ²/2)
   */
  get mean(): number {
    return Math.exp(this.mu + (this.sigma * this.sigma) / 2);
  }

  /**
   * Variance of the log-normal distribution
   * Variance = (exp(σ²) - 1) * exp(2μ + σ²)
   */
  get variance(): number {
    return (
      (Math.exp(this.sigma * this.sigma) - 1) * Math.exp(2 * this.mu + this.sigma * this.sigma)
    );
  }

  /**
   * Validate distribution parameters
   * @throws Error if parameters are invalid
   */
  validateParameters(): boolean {
    if (this.sigma <= 0) {
      throw new Error('Sigma must be positive');
    }
    if (!isFinite(this.mu)) {
      throw new Error('Mu must be finite');
    }
    if (!isFinite(this.sigma)) {
      throw new Error('Sigma must be finite');
    }
    return true;
  }
}
