import { Distribution, RandomNumberGenerator } from '../types/Distribution';

/**
 * Binomial Distribution
 *
 * A discrete probability distribution representing the number of successes
 * in n independent Bernoulli trials, each with success probability p.
 *
 * Properties:
 * - Support: {0, 1, 2, ..., n}
 * - Parameters: n (number of trials, positive integer), p (success probability, [0,1])
 * - Mean: n × p
 * - Variance: n × p × (1-p)
 * - Mode: floor((n+1)p) for most cases
 *
 * Common Uses:
 * - Quality control (number of defective items)
 * - A/B testing (number of conversions)
 * - Clinical trials (number of successful treatments)
 * - Coin flips, dice rolls (number of specific outcomes)
 * - Survey responses (number of "yes" answers)
 *
 * Special Cases:
 * - n=1: Bernoulli distribution
 * - Large n, small p: Approximates Poisson(λ=np)
 * - Large n, moderate p: Approximates Normal(μ=np, σ²=np(1-p))
 *
 * Sampling Algorithm:
 * - For small n: Direct simulation of n Bernoulli trials
 * - For large n: Uses inversion method with optimizations
 *
 * @example
 * ```typescript
 * const rng = new SimpleRNG(42);
 * // Flip 10 coins, probability of heads = 0.5
 * const dist = new BinomialDistribution(10, 0.5);
 * const heads = dist.sample(rng); // Number of heads (0-10)
 * console.log(`Got ${heads} heads out of 10 flips`);
 * console.log(`Expected: ${dist.mean} heads`); // 5
 * console.log(`P(exactly 5 heads) = ${dist.pmf(5).toFixed(3)}`); // ~0.246
 * ```
 */
export class BinomialDistribution implements Distribution {
  /**
   * Distribution name
   */
  public readonly name = 'Binomial';

  /**
   * Number of trials
   */
  public readonly n: number;

  /**
   * Success probability
   */
  public readonly p: number;

  /**
   * Creates a Binomial distribution
   *
   * @param n - Number of independent trials (must be positive integer)
   * @param p - Probability of success on each trial (must be in [0, 1])
   * @throws {Error} If parameters are invalid
   */
  constructor(n: number, p: number) {
    if (!isFinite(n) || !isFinite(p)) {
      throw new Error('Parameters must be finite numbers');
    }
    if (n <= 0 || !Number.isInteger(n)) {
      throw new Error('n must be a positive integer');
    }
    if (p < 0 || p > 1) {
      throw new Error('p must be in [0, 1]');
    }

    this.n = n;
    this.p = p;
  }

  /**
   * Generates a random sample from the Binomial distribution
   *
   * Uses direct Bernoulli simulation for efficiency.
   * Each trial is independent with success probability p.
   *
   * @param rng - Random number generator
   * @returns Number of successes (integer in [0, n])
   */
  sample(rng: RandomNumberGenerator): number {
    // Direct method: simulate n Bernoulli trials
    let successes = 0;
    for (let i = 0; i < this.n; i++) {
      if (rng.next() < this.p) {
        successes++;
      }
    }
    return successes;
  }

  /**
   * Probability mass function (PMF)
   *
   * PMF(k) = C(n,k) × p^k × (1-p)^(n-k)
   * where C(n,k) = n! / (k! × (n-k)!)
   *
   * @param k - Number of successes
   * @returns Probability of exactly k successes
   */
  pmf(k: number): number {
    // Handle non-integer or out-of-range k
    if (!Number.isInteger(k) || k < 0 || k > this.n) {
      return 0;
    }

    // Edge cases
    if (this.p === 0) {
      return k === 0 ? 1 : 0;
    }
    if (this.p === 1) {
      return k === this.n ? 1 : 0;
    }

    // Calculate log of PMF to avoid overflow for large n
    // log(PMF) = log(C(n,k)) + k*log(p) + (n-k)*log(1-p)
    const logBinomCoeff = this.logBinomialCoefficient(this.n, k);
    const logProb = logBinomCoeff + k * Math.log(this.p) + (this.n - k) * Math.log(1 - this.p);

    return Math.exp(logProb);
  }

  /**
   * Cumulative distribution function (CDF)
   *
   * CDF(k) = P(X ≤ k) = Σ(i=0 to k) PMF(i)
   *
   * @param k - Value to evaluate
   * @returns Probability that X ≤ k
   */
  cdf(k: number): number {
    if (k < 0) {
      return 0;
    }
    if (k >= this.n) {
      return 1;
    }

    // Use integer floor for non-integer k
    const kInt = Math.floor(k);

    // Sum PMF values
    let sum = 0;
    for (let i = 0; i <= kInt; i++) {
      sum += this.pmf(i);
    }

    return Math.min(sum, 1); // Clamp to 1 for numerical stability
  }

  /**
   * Inverse cumulative distribution function (quantile function)
   *
   * Returns smallest k such that CDF(k) ≥ p
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
      return 0;
    }
    if (prob === 1) {
      return this.n;
    }

    // Linear search from 0 to n
    // Could optimize with binary search, but linear is fine for moderate n
    let cumulative = 0;
    for (let k = 0; k <= this.n; k++) {
      cumulative += this.pmf(k);
      if (cumulative >= prob) {
        return k;
      }
    }

    return this.n; // Fallback (should not reach here)
  }

  /**
   * Mean of the distribution
   *
   * @returns n × p
   */
  get mean(): number {
    return this.n * this.p;
  }

  /**
   * Variance of the distribution
   *
   * @returns n × p × (1-p)
   */
  get variance(): number {
    return this.n * this.p * (1 - this.p);
  }

  /**
   * Validates distribution parameters
   *
   * @returns true if parameters are valid
   * @throws {Error} If parameters are invalid
   */
  validateParameters(): boolean {
    if (this.n <= 0 || !Number.isInteger(this.n)) {
      throw new Error('n must be a positive integer');
    }
    if (this.p < 0 || this.p > 1) {
      throw new Error('p must be in [0, 1]');
    }
    if (!isFinite(this.n) || !isFinite(this.p)) {
      throw new Error('Parameters must be finite numbers');
    }
    return true;
  }

  /**
   * Calculates log of binomial coefficient C(n, k) = n! / (k! × (n-k)!)
   *
   * Uses log-gamma function to avoid overflow for large factorials.
   *
   * @param n - Total items
   * @param k - Items chosen
   * @returns log(C(n, k))
   */
  private logBinomialCoefficient(n: number, k: number): number {
    if (k === 0 || k === n) {
      return 0; // C(n,0) = C(n,n) = 1, log(1) = 0
    }

    // Use log-gamma: log(C(n,k)) = log(Γ(n+1)) - log(Γ(k+1)) - log(Γ(n-k+1))
    return this.logGamma(n + 1) - this.logGamma(k + 1) - this.logGamma(n - k + 1);
  }

  /**
   * Calculates natural logarithm of the gamma function
   *
   * Uses Lanczos approximation for numerical stability.
   * For integer n: Γ(n) = (n-1)!, so log(Γ(n)) = log((n-1)!)
   *
   * @param z - Input value
   * @returns log(Γ(z))
   */
  private logGamma(z: number): number {
    // For small integers, use direct factorial calculation
    if (Number.isInteger(z) && z <= 20) {
      let factorial = 1;
      for (let i = 2; i < z; i++) {
        factorial *= i;
      }
      return Math.log(factorial);
    }

    // Lanczos approximation coefficients (g=7, n=9)
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

    const t = z + 7.5; // g + 0.5 where g=7
    return Math.log(Math.sqrt(2 * Math.PI)) + (z + 0.5) * Math.log(t) - t + Math.log(x);
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
