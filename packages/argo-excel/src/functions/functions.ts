/**
 * Argo Custom Functions for Excel
 *
 * These functions provide Monte Carlo simulation capabilities
 * directly in Excel formulas.
 */

import { NormalDistribution, UniformDistribution, TriangularDistribution, SimpleRNG } from '@argo/core';

// Initialize RNG (can be seeded for reproducibility)
const rng = new SimpleRNG(Date.now());

/**
 * Generates a random sample from a Normal distribution
 * @customfunction ARGO.NORMAL
 * @param mean The mean of the distribution
 * @param stddev The standard deviation of the distribution
 * @returns A random sample from the Normal distribution
 */
export function normal(mean: number, stddev: number): number {
  const dist = new NormalDistribution(mean, stddev);
  return dist.sample(rng);
}

/**
 * Generates a random sample from a Uniform distribution
 * @customfunction ARGO.UNIFORM
 * @param min The minimum value
 * @param max The maximum value
 * @returns A random sample from the Uniform distribution
 */
export function uniform(min: number, max: number): number {
  const dist = new UniformDistribution(min, max);
  return dist.sample(rng);
}

/**
 * Generates a random sample from a Triangular distribution
 * @customfunction ARGO.TRIANGULAR
 * @param min The minimum value
 * @param mode The most likely value
 * @param max The maximum value
 * @returns A random sample from the Triangular distribution
 */
export function triangular(min: number, mode: number, max: number): number {
  const dist = new TriangularDistribution(min, mode, max);
  return dist.sample(rng);
}

// Register custom functions with Office.js
if (typeof Office !== 'undefined') {
  Office.onReady(() => {
    // Custom functions are auto-registered via manifest
    console.log('Argo custom functions loaded');
  });
}
