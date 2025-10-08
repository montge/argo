import { Distribution, RandomNumberGenerator } from '../types/Distribution';

/**
 * Gamma Distribution
 *
 * A continuous probability distribution with two parameters: shape (k or α)
 * and rate (θ or β). This implementation uses shape-rate parameterization.
 *
 * Properties:
 * - Support: [0, ∞)
 * - Parameters: shape (k) > 0, rate (θ) > 0
 * - Mean: k/θ
 * - Variance: k/θ²
 * - Mode: (k-1)/θ for k ≥ 1
 *
 * Common Uses:
 * - Modeling waiting times and inter-arrival times
 * - Reliability engineering (time to failure)
 * - Queuing theory
 * - Bayesian inference (conjugate prior for Poisson rate)
 * - Financial modeling (aggregate loss models)
 *
 * Special Cases:
 * - Gamma(1, λ) = Exponential(λ)
 * - Gamma(n/2, 1/2) = Chi-squared distribution with n degrees of freedom
 * - For large k, Gamma approaches Normal distribution
 *
 * Relationships:
 * - Sum of k independent Exponential(θ) ~ Gamma(k, θ)
 * - If X~Gamma(α,1) and Y~Gamma(β,1), then X/(X+Y) ~ Beta(α,β)
 *
 * @example
 * ```typescript
 * const rng = new SimpleRNG(42);
 * const dist = new GammaDistribution(2, 0.5);
 * const sample = dist.sample(rng); // Returns value in [0, ∞)
 * ```
 */
export class GammaDistribution implements Distribution {
  /**
   * Distribution name
   */
  public readonly name = 'Gamma';

  /**
   * Shape parameter (k or α > 0)
   */
  public readonly shape: number;

  /**
   * Rate parameter (θ or β > 0)
   * Note: Some sources use scale = 1/rate
   */
  public readonly rate: number;

  /**
   * Creates a Gamma distribution
   *
   * @param shape - Shape parameter k (must be > 0)
   * @param rate - Rate parameter θ (must be > 0)
   * @throws {Error} If shape or rate is not positive
   */
  constructor(shape: number, rate: number) {
    if (!isFinite(shape) || !isFinite(rate)) {
      throw new Error('Parameters must be finite numbers');
    }
    if (shape <= 0) {
      throw new Error('Shape must be positive');
    }
    if (rate <= 0) {
      throw new Error('Rate must be positive');
    }

    this.shape = shape;
    this.rate = rate;
  }

  /**
   * Generates a random sample from the Gamma distribution
   *
   * Uses Marsaglia and Tsang's method for shape >= 1
   * and Ahrens-Dieter acceptance-rejection for shape < 1
   *
   * @param rng - Random number generator
   * @returns A random sample from the Gamma distribution [0, ∞)
   */
  sample(rng: RandomNumberGenerator): number {
    let gammaShape1: number;

    if (this.shape >= 1) {
      // Marsaglia and Tsang's Method for shape >= 1
      const d = this.shape - 1 / 3;
      const c = 1 / Math.sqrt(9 * d);

      while (true) {
        let x: number;
        let v: number;

        do {
          x = this.sampleNormal(rng);
          v = 1 + c * x;
        } while (v <= 0);

        v = v * v * v;
        const u = rng.next();
        const x2 = x * x;

        if (u < 1 - 0.0331 * x2 * x2) {
          gammaShape1 = d * v;
          break;
        }

        if (Math.log(u) < 0.5 * x2 + d * (1 - v + Math.log(v))) {
          gammaShape1 = d * v;
          break;
        }
      }
    } else {
      // For shape < 1, use rejection method
      // Generate Gamma(shape + 1) and then transform
      const gamma = this.sampleGammaHelper(this.shape + 1, rng);
      gammaShape1 = gamma * Math.pow(rng.next(), 1 / this.shape);
    }

    // Scale by rate parameter
    return gammaShape1 / this.rate;
  }

  /**
   * Helper method to generate Gamma-distributed samples for shape >= 1
   * Used recursively for shape < 1 case
   *
   * @param shape - Shape parameter (must be >= 1)
   * @param rng - Random number generator
   * @returns Gamma-distributed random variable with rate = 1
   */
  private sampleGammaHelper(shape: number, rng: RandomNumberGenerator): number {
    const d = shape - 1 / 3;
    const c = 1 / Math.sqrt(9 * d);

    while (true) {
      let x: number;
      let v: number;

      do {
        x = this.sampleNormal(rng);
        v = 1 + c * x;
      } while (v <= 0);

      v = v * v * v;
      const u = rng.next();
      const x2 = x * x;

      if (u < 1 - 0.0331 * x2 * x2) {
        return d * v;
      }

      if (Math.log(u) < 0.5 * x2 + d * (1 - v + Math.log(v))) {
        return d * v;
      }
    }
  }

  /**
   * Helper method to generate standard normal samples
   * Uses Box-Muller transform
   *
   * @param rng - Random number generator
   * @returns Standard normal random variable
   */
  private sampleNormal(rng: RandomNumberGenerator): number {
    const u1 = rng.next();
    const u2 = rng.next();

    const r = Math.sqrt(-2 * Math.log(u1));
    const theta = 2 * Math.PI * u2;

    return r * Math.cos(theta);
  }

  /**
   * Probability density function
   *
   * PDF(x) = (θ^k / Γ(k)) * x^(k-1) * e^(-θx)
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
        return this.rate;
      } else {
        return Infinity;
      }
    }

    // Use log-space for numerical stability
    const logPdf =
      this.shape * Math.log(this.rate) +
      (this.shape - 1) * Math.log(x) -
      this.rate * x -
      this.logGamma(this.shape);

    return Math.exp(logPdf);
  }

  /**
   * Cumulative distribution function
   *
   * CDF(x) = P(X ≤ x) = γ(k, θx) / Γ(k)
   * where γ is the lower incomplete gamma function
   *
   * @param x - Value to evaluate
   * @returns Cumulative probability up to x
   */
  cdf(x: number): number {
    if (x <= 0) {
      return 0;
    }

    // Use regularized lower incomplete gamma function
    return this.regularizedGammaP(this.shape, this.rate * x);
  }

  /**
   * Inverse cumulative distribution function (quantile function)
   *
   * Uses Newton-Raphson iteration to find x such that CDF(x) = p
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
      return this.mean + 20 * Math.sqrt(this.variance);
    }

    // Initial guess using mean and variance
    let x = Math.max(this.mean, 0.1);

    // Newton-Raphson method
    const tolerance = 1e-10;
    const maxIterations = 100;

    for (let i = 0; i < maxIterations; i++) {
      const cdfValue = this.cdf(x);
      const pdfValue = this.pdf(x);

      if (pdfValue === 0) {
        break;
      }

      const error = cdfValue - p;
      if (Math.abs(error) < tolerance) {
        return x;
      }

      // Newton-Raphson update
      x = x - error / pdfValue;

      // Keep x positive
      x = Math.max(1e-10, x);
    }

    return x;
  }

  /**
   * Mean of the distribution
   *
   * @returns k/θ
   */
  get mean(): number {
    return this.shape / this.rate;
  }

  /**
   * Variance of the distribution
   *
   * @returns k/θ²
   */
  get variance(): number {
    return this.shape / (this.rate * this.rate);
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
    if (this.rate <= 0) {
      throw new Error('Rate must be positive');
    }
    if (!isFinite(this.shape) || !isFinite(this.rate)) {
      throw new Error('Parameters must be finite numbers');
    }
    return true;
  }

  /**
   * Logarithm of the gamma function using Lanczos approximation
   *
   * @param z - Input value
   * @returns Natural logarithm of Gamma(z)
   */
  private logGamma(z: number): number {
    // Lanczos coefficients for g = 7
    const coef = [
      0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
      -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
      1.5056327351493116e-7,
    ];

    if (z < 0.5) {
      // Use reflection formula: Γ(z)Γ(1-z) = π/sin(πz)
      return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - this.logGamma(1 - z);
    }

    z -= 1;
    let x = coef[0];
    for (let i = 1; i < coef.length; i++) {
      x += coef[i] / (z + i);
    }

    const t = z + 7.5;
    return Math.log(Math.sqrt(2 * Math.PI)) + Math.log(x) - t + (z + 0.5) * Math.log(t);
  }

  /**
   * Regularized lower incomplete gamma function P(a,x) = γ(a,x)/Γ(a)
   * Uses series expansion for small x and continued fraction for large x
   *
   * @param a - Shape parameter
   * @param x - Upper limit of integration
   * @returns P(a,x)
   */
  private regularizedGammaP(a: number, x: number): number {
    if (x < 0 || a <= 0) {
      throw new Error('Invalid parameters for incomplete gamma');
    }

    if (x === 0) {
      return 0;
    }

    if (x < a + 1) {
      // Use series representation
      return this.gammaSeries(a, x);
    } else {
      // Use continued fraction representation
      return 1 - this.gammaContinuedFraction(a, x);
    }
  }

  /**
   * Series expansion for lower incomplete gamma function
   * Used when x < a + 1
   *
   * @param a - Shape parameter
   * @param x - Value
   * @returns Series approximation
   */
  private gammaSeries(a: number, x: number): number {
    const maxIterations = 200;
    const epsilon = 3e-7;

    let sum = 1 / a;
    let term = 1 / a;

    for (let n = 1; n <= maxIterations; n++) {
      term *= x / (a + n);
      sum += term;

      if (Math.abs(term) < Math.abs(sum) * epsilon) {
        break;
      }
    }

    // Return P(a,x) = [x^a * e^(-x) * sum] / Γ(a)
    return sum * Math.exp(-x + a * Math.log(x) - this.logGamma(a));
  }

  /**
   * Continued fraction for upper incomplete gamma function
   * Used when x >= a + 1
   *
   * @param a - Shape parameter
   * @param x - Value
   * @returns Q(a,x) = 1 - P(a,x)
   */
  private gammaContinuedFraction(a: number, x: number): number {
    const maxIterations = 200;
    const epsilon = 3e-7;

    let b = x + 1 - a;
    let c = 1 / 1e-30;
    let d = 1 / b;
    let h = d;

    for (let i = 1; i <= maxIterations; i++) {
      const an = -i * (i - a);
      b += 2;
      d = an * d + b;

      if (Math.abs(d) < 1e-30) {
        d = 1e-30;
      }

      c = b + an / c;
      if (Math.abs(c) < 1e-30) {
        c = 1e-30;
      }

      d = 1 / d;
      const del = d * c;
      h *= del;

      if (Math.abs(del - 1) < epsilon) {
        break;
      }
    }

    // Return Q(a,x) = [x^a * e^(-x) * h] / Γ(a)
    return h * Math.exp(-x + a * Math.log(x) - this.logGamma(a));
  }
}
