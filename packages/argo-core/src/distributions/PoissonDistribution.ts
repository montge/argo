import { Distribution, RandomNumberGenerator } from '../types/Distribution';

/**
 * Poisson Distribution
 *
 * A discrete probability distribution expressing the probability of a given number
 * of events occurring in a fixed interval of time or space, assuming events occur
 * independently at a constant average rate.
 *
 * Properties:
 * - Support: {0, 1, 2, 3, ...} (non-negative integers)
 * - Parameter: λ (lambda, rate parameter, λ > 0)
 * - Mean: λ
 * - Variance: λ (variance equals mean!)
 * - Mode: floor(λ) or floor(λ) - 1
 *
 * Common Uses:
 * - Count of events in time/space (customer arrivals, defects, accidents)
 * - Rare events (earthquakes, insurance claims)
 * - Network traffic modeling
 * - Call center arrivals
 * - Radioactive decay
 *
 * Properties:
 * - Memoryless: Events in non-overlapping intervals are independent
 * - Sum property: Sum of independent Poisson variables is Poisson
 * - Limiting case: Binomial(n, p) → Poisson(np) as n→∞, p→0
 * - Normal approximation: For large λ, Poisson(λ) ≈ Normal(λ, λ)
 *
 * Sampling Algorithm:
 * - For λ < 30: Knuth's method (direct generation)
 * - For λ ≥ 30: Transformed rejection method (faster for large λ)
 *
 * @example
 * ```typescript
 * const rng = new SimpleRNG(42);
 * // Average 5 customers per hour
 * const dist = new PoissonDistribution(5);
 * const arrivals = dist.sample(rng); // Number of customers this hour
 * console.log(`${arrivals} customers arrived`);
 * console.log(`Expected: ${dist.mean} customers`); // 5
 * console.log(`P(exactly 5) = ${dist.pmf(5).toFixed(3)}`); // ~0.175
 * ```
 */
export class PoissonDistribution implements Distribution {
  /**
   * Distribution name
   */
  public readonly name = 'Poisson';

  /**
   * Rate parameter (average number of events)
   */
  public readonly lambda: number;

  /**
   * Creates a Poisson distribution
   *
   * @param lambda - Rate parameter (must be > 0)
   * @throws {Error} If lambda is not positive
   */
  constructor(lambda: number) {
    if (!isFinite(lambda)) {
      throw new Error('Lambda must be a finite number');
    }
    if (lambda <= 0) {
      throw new Error('Lambda must be positive');
    }

    this.lambda = lambda;
  }

  /**
   * Generates a random sample from the Poisson distribution
   *
   * Uses Knuth's method for small λ and transformed rejection for large λ.
   *
   * @param rng - Random number generator
   * @returns Number of events (non-negative integer)
   */
  sample(rng: RandomNumberGenerator): number {
    if (this.lambda < 30) {
      // Knuth's method for small lambda
      return this.sampleKnuth(rng);
    } else {
      // Transformed rejection method for large lambda (more efficient)
      return this.sampleTransformedRejection(rng);
    }
  }

  /**
   * Knuth's method for generating Poisson random variables
   *
   * Generate exponential inter-arrival times until their sum exceeds 1.
   * Works well for small λ but becomes inefficient for large λ.
   *
   * @param rng - Random number generator
   * @returns Poisson random variable
   */
  private sampleKnuth(rng: RandomNumberGenerator): number {
    const L = Math.exp(-this.lambda);
    let k = 0;
    let p = 1;

    do {
      k++;
      p *= rng.next();
    } while (p > L);

    return k - 1;
  }

  /**
   * Ratio-of-uniforms method for large lambda
   *
   * More efficient than Knuth's method for λ ≥ 30.
   * Based on simple rejection sampling with normal approximation.
   *
   * @param rng - Random number generator
   * @returns Poisson random variable
   */
  private sampleTransformedRejection(rng: RandomNumberGenerator): number {
    // For large λ, use normal approximation with acceptance/rejection
    // Poisson(λ) ≈ Normal(λ, λ)
    const sqrtLambda = Math.sqrt(this.lambda);

    while (true) {
      // Box-Muller transform for normal random variable
      const u1 = rng.next();
      const u2 = rng.next();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

      // Transform to Poisson candidate
      const k = Math.floor(this.lambda + sqrtLambda * z + 0.5);

      if (k >= 0) {
        // Accept/reject based on exact Poisson probability
        // This ensures correctness while using normal as proposal
        const acceptProb = this.pmf(k) / this.normalApprox(k);

        if (rng.next() <= acceptProb) {
          return k;
        }
      }
    }
  }

  /**
   * Normal approximation density for acceptance/rejection
   *
   * @param k - Value to evaluate
   * @returns Approximate density
   */
  private normalApprox(k: number): number {
    const sqrtLambda = Math.sqrt(this.lambda);
    const z = (k - this.lambda) / sqrtLambda;
    return Math.exp(-0.5 * z * z) / (sqrtLambda * Math.sqrt(2 * Math.PI));
  }

  /**
   * Probability mass function (PMF)
   *
   * PMF(k) = (λ^k × e^(-λ)) / k!
   *
   * @param k - Number of events
   * @returns Probability of exactly k events
   */
  pmf(k: number): number {
    if (!Number.isInteger(k) || k < 0) {
      return 0;
    }

    // Use log-space to avoid overflow for large k or λ
    // log(PMF) = k*log(λ) - λ - log(k!)
    const logProb = k * Math.log(this.lambda) - this.lambda - this.logFactorial(k);
    return Math.exp(logProb);
  }

  /**
   * Cumulative distribution function (CDF)
   *
   * CDF(k) = P(X ≤ k) = Σ(i=0 to k) PMF(i)
   *
   * For efficiency, uses regularized incomplete gamma function:
   * CDF(k) = 1 - (Γ(k+1, λ) / Γ(k+1))
   *
   * @param k - Value to evaluate
   * @returns Probability that X ≤ k
   */
  cdf(k: number): number {
    if (k < 0) {
      return 0;
    }

    // Use integer floor for non-integer k
    const kInt = Math.floor(k);

    // Sum PMF values (simple but accurate for moderate k)
    let sum = 0;
    for (let i = 0; i <= kInt; i++) {
      sum += this.pmf(i);
      if (sum >= 1) {
        return 1; // Early exit for numerical stability
      }
    }

    return Math.min(sum, 1);
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
      // Return a very large but reasonable value
      return Math.ceil(this.lambda + 10 * Math.sqrt(this.lambda));
    }

    // Linear search starting from a good initial guess
    let k = 0;

    // For lambda >= 1, start near the expected value for efficiency
    if (this.lambda >= 1) {
      k = Math.max(0, Math.floor(this.lambda));
    }

    let cumulative = this.cdf(k);

    if (cumulative >= prob) {
      // Search backward
      while (k > 0) {
        const prevCum = this.cdf(k - 1);
        if (prevCum < prob) {
          return k;
        }
        k--;
      }
      return 0;
    } else {
      // Search forward
      while (cumulative < prob) {
        k++;
        cumulative = this.cdf(k);
      }
      return k;
    }
  }

  /**
   * Mean of the distribution
   *
   * @returns λ
   */
  get mean(): number {
    return this.lambda;
  }

  /**
   * Variance of the distribution
   *
   * Unique property: variance equals mean for Poisson distribution
   *
   * @returns λ
   */
  get variance(): number {
    return this.lambda;
  }

  /**
   * Validates distribution parameters
   *
   * @returns true if parameters are valid
   * @throws {Error} If parameters are invalid
   */
  validateParameters(): boolean {
    if (!isFinite(this.lambda)) {
      throw new Error('Lambda must be a finite number');
    }
    if (this.lambda <= 0) {
      throw new Error('Lambda must be positive');
    }
    return true;
  }

  /**
   * Calculates natural logarithm of factorial
   *
   * log(n!) = log(Γ(n+1)) for non-negative integers
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
  pdf(_x: number): number {
    // Discrete distributions don't have a PDF, use PMF instead
    return 0;
  }
}
