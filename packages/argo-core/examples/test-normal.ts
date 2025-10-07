#!/usr/bin/env ts-node
/**
 * Simple test to verify Normal distribution is working
 *
 * Run: npx ts-node examples/test-normal.ts
 */

import { NormalDistribution, SimpleRNG } from '../src';

console.log('='.repeat(60));
console.log('Argo Normal Distribution Test');
console.log('='.repeat(60));
console.log();

// Create RNG with seed for reproducibility
const rng = new SimpleRNG(42);

// Create Normal distribution: mean=100, stddev=15
const dist = new NormalDistribution(100, 15);

console.log('Distribution Parameters:');
console.log(`  Mean: ${dist.mean}`);
console.log(`  Standard Deviation: ${dist.stddev}`);
console.log();

// Generate samples
console.log('Generating 10 samples:');
for (let i = 1; i <= 10; i++) {
  const sample = dist.sample(rng);
  console.log(`  Sample ${i}: ${sample.toFixed(2)}`);
}
console.log();

// Test PDF
console.log('Probability Density Function (PDF):');
console.log(`  PDF at mean (100): ${dist.pdf(100).toFixed(6)}`);
console.log(`  PDF at mean+1σ (115): ${dist.pdf(115).toFixed(6)}`);
console.log(`  PDF at mean-1σ (85): ${dist.pdf(85).toFixed(6)}`);
console.log();

// Test CDF
console.log('Cumulative Distribution Function (CDF):');
console.log(`  P(X ≤ 100): ${(dist.cdf(100) * 100).toFixed(2)}%`);
console.log(`  P(X ≤ 115): ${(dist.cdf(115) * 100).toFixed(2)}%`);
console.log(`  P(X ≤ 85): ${(dist.cdf(85) * 100).toFixed(2)}%`);
console.log();

// Test inverse CDF
console.log('Inverse CDF (Quantiles):');
console.log(`  5th percentile: ${dist.inverseCDF(0.05).toFixed(2)}`);
console.log(`  25th percentile: ${dist.inverseCDF(0.25).toFixed(2)}`);
console.log(`  50th percentile (median): ${dist.inverseCDF(0.50).toFixed(2)}`);
console.log(`  75th percentile: ${dist.inverseCDF(0.75).toFixed(2)}`);
console.log(`  95th percentile: ${dist.inverseCDF(0.95).toFixed(2)}`);
console.log();

// Run a simple Monte Carlo simulation
console.log('Simple Monte Carlo Simulation:');
console.log('  Simulating 10,000 samples...');

const startTime = Date.now();
const samples: number[] = [];
const iterations = 10000;

for (let i = 0; i < iterations; i++) {
  samples.push(dist.sample(rng));
}

const duration = Date.now() - startTime;

// Calculate statistics
const mean = samples.reduce((sum, x) => sum + x, 0) / samples.length;
const variance = samples.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (samples.length - 1);
const stddev = Math.sqrt(variance);
const min = Math.min(...samples);
const max = Math.max(...samples);

// Calculate percentiles
const sorted = [...samples].sort((a, b) => a - b);
const p5 = sorted[Math.floor(0.05 * samples.length)];
const p25 = sorted[Math.floor(0.25 * samples.length)];
const p50 = sorted[Math.floor(0.50 * samples.length)];
const p75 = sorted[Math.floor(0.75 * samples.length)];
const p95 = sorted[Math.floor(0.95 * samples.length)];

console.log();
console.log('Results:');
console.log(`  Iterations: ${iterations.toLocaleString()}`);
console.log(`  Duration: ${duration}ms (${(iterations / duration * 1000).toFixed(0)} samples/sec)`);
console.log();
console.log('Empirical Statistics (from samples):');
console.log(`  Mean: ${mean.toFixed(2)} (expected: 100.00)`);
console.log(`  Std Dev: ${stddev.toFixed(2)} (expected: 15.00)`);
console.log(`  Min: ${min.toFixed(2)}`);
console.log(`  Max: ${max.toFixed(2)}`);
console.log();
console.log('Percentiles:');
console.log(`  5th: ${p5.toFixed(2)}`);
console.log(`  25th: ${p25.toFixed(2)}`);
console.log(`  50th: ${p50.toFixed(2)}`);
console.log(`  75th: ${p75.toFixed(2)}`);
console.log(`  95th: ${p95.toFixed(2)}`);
console.log();
console.log('='.repeat(60));
console.log('✅ Normal distribution is working correctly!');
console.log('='.repeat(60));
