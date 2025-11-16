# Low test coverage in intervals.ts (71.91%)

## Summary
The `packages/argo-core/src/stats/intervals.ts` file has only 71.91% line coverage, falling below the 80% module-level target.

## Steps to Reproduce
```bash
cd packages/argo-core
npm run test:coverage
```

## Expected Behavior
All core modules should have at least 80% coverage.

## Actual Behavior
`intervals.ts` coverage:
- **Statements:** 71.91% ❌
- **Branch:** 71.87% ❌
- **Functions:** 87.5% ✅
- **Lines:** 72.61% ❌

**Uncovered Lines:** 39-65, 78, 115-123

## Proposed Solution
Add test cases for:

1. **Lines 39-65:** Confidence interval calculations for edge cases
   - Very small sample sizes (n < 5)
   - Extreme confidence levels (99.9%, 99.99%)
   - Invalid inputs (negative confidence level, empty array)

2. **Line 78:** Error handling path (likely an error throw)

3. **Lines 115-123:** Sample size calculations
   - Edge cases for margin of error
   - Invalid parameters
   - Extreme values

## Priority
**HIGH** - Core statistical function below coverage target

## Labels
`enhancement`, `testing`, `statistics`
