import { RandomNumberGenerator } from '../types/Distribution';

/**
 * Simple seedable random number generator using Mulberry32 algorithm
 * https://github.com/bryc/code/blob/master/jshash/PRNGs.md
 */
export class SimpleRNG implements RandomNumberGenerator {
  private state: number;

  /**
   * Create a new RNG with optional seed
   * @param seed Seed value (default: random)
   */
  constructor(seed?: number) {
    this.state = seed !== undefined ? seed >>> 0 : Math.floor(Math.random() * 2 ** 32);
  }

  /**
   * Generate next random number between 0 and 1
   */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generate a random integer between min and max (inclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Generate a standard normal (0, 1) random variable using Box-Muller transform
   */
  nextGaussian(): number {
    let u1: number, u2: number, z: number;
    do {
      u1 = this.next();
      u2 = this.next();
      z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    } while (!isFinite(z));
    return z;
  }

  /**
   * Set the random seed for reproducibility
   * @param seed - Seed value
   */
  setSeed(seed: number): void {
    this.state = seed >>> 0;
  }
}
