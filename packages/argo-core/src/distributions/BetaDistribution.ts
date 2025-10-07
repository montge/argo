import { Distribution, RandomNumberGenerator } from '../types/Distribution';

/**
 * Beta Distribution
 *
 * A continuous probability distribution defined on the interval [0, 1]
 * parameterized by two positive shape parameters, alpha (α) and beta (β).
 *
 * Properties:
 * - Support: [0, 1]
 * - Parameters: α > 0, β > 0
 * - Mean: α/(α+β)
 * - Variance: αβ/[(α+β)²(α+β+1)]
 * - Mode: (α-1)/(α+β-2) for α>1, β>1
 *
 * Common Uses:
 * - Modeling probabilities and proportions
 * - Bayesian inference (conjugate prior for Bernoulli/binomial)
 * - Project management (PERT distribution uses Beta)
 * - Reliability engineering
 *
 * Special Cases:
 * - Beta(1,1) = Uniform(0,1)
 * - Beta(α,β) symmetric when α = β
 *
 * @example
 * ```typescript
 * const rng = new SimpleRNG(42);
 * const dist = new BetaDistribution(2, 5);
 * const sample = dist.sample(rng); // Returns value in [0, 1]
 * ```
 */
export class BetaDistribution implements Distribution {
  /**
   * Distribution name
   */
  public readonly name = 'Beta';

  /**
   * Shape parameter alpha (α > 0)
   */
  public readonly alpha: number;

  /**
   * Shape parameter beta (β > 0)
   */
  public readonly beta: number;

  /**
   * Creates a Beta distribution
   *
   * @param alpha - Shape parameter α (must be > 0)
   * @param beta - Shape parameter β (must be > 0)
   * @throws {Error} If alpha or beta is not positive
   */
  constructor(alpha: number, beta: number) {
    if (alpha <= 0) {
      throw new Error('Alpha must be positive');
    }
    if (beta <= 0) {
      throw new Error('Beta must be positive');
    }

    this.alpha = alpha;
    this.beta = beta;
  }

  /**
   * Generates a random sample from the Beta distribution
   *
   * Uses the relationship: If X~Gamma(α,1) and Y~Gamma(β,1),
   * then X/(X+Y) ~ Beta(α,β)
   *
   * @param rng - Random number generator
   * @returns A random sample from the Beta distribution [0, 1]
   */
  sample(rng: RandomNumberGenerator): number {
    // Generate two gamma-distributed random variables
    const x = this.sampleGamma(this.alpha, rng);
    const y = this.sampleGamma(this.beta, rng);

    // Beta sample is the ratio
    return x / (x + y);
  }

  /**
   * Helper method to generate Gamma-distributed samples
   * Uses Marsaglia and Tsang's method for α >= 1
   * and Ahrens-Dieter acceptance-rejection for α < 1
   *
   * @param shape - Shape parameter (α)
   * @param rng - Random number generator
   * @returns Gamma-distributed random variable
   */
  private sampleGamma(shape: number, rng: RandomNumberGenerator): number {
    if (shape >= 1) {
      // Marsaglia and Tsang's Method
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
    } else {
      // For shape < 1, use rejection method
      // Generate Gamma(shape + 1) and then transform
      const gamma = this.sampleGamma(shape + 1, rng);
      return gamma * Math.pow(rng.next(), 1 / shape);
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
   * PDF(x) = x^(α-1) * (1-x)^(β-1) / B(α,β)
   * where B(α,β) is the beta function
   *
   * @param x - Value to evaluate
   * @returns Probability density at x
   */
  pdf(x: number): number {
    if (x < 0 || x > 1) {
      return 0;
    }

    if (x === 0) {
      return this.alpha > 1 ? 0 : this.alpha === 1 ? this.beta : Infinity;
    }

    if (x === 1) {
      return this.beta > 1 ? 0 : this.beta === 1 ? this.alpha : Infinity;
    }

    // Use log-space for numerical stability
    const logPdf =
      (this.alpha - 1) * Math.log(x) +
      (this.beta - 1) * Math.log(1 - x) -
      this.logBeta(this.alpha, this.beta);

    return Math.exp(logPdf);
  }

  /**
   * Cumulative distribution function
   *
   * CDF(x) = I_x(α,β) where I is the regularized incomplete beta function
   *
   * @param x - Value to evaluate
   * @returns Cumulative probability up to x
   */
  cdf(x: number): number {
    if (x <= 0) {
      return 0;
    }
    if (x >= 1) {
      return 1;
    }

    return this.regularizedIncompleteBeta(x, this.alpha, this.beta);
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
      return 1;
    }

    // Special case for uniform distribution
    if (this.alpha === 1 && this.beta === 1) {
      return p;
    }

    // Use Newton-Raphson method
    let x = this.mean; // Initial guess at mean
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

      // Keep x in valid range
      x = Math.max(1e-10, Math.min(1 - 1e-10, x));
    }

    return x;
  }

  /**
   * Mean of the distribution
   *
   * @returns α/(α+β)
   */
  get mean(): number {
    return this.alpha / (this.alpha + this.beta);
  }

  /**
   * Variance of the distribution
   *
   * @returns αβ/[(α+β)²(α+β+1)]
   */
  get variance(): number {
    const sum = this.alpha + this.beta;
    return (this.alpha * this.beta) / (sum * sum * (sum + 1));
  }

  /**
   * Validates distribution parameters
   *
   * @returns true if parameters are valid
   * @throws {Error} If parameters are invalid
   */
  validateParameters(): boolean {
    if (this.alpha <= 0) {
      throw new Error('Alpha must be positive');
    }
    if (this.beta <= 0) {
      throw new Error('Beta must be positive');
    }
    if (!isFinite(this.alpha) || !isFinite(this.beta)) {
      throw new Error('Parameters must be finite numbers');
    }
    return true;
  }

  /**
   * Logarithm of the beta function: ln(B(α,β)) = ln(Γ(α)) + ln(Γ(β)) - ln(Γ(α+β))
   *
   * @param a - First parameter
   * @param b - Second parameter
   * @returns Natural logarithm of beta function
   */
  private logBeta(a: number, b: number): number {
    return this.logGamma(a) + this.logGamma(b) - this.logGamma(a + b);
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
      0.99999999999980993, 676.5203681218851, -1259.1392167224028,
      771.32342877765313, -176.61502916214059, 12.507343278686905,
      -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
    ];

    if (z < 0.5) {
      // Use reflection formula: Γ(z)Γ(1-z) = π/sin(πz)
      return (
        Math.log(Math.PI) -
        Math.log(Math.sin(Math.PI * z)) -
        this.logGamma(1 - z)
      );
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
   * Regularized incomplete beta function I_x(a,b)
   * Uses continued fraction expansion
   *
   * @param x - Upper limit of integration
   * @param a - First parameter
   * @param b - Second parameter
   * @returns I_x(a,b)
   */
  private regularizedIncompleteBeta(x: number, a: number, b: number): number {
    if (x === 0) {
      return 0;
    }
    if (x === 1) {
      return 1;
    }

    // Use symmetry relation if needed for better convergence
    if (x > (a + 1) / (a + b + 2)) {
      return 1 - this.regularizedIncompleteBeta(1 - x, b, a);
    }

    // Compute using continued fraction
    const logBetaAB = this.logBeta(a, b);
    const front =
      Math.exp(
        Math.log(x) * a + Math.log(1 - x) * b - logBetaAB
      ) / a;

    return front * this.betaContinuedFraction(x, a, b);
  }

  /**
   * Continued fraction for incomplete beta function
   *
   * @param x - Point of evaluation
   * @param a - First parameter
   * @param b - Second parameter
   * @returns Continued fraction value
   */
  private betaContinuedFraction(x: number, a: number, b: number): number {
    const maxIterations = 200;
    const epsilon = 3e-7;

    const qab = a + b;
    const qap = a + 1;
    const qam = a - 1;
    let c = 1;
    let d = 1 - (qab * x) / qap;

    if (Math.abs(d) < 1e-30) {
      d = 1e-30;
    }
    d = 1 / d;
    let h = d;

    for (let m = 1; m <= maxIterations; m++) {
      const m2 = 2 * m;
      let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
      d = 1 + aa * d;

      if (Math.abs(d) < 1e-30) {
        d = 1e-30;
      }
      c = 1 + aa / c;
      if (Math.abs(c) < 1e-30) {
        c = 1e-30;
      }
      d = 1 / d;
      h *= d * c;

      aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
      d = 1 + aa * d;
      if (Math.abs(d) < 1e-30) {
        d = 1e-30;
      }
      c = 1 + aa / c;
      if (Math.abs(c) < 1e-30) {
        c = 1e-30;
      }
      d = 1 / d;
      const del = d * c;
      h *= del;

      if (Math.abs(del - 1) < epsilon) {
        return h;
      }
    }

    return h;
  }
}
