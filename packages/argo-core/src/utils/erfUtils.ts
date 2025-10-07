/**
 * Approximation of the error function (erf)
 * Using Abramowitz and Stegun approximation (maximum error: 1.5e-7)
 */
export function erf(x: number): number {
  // Save the sign of x
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);

  // Constants
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  // A&S formula 7.1.26
  const t = 1 / (1 + p * x);
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

/**
 * Complementary error function
 */
export function erfc(x: number): number {
  return 1 - erf(x);
}

/**
 * Inverse error function
 * Using Newton's method with rational approximation as initial guess
 */
export function erfInv(x: number): number {
  if (x < -1 || x > 1) {
    throw new Error('erfInv: argument must be between -1 and 1');
  }

  if (x === 0) return 0;
  if (x === 1) return Infinity;
  if (x === -1) return -Infinity;

  // Initial guess using rational approximation
  const a = 0.147;
  const b = 2 / (Math.PI * a) + Math.log(1 - x * x) / 2;
  const sqrt1 = Math.sqrt(b * b - Math.log(1 - x * x) / a);
  const sqrt2 = Math.sqrt(sqrt1 - b);

  let y = (x >= 0 ? 1 : -1) * sqrt2;

  // Refine with Newton's method (2 iterations usually sufficient)
  for (let i = 0; i < 2; i++) {
    const err = erf(y) - x;
    y -= err / (2 / Math.sqrt(Math.PI) * Math.exp(-y * y));
  }

  return y;
}
