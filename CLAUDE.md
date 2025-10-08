# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Argo v5.0** is a Monte Carlo simulation add-in for Microsoft Excel (Office 365), rebuilt from scratch using modern web technologies (TypeScript, React, Office.js). This is a **modern rebuild** - the original Argo (v1.0 through v4.3.1) was built for Excel 2007-2016 using .NET technologies that are not suitable for modern Office 365, and this project recreates it using AI assistance based on available documentation.

**Key Technologies:**
- TypeScript 5.x with strict type checking
- npm workspaces monorepo structure
- Jest for testing (TDD approach)
- Office.js for Excel integration (future)
- React 18+ for UI (future)

## Development Commands

### Testing (Primary Workflow)
```bash
# TDD watch mode - use this during development
npm run test:watch

# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Build all packages
npm run build
```

### Linting and Formatting
```bash
# Lint (currently allows warnings)
npm run lint

# Format code with Prettier
npm run format

# Check formatting without changes
npm run format:check
```

### Working with Monorepo
```bash
# Install dependencies (run after cloning or pulling)
npm install

# Clean all build artifacts and node_modules
npm run clean

# Run commands in specific package
cd packages/argo-core && npm test
```

## Project Architecture

### Monorepo Structure
This is an **npm workspaces monorepo** with three planned packages:

```
packages/
├── argo-core/          # Core simulation engine & distributions (CURRENT FOCUS)
├── argo-cli/           # Command-line tool (planned - Phase 2)
└── argo-excel/         # Office.js Excel add-in (planned - Phase 3)
```

### Current Package: argo-core

**Location:** `packages/argo-core/`

**Structure:**
```
src/
├── distributions/       # Probability distributions (Normal, Uniform, Triangular, etc.)
├── types/              # TypeScript interfaces (Distribution, etc.)
└── utils/              # Helper utilities (SimpleRNG, erfUtils)

tests/
├── distributions/      # Distribution test suites
└── utils/              # Utility test suites
```

**Key Files:**
- `src/types/Distribution.ts` - Core interface that all distributions implement
- `src/utils/SimpleRNG.ts` - Seeded random number generator for reproducibility
- `src/distributions/*.ts` - Individual distribution implementations
- `tests/**/*.test.ts` - Jest test suites

### Test-Driven Development (TDD)

**This project strictly follows TDD.** All code must be written test-first:

1. **Red:** Write failing tests first
2. **Green:** Implement minimal code to pass tests
3. **Refactor:** Improve code while keeping tests passing

**Test Requirements:**
- Target 97%+ coverage (branches, functions, lines, statements)
- Achieved: 97.28% statements, 90.67% branches with 504 tests (as of Sprint 2)
- Note: Remaining uncovered lines are defensive code paths that are mathematically unreachable with valid parameters
- Minimum acceptable: 95% coverage
- Tests written BEFORE implementation
- Each distribution requires comprehensive tests (see existing tests as examples)
- Tests verify: parameter validation, sampling accuracy, PDF/CDF correctness, edge cases

**Test File Location:** `packages/argo-core/tests/` (mirrors `src/` structure)

**Example TDD Workflow:**
```bash
# 1. Start watch mode
npm run test:watch

# 2. Create test file first: tests/distributions/NewDistribution.test.ts
# 3. Write tests (they will fail - Red)
# 4. Implement: src/distributions/NewDistribution.ts (Green)
# 5. Export from src/index.ts
# 6. Verify coverage with npm run test:coverage
```

## Key Interfaces

### Distribution Interface
Located in `src/types/Distribution.ts`:

```typescript
interface Distribution {
  sample(rng: RandomNumberGenerator): number;  // Generate random sample
  pdf(x: number): number;                      // Probability density function
  cdf(x: number): number;                      // Cumulative distribution
  inverseCDF(p: number): number;               // Quantile function
  mean: number;                                // Distribution mean
  variance: number;                            // Distribution variance
}
```

**All distributions must:**
1. Implement this interface
2. Validate parameters in constructor (throw descriptive errors)
3. Support seeded RNG for reproducibility
4. Have getter properties for `mean` and `variance`

### RandomNumberGenerator Interface
```typescript
interface RandomNumberGenerator {
  next(): number;        // Returns [0, 1)
  setSeed(seed: number): void;
}
```

Implementation: `SimpleRNG` class (George Marsaglia's MWC algorithm)

## Adding a New Distribution

**Follow this exact sequence (TDD):**

1. **Write test file first** (before any implementation):
   - Create `tests/distributions/YourDistribution.test.ts`
   - Reference existing tests (Normal, Uniform, Triangular) for structure
   - Include tests for: constructor validation, sampling, PDF, CDF, inverseCDF, statistical properties

2. **Implement distribution**:
   - Create `src/distributions/YourDistribution.ts`
   - Implement `Distribution` interface
   - Validate parameters in constructor
   - Implement all required methods

3. **Export from index**:
   - Add export to `src/index.ts`

4. **Verify**:
   ```bash
   npm run test:coverage  # Must be ≥80%
   npm run build          # Must compile without errors
   ```

5. **Commit with conventional format**:
   ```bash
   git commit -m "feat(core): implement YourDistribution with comprehensive TDD"
   ```

## CI/CD and Workflows

**GitHub Actions run on every push:**
- `ci.yml` - Builds and tests on Node 18.x and 20.x
- `coverage.yml` - Reports coverage to Codecov
- `tdd-check.yml` - Validates TDD practices (tests exist before implementation)
- `status-badge.yml` - Updates README badges

**All checks must pass before merging to main branches.**

## Branch Strategy

- `master` - Main branch (production releases)
- `office365-linux-rebuild` - Current development branch
- Feature branches: `feature/description` (create from current dev branch)

**When creating PRs:** Target the `office365-linux-rebuild` branch (not master)

## Code Style

- **TypeScript strict mode enabled** - all files must type check
- **ESLint + Prettier configured** - run `npm run format` before committing
- **No console.log in production code** - use proper error handling
- **JSDoc comments required for public APIs**

## Performance Expectations

**Current targets (reference for new distributions):**
- Sampling rate: ≥5 million samples/second
- 10,000 iteration simulation: <1 second
- Test suite execution: <10 seconds

## Documentation Structure

Important docs in `docs/`:
- `REQUIREMENTS.md` - Functional requirements (FR-###)
- `ARCHITECTURE.md` - Technical architecture details
- `COLLABORATION.md` - Multi-developer TDD workflow (400+ lines)
- `TEST_CASES.md` - Test case traceability matrix
- `ROADMAP.md` - Development roadmap with sprint planning

**ROADMAP.md tracks:**
- Completed distributions (Normal, Uniform, Triangular ✅)
- Current sprint tasks (Sprint 1: Basic Distributions)
- Next tasks: Log-Normal, Exponential distributions

## Common Issues

### "Module not found" errors
```bash
npm install  # Re-install dependencies
```

### Tests failing after pull
```bash
npm run clean
npm install
npm test
```

### Coverage below 80%
- Add more test cases for edge cases
- Test error conditions (invalid parameters)
- Reference existing test files for coverage patterns

## Git Commit Convention

Format: `<type>(<scope>): <description>`

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `test` - Test additions/changes
- `refactor` - Code refactoring
- `docs` - Documentation updates
- `chore` - Maintenance tasks

**Scopes:** `core`, `cli`, `excel`, `docs`

**Examples:**
```
feat(core): implement Triangular Distribution with comprehensive TDD
test(core): add edge cases for Normal Distribution
docs: update ROADMAP.md - TC-008 Triangular Distribution complete
```

## Important Notes for AI Assistants

1. **Always follow TDD** - Write tests before implementation, no exceptions
2. **Reference existing code** - Look at Normal/Uniform/Triangular distributions as templates
3. **Check ROADMAP.md** - See current sprint tasks and next priorities
4. **Verify coverage** - Run `npm run test:coverage` after any implementation
5. **Monorepo aware** - Commands run at root execute for all packages
6. **TypeScript strict** - All code must pass strict type checking
7. **No shortcuts** - Comprehensive tests required (20-35 tests per distribution typical)

## Current Development Status

**Phase 1: Core Library (argo-core) - IN PROGRESS**

**Completed:**
- ✅ Normal Distribution (18 tests, 100% coverage)
- ✅ Uniform Distribution (26 tests, 100% coverage)
- ✅ Triangular Distribution (34 tests, 100% coverage)
- ✅ CI/CD with GitHub Actions
- ✅ Jest + TypeScript infrastructure

**Next (Sprint 1):**
- Log-Normal Distribution (TC-009)
- Exponential Distribution (TC-010)

**Future Phases:**
- Phase 2: CLI tool (argo-cli)
- Phase 3: Excel add-in (argo-excel)
- Phase 4: PM integrations (Project 365, JIRA, Primavera P6)

See `ROADMAP.md` for detailed sprint planning and task tracking.
