# Build fails on clean install due to workspace dependency ordering

## Summary
Running `npm run build` on a clean checkout fails because `@argo/cli` tries to import `@argo/core` before it's built.

## Steps to Reproduce
1. Clone repository
2. Run `npm install`
3. Run `npm run build`

## Expected Behavior
Build should succeed in a single command, building packages in dependency order.

## Actual Behavior
```
> @argo/cli@5.0.0-alpha.1 build
> tsc

src/commands/simulate.ts(28,8): error TS2307: Cannot find module '@argo/core'
or its corresponding type declarations.
```

## Root Cause
npm workspaces builds packages in parallel, but `@argo/cli` depends on `@argo/core` being built first to have TypeScript declaration files available.

## Proposed Solution

### Option 1: Use npm-run-all (Recommended)
Install `npm-run-all` and update root `package.json`:

```json
{
  "scripts": {
    "build": "npm-run-all build:core build:rest",
    "build:core": "npm run build --workspace=@argo/core",
    "build:rest": "npm run build --workspaces --if-present --ignore=@argo/core"
  },
  "devDependencies": {
    "npm-run-all": "^4.1.5"
  }
}
```

### Option 2: Use Turborepo/Nx
Migrate to a monorepo tool that handles build ordering:
- Turborepo (lightweight)
- Nx (feature-rich)

### Option 3: TypeScript Project References
Use TypeScript's built-in project references with `tsc --build`:

1. Add to `tsconfig.json` in root:
```json
{
  "references": [
    { "path": "./packages/argo-core" },
    { "path": "./packages/argo-cli" },
    { "path": "./packages/argo-excel" }
  ]
}
```

2. Update each package's `tsconfig.json`:
```json
{
  "composite": true,
  "references": [
    { "path": "../argo-core" }  // in argo-cli
  ]
}
```

3. Update build script:
```json
{
  "scripts": {
    "build": "tsc --build"
  }
}
```

## Priority
**HIGH** - Breaks CI/CD and new developer onboarding

## Labels
`bug`, `build`, `monorepo`

## Notes
- **Option 3 (TypeScript Project References)** is the cleanest long-term solution
- Affects CI/CD reliability
- May cause confusion for new contributors
