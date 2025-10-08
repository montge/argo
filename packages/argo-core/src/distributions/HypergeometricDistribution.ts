import { Distribution, RandomNumberGenerator } from '../types/Distribution';

/**
 * Hypergeometric Distribution
 *
 * A discrete probability distribution describing the number of successes in a
 * sequence of n draws from a finite population of size N containing exactly K
 * successes, WITHOUT replacement.
 *
 * Properties:
 * - Support: {max(0, n+K-N), ..., min(n, K)}
 * - Parameters:
 *   - N: Population size (positive integer)
 *   - K: Number of success states in population (0 ≤ K ≤ N)
 *   - n: Number of draws (0 ≤ n ≤ N)
 * - Mean: n × (K/N)
 * - Variance: n × (K/N) × (1-K/N) × ((N-n)/(N-1))
 * - Mode: floor((n+1)(K+1)/(N+2))
 *
 * Common Uses:
 * - Quality control sampling (defects in batch)
 * - Card games (specific cards in hand)
 * - Lottery probability
 * - Capture-recapture studies
 * - Acceptance sampling
 *
 * Key Difference from Binomial:
 * - Binomial: Sampling WITH replacement (independent trials)
 * - Hypergeometric: Sampling WITHOUT replacement (dependent trials)
 * - For large N relative to n, Hypergeometric ≈ Binomial(n, K/N)
 *
 * Finite Population Correction:
 * - Variance multiplied by (N-n)/(N-1)
 * - Factor approaches 1 as N → ∞
 * - Accounts for dependence between draws
 *
 * Sampling Algorithm:
 * - Direct simulation: Draw n items without replacement
 * - Tracks successes in sample
 *
 * @example
 * ```typescript
 * const rng = new SimpleRNG(42);
 * // Deck of 52 cards, 13 hearts, draw 5 cards
 * const dist = new HypergeometricDistribution(52, 13, 5);
 * const hearts = dist.sample(rng); // Number of hearts in hand
 * console.log(`Drew ${hearts} hearts out of 5 cards`);
 * console.log(`Expected: ${dist.mean.toFixed(2)} hearts`); // 1.25
 * console.log(`P(exactly 2 hearts) = ${dist.pmf(2).toFixed(3)}`);
 * ```
 */
export class HypergeometricDistribution implements Distribution {
  /**
   * Distribution name
   */
  public readonly name = 'Hypergeometric';

  /**
   * Population size
   */
  public readonly N: number;

  /**
   * Number of success states in population
   */
  public readonly K: number;

  /**
   * Number of draws
   */
  public readonly n: number;

  /**
   * Creates a Hypergeometric distribution
   *
   * @param N - Population size (positive integer)
   * @param K - Number of successes in population (0 ≤ K ≤ N)
   * @param n - Number of draws (0 ≤ n ≤ N)
   * @throws {Error} If parameters are invalid
   */
  constructor(N: number, K: number, n: number) {
    if (!isFinite(N) || !isFinite(K) || !isFinite(n)) {
      throw new Error('Parameters must be finite numbers');
    }
    if (
      N <= 0 ||
      K < 0 ||
      n < 0 ||
      !Number.isInteger(N) ||
      !Number.isInteger(K) ||
      !Number.isInteger(n)
    ) {
      throw new Error('N, K, and n must be positive integers');
    }
    if (K > N) {
      throw new Error('K must be <= N');
    }
    if (n > N) {
      throw new Error('n must be <= N');
    }

    this.N = N;
    this.K = K;
    this.n = n;
  }

  /**
   * Generates a random sample from the Hypergeometric distribution
   *
   * Simulates drawing n items from population without replacement.
   *
   * @param rng - Random number generator
   * @returns Number of successes in sample (integer)
   */
  sample(rng: RandomNumberGenerator): number {
    // Edge cases
    if (this.n === 0 || this.K === 0) {
      return 0;
    }
    if (this.K === this.N) {
      return this.n;
    }

    // Direct simulation: draw n items without replacement
    let successes = 0;
    let remaining = this.N;
    let successesRemaining = this.K;

    for (let i = 0; i < this.n; i++) {
      // Probability of drawing a success on this draw
      const prob = successesRemaining / remaining;

      if (rng.next() < prob) {
        successes++;
        successesRemaining--;
      }

      remaining--;
    }

    return successes;
  }

  /**
   * Probability mass function (PMF)
   *
   * PMF(k) = C(K,k) × C(N-K,n-k) / C(N,n)
   *
   * where C(a,b) is the binomial coefficient "a choose b"
   *
   * @param k - Number of successes in sample
   * @returns Probability of exactly k successes
   */
  pmf(k: number): number {
    if (!Number.isInteger(k)) {
      return 0;
    }

    // Valid range: max(0, n+K-N) <= k <= min(n, K)
    const minK = Math.max(0, this.n + this.K - this.N);
    const maxK = Math.min(this.n, this.K);

    if (k < minK || k > maxK) {
      return 0;
    }

    // Edge cases
    if (this.K === 0) {
      return k === 0 ? 1 : 0;
    }
    if (this.n === 0) {
      return k === 0 ? 1 : 0;
    }
    if (this.K === this.N) {
      return k === this.n ? 1 : 0;
    }

    // PMF(k) = C(K,k) × C(N-K,n-k) / C(N,n)
    // Use log space to avoid overflow
    const logNumerator =
      this.logBinomialCoefficient(this.K, k) +
      this.logBinomialCoefficient(this.N - this.K, this.n - k);
    const logDenominator = this.logBinomialCoefficient(this.N, this.n);

    return Math.exp(logNumerator - logDenominator);
  }

  /**
   * Cumulative distribution function (CDF)
   *
   * CDF(k) = P(X ≤ k) = Σ(i=minK to k) PMF(i)
   *
   * @param k - Value to evaluate
   * @returns Probability that X ≤ k
   */
  cdf(k: number): number {
    const minK = Math.max(0, this.n + this.K - this.N);
    const maxK = Math.min(this.n, this.K);

    if (k < minK) {
      return 0;
    }
    if (k >= maxK) {
      return 1;
    }

    // Use integer floor for non-integer k
    const kInt = Math.floor(k);

    // Sum PMF values
    let sum = 0;
    for (let i = minK; i <= kInt; i++) {
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

    const minK = Math.max(0, this.n + this.K - this.N);
    const maxK = Math.min(this.n, this.K);

    if (prob === 0) {
      return minK;
    }
    if (prob === 1) {
      return maxK;
    }

    // Linear search from minK to maxK
    let cumulative = 0;
    for (let k = minK; k <= maxK; k++) {
      cumulative += this.pmf(k);
      if (cumulative >= prob) {
        return k;
      }
    }

    return maxK; // Fallback
  }

  /**
   * Mean of the distribution
   *
   * Expected number of successes in sample.
   *
   * @returns n × (K/N)
   */
  get mean(): number {
    return (this.n * this.K) / this.N;
  }

  /**
   * Variance of the distribution
   *
   * Includes finite population correction factor.
   *
   * @returns n × (K/N) × (1-K/N) × ((N-n)/(N-1))
   */
  get variance(): number {
    if (this.N === 1) {
      return 0; // Avoid division by zero
    }

    const p = this.K / this.N;
    const fpc = (this.N - this.n) / (this.N - 1); // Finite population correction

    return this.n * p * (1 - p) * fpc;
  }

  /**
   * Validates distribution parameters
   *
   * @returns true if parameters are valid
   * @throws {Error} If parameters are invalid
   */
  validateParameters(): boolean {
    if (!isFinite(this.N) || !isFinite(this.K) || !isFinite(this.n)) {
      throw new Error('Parameters must be finite numbers');
    }
    if (this.N <= 0 || this.K < 0 || this.n < 0) {
      throw new Error('N, K, and n must be positive integers');
    }
    if (!Number.isInteger(this.N) || !Number.isInteger(this.K) || !Number.isInteger(this.n)) {
      throw new Error('N, K, and n must be positive integers');
    }
    if (this.K > this.N) {
      throw new Error('K must be <= N');
    }
    if (this.n > this.N) {
      throw new Error('n must be <= N');
    }
    return true;
  }

  /**
   * Calculates log of binomial coefficient C(n, k) = n! / (k! × (n-k)!)
   *
   * Uses log-gamma function to avoid overflow.
   *
   * @param n - Total items
   * @param k - Items chosen
   * @returns log(C(n, k))
   */
  private logBinomialCoefficient(n: number, k: number): number {
    if (k === 0 || k === n) {
      return 0; // C(n,0) = C(n,n) = 1, log(1) = 0
    }
    if (k < 0 || k > n) {
      return -Infinity; // Invalid combination
    }

    // Use log-gamma: log(C(n,k)) = log(Γ(n+1)) - log(Γ(k+1)) - log(Γ(n-k+1))
    return this.logFactorial(n) - this.logFactorial(k) - this.logFactorial(n - k);
  }

  /**
   * Calculates natural logarithm of factorial
   *
   * @param n - Non-negative integer
   * @returns log(n!)
   */
  private logFactorial(n: number): number {
    if (n === 0 || n === 1) {
      return 0;
    }

    // For small n, use direct calculation
    if (n <= 20) {
      let result = 0;
      for (let i = 2; i <= n; i++) {
        result += Math.log(i);
      }
      return result;
    }

    // For larger n, use Stirling's approximation
    // log(n!) ≈ n*log(n) - n + 0.5*log(2πn)
    return n * Math.log(n) - n + 0.5 * Math.log(2 * Math.PI * n);
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
