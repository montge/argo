# Branch coverage below 80% target in @argo/excel package (64.44%)

## Summary
The `@argo/excel` package has branch coverage of only 64.44%, with App.tsx having critically low branch coverage of 40.74%.

## Steps to Reproduce
```bash
cd packages/argo-excel
npm run test:coverage
```

## Expected Behavior
Branch coverage should be at least 80% for all packages.

## Actual Behavior
Current coverage:
- **Statements:** 89.5% ⚠️
- **Branch:** 64.44% ❌ (16 points below target)
- **Functions:** 94.87% ✅
- **Lines:** 89.2% ⚠️

### Critical File
| File | Branch Coverage | Lines Uncovered |
|------|-----------------|-----------------|
| `App.tsx` | 40.74% | 73-99, 249 |

## Root Cause
Missing test cases for UI state transitions, error handling, and Office.js integration scenarios in the main App component.

## Proposed Solution
Add test cases for:

1. **State Transitions:**
   - Distribution selection changes
   - Parameter updates
   - Simulation running state changes
   - Tab switching between Simulation/Results/Settings

2. **Error Scenarios:**
   - Office.js API failures
   - Excel range access errors
   - Simulation errors
   - Invalid parameter inputs

3. **Edge Cases:**
   - Empty simulation results
   - Very large datasets (>50k iterations)
   - Correlation matrix edge cases
   - Lines 73-99: Office.js initialization failures
   - Line 249: Error recovery paths

## Priority
**CRITICAL** - Main application component below 50% branch coverage

## Labels
`bug`, `testing`, `code-quality`, `react`
