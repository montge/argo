# Upgrade deprecated npm dependencies

## Summary
Multiple dependencies are deprecated and should be upgraded to maintain long-term project health.

## Expected Behavior
All dependencies should be on supported, non-deprecated versions.

## Actual Behavior
The following deprecated packages are in use:

### Critical (No Longer Supported)
| Package | Current | Status | Replacement |
|---------|---------|--------|-------------|
| `eslint` | 8.57.1 | EOL | Upgrade to ESLint 9.x |
| `rimraf` | <4.0.0 | Deprecated | Upgrade to v5.x |
| `glob` | 7.2.3 | No longer supported | Upgrade to v11.x |

### Low Priority
| Package | Current | Replacement |
|---------|---------|-------------|
| `inflight` | 1.0.6 | Use `lru-cache` or native Promise patterns |
| `domexception` | 4.0.0 | Use platform native `DOMException` |
| `abab` | 2.0.6 | Use platform native `atob()`/`btoa()` |
| `@humanwhocodes/object-schema` | 2.0.3 | Use `@eslint/object-schema` |
| `@humanwhocodes/config-array` | 0.13.0 | Use `@eslint/config-array` |

## Proposed Solution

### Phase 1: ESLint 9 Upgrade
1. Update `.eslintrc.json` to flat config format
2. Upgrade `eslint` to 9.x
3. Update all `eslint-*` plugins
4. Test linting across all packages

**Breaking Changes Expected:** Config format change

### Phase 2: Utility Upgrades
1. Replace `rimraf` with `fs.rm(path, { recursive: true })` or upgrade to v5
2. Replace `glob` with native `fs.glob()` (Node 22+) or upgrade to v11
3. These have minimal breaking changes

### Phase 3: Transitive Dependencies
1. Check if `inflight`, `domexception`, `abab` can be removed by upgrading parent packages
2. If direct dependencies, replace with native alternatives

## Priority
**MEDIUM** - Technical debt, affects long-term maintainability

## Labels
`dependencies`, `maintenance`, `enhancement`

## Notes
- ESLint 8 reaches EOL soon - prioritize this upgrade
- Some deprecated packages are transitive (fixed by parent upgrades)
- Consider using `npm-check-updates` to identify all outdated packages
