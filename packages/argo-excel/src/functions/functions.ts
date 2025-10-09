/**
 * Argo Custom Functions for Excel
 *
 * All 14 distributions available as Excel formulas
 * Usage: =ARGO.NORMAL(100, 15)
 */

import {
  NormalDistribution,
  UniformDistribution,
  TriangularDistribution,
  LogNormalDistribution,
  ExponentialDistribution,
  BetaDistribution,
  GammaDistribution,
  WeibullDistribution,
  ParetoDistribution,
  PERTDistribution,
  BinomialDistribution,
  PoissonDistribution,
  GeometricDistribution,
  HypergeometricDistribution,
  SimpleRNG
} from '@argo/core';

// Initialize RNG (volatile - recalculates on each refresh)
const rng = new SimpleRNG(Date.now());

/** @customfunction */
export function ARGONORMAL(mean: number, stddev: number): number {
  const dist = new NormalDistribution(mean, stddev);
  return dist.sample(rng);
}

/** @customfunction */
export function ARGOUNIFORM(min: number, max: number): number {
  const dist = new UniformDistribution(min, max);
  return dist.sample(rng);
}

/** @customfunction */
export function ARGOTRIANGULAR(min: number, mode: number, max: number): number {
  const dist = new TriangularDistribution(min, mode, max);
  return dist.sample(rng);
}

/** @customfunction */
export function ARGOLOGNORMAL(mu: number, sigma: number): number {
  const dist = new LogNormalDistribution(mu, sigma);
  return dist.sample(rng);
}

/** @customfunction */
export function ARGOEXPONENTIAL(lambda: number): number {
  const dist = new ExponentialDistribution(lambda);
  return dist.sample(rng);
}

/** @customfunction */
export function ARGOBETA(alpha: number, beta: number): number {
  const dist = new BetaDistribution(alpha, beta);
  return dist.sample(rng);
}

/** @customfunction */
export function ARGOGAMMA(shape: number, scale: number): number {
  const dist = new GammaDistribution(shape, scale);
  return dist.sample(rng);
}

/** @customfunction */
export function ARGOWEIBULL(shape: number, scale: number): number {
  const dist = new WeibullDistribution(shape, scale);
  return dist.sample(rng);
}

/** @customfunction */
export function ARGOPARETO(shape: number, scale: number): number {
  const dist = new ParetoDistribution(shape, scale);
  return dist.sample(rng);
}

/** @customfunction */
export function ARGOPERT(min: number, mode: number, max: number): number {
  const dist = new PERTDistribution(min, mode, max);
  return dist.sample(rng);
}

/** @customfunction */
export function ARGOBINOMIAL(n: number, p: number): number {
  const dist = new BinomialDistribution(n, p);
  return dist.sample(rng);
}

/** @customfunction */
export function ARGOPOISSON(lambda: number): number {
  const dist = new PoissonDistribution(lambda);
  return dist.sample(rng);
}

/** @customfunction */
export function ARGOGEOMETRIC(p: number): number {
  const dist = new GeometricDistribution(p);
  return dist.sample(rng);
}

/** @customfunction */
export function ARGOHYPERGEOMETRIC(N: number, K: number, n: number): number {
  const dist = new HypergeometricDistribution(N, K, n);
  return dist.sample(rng);
}

// Register with Office.js
if (typeof Office !== 'undefined') {
  Office.onReady(() => {
    console.log('Argo: 14 custom functions registered');
  });
}
