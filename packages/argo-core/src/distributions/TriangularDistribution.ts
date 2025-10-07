import { Distribution, RandomNumberGenerator } from '../types/Distribution';

/**
 * Triangular distribution
 *
 * The triangular distribution is a continuous probability distribution defined by three parameters:
 * minimum (a), maximum (b), and mode (c), where a ≤ c ≤ b.
 *
 * It is commonly used in project management and risk analysis when only limited sample data is available.
 * The distribution is often used to model expert opinions about the minimum, most likely, and maximum
 * values of a variable.
 *
 * PDF:
 * - f(x) = 2(x-a)/((b-a)(c-a)) for a ≤ x < c
 * - f(x) = 2(b-x)/((b-a)(b-c)) for c ≤ x ≤ b
 * - f(x) = 0 otherwise
 *
 * CDF:
 * - F(x) = 0 for x < a
 * - F(x) = (x-a)²/((b-a)(c-a)) for a ≤ x < c
 * - F(x) = 1 - (b-x)²/((b-a)(b-c)) for c ≤ x ≤ b
 * - F(x) = 1 for x > b
 *
 * @example
 * ```typescript
 * const rng = new SimpleRNG(42);
 * const dist = new TriangularDistribution(0, 5, 10);
 *
 * // Generate a sample
 * const sample = dist.sample(rng);  // Random value in [0, 10] clustered around 5
 *
 * // Calculate PDF at mode (peak of distribution)
 * const density = dist.pdf(5);  // 0.2 (maximum density)
 *
 * // Calculate probability of X <= 5
 * const prob = dist.cdf(5);  // 0.5 (50%)
 * ```
 */
export class TriangularDistribution implements Distribution {
  public readonly name = 'Triangular';

  /**
   * Create a triangular distribution
   * @param min Minimum value (a)
   * @param mode Most likely value (c) - where PDF is maximum
   * @param max Maximum value (b)
   */
  constructor(
    public readonly min: number,
    public readonly mode: number,
    public readonly max: number
  ) {
    this.validateParameters();
  }

  /**
   * Generate a random sample from this triangular distribution
   * Uses inverse transform sampling
   */
  sample(rng: RandomNumberGenerator): number {
    const u = rng.next();

    // Calculate F(mode) = (mode - min) / (max - min)
    const fc = (this.mode - this.min) / (this.max - this.min);

    if (u < fc) {
      // Sample from left side (min to mode)
      return this.min + Math.sqrt(u * (this.max - this.min) * (this.mode - this.min));
    } else {
      // Sample from right side (mode to max)
      return this.max - Math.sqrt((1 - u) * (this.max - this.min) * (this.max - this.mode));
    }
  }

  /**
   * Probability density function
   * f(x) = 2(x-a)/((b-a)(c-a)) for a ≤ x < c
   * f(x) = 2(b-x)/((b-a)(b-c)) for c ≤ x ≤ b
   * f(x) = 0 otherwise
   */
  pdf(x: number): number {
    if (x < this.min || x > this.max) {
      return 0;
    }

    if (x < this.mode) {
      // Left side: ascending slope
      return (2 * (x - this.min)) / ((this.max - this.min) * (this.mode - this.min));
    } else if (x > this.mode) {
      // Right side: descending slope
      return (2 * (this.max - x)) / ((this.max - this.min) * (this.max - this.mode));
    } else {
      // At mode: maximum density = 2/(b-a)
      return 2 / (this.max - this.min);
    }
  }

  /**
   * Cumulative distribution function
   * F(x) = 0 for x < a
   * F(x) = (x-a)²/((b-a)(c-a)) for a ≤ x < c
   * F(x) = 1 - (b-x)²/((b-a)(b-c)) for c ≤ x ≤ b
   * F(x) = 1 for x > b
   */
  cdf(x: number): number {
    if (x < this.min) {
      return 0;
    }
    if (x >= this.max) {
      return 1;
    }

    if (x < this.mode) {
      // Left side
      return Math.pow(x - this.min, 2) / ((this.max - this.min) * (this.mode - this.min));
    } else if (x > this.mode) {
      // Right side
      return 1 - Math.pow(this.max - x, 2) / ((this.max - this.min) * (this.max - this.mode));
    } else {
      // At mode: F(c) = (c-a)/(b-a)
      return (this.mode - this.min) / (this.max - this.min);
    }
  }

  /**
   * Inverse cumulative distribution function (quantile function)
   * Used for generating random samples via transformation
   *
   * For p < F(c):
   *   F^(-1)(p) = a + sqrt(p * (b-a) * (c-a))
   * For p >= F(c):
   *   F^(-1)(p) = b - sqrt((1-p) * (b-a) * (b-c))
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

    // Calculate F(mode) = (mode - min) / (max - min)
    const fc = (this.mode - this.min) / (this.max - this.min);

    if (p < fc) {
      // Left side
      return this.min + Math.sqrt(p * (this.max - this.min) * (this.mode - this.min));
    } else {
      // Right side
      return this.max - Math.sqrt((1 - p) * (this.max - this.min) * (this.max - this.mode));
    }
  }

  /**
   * Validate distribution parameters
   * @throws Error if parameters are invalid
   */
  validateParameters(): boolean {
    if (!isFinite(this.min) || !isFinite(this.mode) || !isFinite(this.max)) {
      throw new Error('min, mode, and max must be finite');
    }
    if (this.min >= this.max) {
      throw new Error('max must be greater than min');
    }
    if (this.mode < this.min || this.mode > this.max) {
      throw new Error('mode must be between min and max');
    }
    return true;
  }
}
