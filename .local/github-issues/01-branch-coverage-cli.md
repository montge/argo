# Branch coverage below 80% target in @argo/cli package (64.28%)

## Summary
The `@argo/cli` package has branch coverage of only 64.28%, which is significantly below the project's 80% target for module-level coverage.

## Steps to Reproduce
```bash
cd packages/argo-cli
npm run test:coverage
```

## Expected Behavior
Branch coverage should be at least 80% for all packages.

## Actual Behavior
Current coverage:
- **Statements:** 89.72% ✅
- **Branch:** 64.28% ❌ (16 points below target)
- **Functions:** 100% ✅
- **Lines:** 89.65% ⚠️

### Specific Files Below Target
| File | Branch Coverage | Issue |
|------|-----------------|-------|
| `simulate.ts` | 51.72% | Lines 62-98 uncovered |
| `generate.ts` | 71.42% | Lines 32, 42 uncovered |
| `validate.ts` | 84.61% | Lines 41, 50 uncovered |

## Root Cause
Missing test cases for error handling and edge cases, particularly in the `simulate` command's error paths and configuration validation.

## Proposed Solution
1. Add tests for error scenarios in `simulate.ts`:
   - Invalid configuration files
   - Missing required fields
   - Simulation failures
   - File I/O errors
2. Test edge cases in `generate.ts`:
   - Different output formats (JSON vs YAML)
   - File write failures
3. Add validation error tests in `validate.ts`:
   - Schema validation failures
   - Malformed JSON

## Priority
**HIGH** - Blocks quality standards compliance

## Labels
`enhancement`, `testing`, `code-quality`
