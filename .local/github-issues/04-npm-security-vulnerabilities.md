# 22 moderate severity npm security vulnerabilities

## Summary
`npm audit` reports 22 moderate severity vulnerabilities, primarily related to js-yaml in Jest dependencies.

## Steps to Reproduce
```bash
npm audit
```

## Expected Behavior
Zero security vulnerabilities in production and development dependencies.

## Actual Behavior
22 moderate severity vulnerabilities detected:

### Affected Packages
| Package | Severity | Via | Fix Available |
|---------|----------|-----|---------------|
| `@istanbuljs/load-nyc-config` | Moderate | js-yaml | Breaking change (Jest 25) |
| `@jest/core` | Moderate | Multiple deps | Breaking change |
| `@jest/reporters` | Moderate | @jest/transform | Breaking change |
| Various Jest packages | Moderate | js-yaml chain | Breaking change |

### Full Audit Report
See `.local/npm-audit.json` for complete details.

## Root Cause
Outdated `js-yaml` dependency (vulnerable version) used transitively by Jest 29.7.

## Proposed Solution

### Option 1: Upgrade Jest (Recommended)
Wait for Jest to update js-yaml dependency or switch to Vitest.

### Option 2: Override Dependency
Use npm overrides in `package.json`:
```json
{
  "overrides": {
    "js-yaml": "^4.1.0"
  }
}
```

### Option 3: Accept Risk
If vulnerabilities are only in test dependencies and tests run in isolated environments, document the accepted risk.

## Investigation Needed
1. Check if js-yaml vulnerability affects test execution
2. Verify if Vitest is a viable alternative
3. Check if Jest 30.x (if available) fixes the issue

## Priority
**HIGH** - Security vulnerability (moderate severity)

## Labels
`security`, `dependencies`, `npm`

## Notes
- Vulnerabilities are in **devDependencies** only (tests), not production code
- Impact is likely low since tests run in controlled environments
- Monitor for Jest updates or consider migration to Vitest
