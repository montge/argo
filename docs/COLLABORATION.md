# Multi-User Collaboration Guide for Argo

**Version:** 5.0
**Last Updated:** 2025-10-07

This document provides guidelines for multiple developers (including AI assistants like Claude Code) working simultaneously on the Argo project.

---

## Overview

Argo is designed with **modular architecture** to support concurrent development by multiple team members. This guide ensures smooth collaboration and minimal merge conflicts.

---

## 1. Development Principles

### 1.1 Module Independence
- Each core module (distributions, engine, UI, stats) is isolated
- Modules communicate via well-defined TypeScript interfaces
- Changes to one module minimally impact others

### 1.2 Interface-First Development
- Define interfaces before implementation
- Store shared interfaces in `src/types/`
- All modules depend on interfaces, not implementations

### 1.3 Test-Driven Development (TDD)
- **Write tests FIRST, then implement features**
- Red-Green-Refactor cycle:
  1. **Red:** Write failing test
  2. **Green:** Write minimal code to pass test
  3. **Refactor:** Clean up code while keeping tests green
- Tests serve as living documentation
- Tests define expected behavior before implementation

---

## 2. Project Structure for Collaboration

### 2.1 Module Ownership

| Module | Primary Files | Typical Tasks |
|--------|--------------|---------------|
| **Distributions** | `src/distributions/` | Add new probability distributions |
| **Statistics** | `src/stats/` | Add statistical functions |
| **Simulation Engine** | `src/engine/` | Core simulation algorithms |
| **UI Components** | `src/taskpane/` | React components, styling |
| **Excel Integration** | `src/functions/`, `src/utils/excelUtils.ts` | Custom functions, Office.js API |
| **Testing** | `tests/` | Unit, integration, E2E tests |
| **Documentation** | `docs/` | Architecture, API docs, guides |

### 2.2 Shared Resources

**All developers must coordinate changes to:**
- `src/types/` - Shared TypeScript interfaces
- `manifest.xml` - Office Add-in configuration
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript configuration

**Communication Required:**
- Announce changes to shared types in PRs
- Discuss breaking changes before implementing
- Update documentation when interfaces change

---

## 3. Git Workflow

### 3.1 Branch Strategy

```
main (production)
  │
  ├── develop (integration branch)
  │     │
  │     ├── feature/beta-distribution (Developer A)
  │     ├── feature/tornado-chart (Developer B)
  │     ├── feature/correlation-matrix (Developer C)
  │     └── feature/task-pane-ui (Developer D)
  │
  └── hotfix/critical-bug (emergency fixes)
```

### 3.2 Branch Naming Convention

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `refactor/description` - Code refactoring
- `docs/description` - Documentation updates
- `test/description` - Test additions/improvements

**Examples:**
- `feature/add-weibull-distribution`
- `bugfix/correlation-matrix-validation`
- `test/engine-integration-tests`

### 3.3 Commit Message Format

```
<type>(<scope>): <short summary>

<detailed description>

<footer>
```

**Types:** `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

**Examples:**
```
feat(distributions): add Weibull distribution

Implemented Weibull distribution with shape and scale parameters.
Includes PDF, CDF, inverse CDF, and sampling methods.

Closes #42
```

```
test(engine): add correlation matrix validation tests

Added unit tests for:
- Positive semi-definiteness validation
- Symmetric matrix check
- Eigenvalue computation

Part of TDD for correlation engine feature.
```

### 3.4 Pull Request Workflow

1. **Create Feature Branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-feature
   ```

2. **Develop with TDD**
   - Write test first
   - Implement feature
   - Ensure all tests pass locally

3. **Commit Regularly**
   ```bash
   git add .
   git commit -m "test(distributions): add Beta distribution tests"
   git commit -m "feat(distributions): implement Beta distribution"
   ```

4. **Push and Create PR**
   ```bash
   git push origin feature/my-feature
   # Create PR on GitHub targeting 'develop' branch
   ```

5. **Code Review**
   - At least one reviewer approves
   - All CI checks pass
   - No merge conflicts

6. **Merge**
   - Squash and merge (or regular merge)
   - Delete feature branch

---

## 4. Test-Driven Development (TDD) Guidelines

### 4.1 TDD Cycle

**For New Features:**

```
1. Write Test (Red)
   ├── Define expected behavior in test
   ├── Test should fail (feature doesn't exist yet)
   └── Commit: "test: add test for feature X"

2. Implement Feature (Green)
   ├── Write minimal code to pass test
   ├── Test should now pass
   └── Commit: "feat: implement feature X"

3. Refactor (Refactor)
   ├── Clean up code
   ├── Improve performance
   ├── Tests still pass
   └── Commit: "refactor: optimize feature X"
```

**Example: Adding a New Distribution**

```typescript
// Step 1: Write Test (Red)
// tests/unit/distributions/weibull.test.ts
describe('WeibullDistribution', () => {
  it('should generate samples within expected range', () => {
    const dist = new WeibullDistribution(1.5, 2.0);
    const samples = Array.from({ length: 1000 }, () => dist.sample(rng));

    // All samples should be positive
    expect(samples.every(x => x > 0)).toBe(true);

    // Mean should be approximately scale * Gamma(1 + 1/shape)
    const mean = samples.reduce((a, b) => a + b) / samples.length;
    const expectedMean = 2.0 * gamma(1 + 1/1.5);
    expect(mean).toBeCloseTo(expectedMean, 0.2);
  });

  it('should calculate PDF correctly', () => {
    const dist = new WeibullDistribution(2.0, 1.0);
    expect(dist.pdf(1.0)).toBeCloseTo(0.7358, 4);
  });
});

// Step 2: Implement Feature (Green)
// src/distributions/continuous/WeibullDistribution.ts
export class WeibullDistribution implements Distribution {
  constructor(private shape: number, private scale: number) {
    this.validateParameters();
  }

  sample(rng: RandomNumberGenerator): number {
    const u = rng.next();
    return this.scale * Math.pow(-Math.log(1 - u), 1 / this.shape);
  }

  pdf(x: number): number {
    if (x < 0) return 0;
    const k = this.shape;
    const lambda = this.scale;
    return (k / lambda) * Math.pow(x / lambda, k - 1) * Math.exp(-Math.pow(x / lambda, k));
  }

  // ... implement CDF, inverseCDF, validateParameters
}

// Step 3: Run tests, refactor if needed
```

### 4.2 Test Coverage Requirements

- **Minimum Coverage:** 80% overall
- **Critical Modules:** 90%+ coverage
  - Distributions
  - Engine
  - Statistical functions

### 4.3 Test Categories

**Unit Tests (`tests/unit/`)**
- Test individual functions/classes in isolation
- Mock external dependencies
- Fast execution (<1ms per test)

**Integration Tests (`tests/integration/`)**
- Test module interactions
- Use mock Excel API
- Moderate execution time (<100ms per test)

**E2E Tests (`tests/e2e/`)**
- Test complete workflows in real Excel
- Use Playwright
- Slow execution (seconds per test)

### 4.4 Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run tests in watch mode (during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### 4.5 Test Structure Template

```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('ModuleName', () => {
  let instance: ModuleClass;

  beforeEach(() => {
    // Setup: Create fresh instance for each test
    instance = new ModuleClass();
  });

  describe('methodName', () => {
    it('should handle normal case', () => {
      // Arrange
      const input = 42;

      // Act
      const result = instance.methodName(input);

      // Assert
      expect(result).toBe(expected);
    });

    it('should handle edge case', () => {
      // Test edge cases
    });

    it('should throw error for invalid input', () => {
      expect(() => instance.methodName(-1)).toThrow('Invalid input');
    });
  });
});
```

---

## 5. Coordination Strategies

### 5.1 Daily Standup (Async)

Post in team channel:
- What did I work on yesterday?
- What am I working on today?
- Any blockers or dependencies?

### 5.2 Interface Changes

When modifying shared interfaces:
1. Create PR with proposed changes
2. Tag all affected developers for review
3. Update all implementations in same PR
4. Ensure backward compatibility or provide migration guide

### 5.3 Merge Conflict Resolution

**Prevention:**
- Pull from `develop` frequently
- Communicate when working on adjacent code
- Keep PRs small and focused

**Resolution:**
```bash
git checkout develop
git pull origin develop
git checkout feature/my-feature
git merge develop
# Resolve conflicts in editor
git add .
git commit -m "merge: resolve conflicts with develop"
```

---

## 6. Claude Code Collaboration

### 6.1 Multiple Claude Code Instances

**Scenario:** Multiple users with Claude Code working on different features

**Best Practices:**
1. Each Claude instance works on a separate feature branch
2. Clear module assignments prevent conflicts
3. Shared `src/types/` changes coordinated via PRs
4. Each instance runs own tests before pushing

**Workflow:**

```
User A + Claude Code Instance 1
  └── feature/add-gamma-distribution
      ├── TDD: Write tests first
      ├── Implement GammaDistribution class
      └── PR to develop

User B + Claude Code Instance 2
  └── feature/output-histogram-chart
      ├── TDD: Write UI component tests
      ├── Implement HistogramChart component
      └── PR to develop

User C + Claude Code Instance 3
  └── feature/correlation-validation
      ├── TDD: Write validation tests
      ├── Implement matrix validation logic
      └── PR to develop
```

### 6.2 Mock Excel API for Development

Use mock Office.js API for local development:

```typescript
// tests/mocks/office.mock.ts
export const mockExcel = {
  run: async (callback: (context: any) => Promise<void>) => {
    const mockContext = {
      workbook: {
        worksheets: {
          getActiveWorksheet: () => ({
            getRange: (address: string) => ({
              values: [[1, 2, 3]],
              formulas: [['=A1+B1']],
              load: () => {},
            }),
          }),
        },
      },
      sync: async () => {},
    };
    await callback(mockContext);
  },
};
```

Usage in tests:
```typescript
import { mockExcel } from '@tests/mocks/office.mock';

// Test without real Excel
it('should read cell values', async () => {
  await mockExcel.run(async (context) => {
    const range = context.workbook.worksheets.getActiveWorksheet().getRange('A1:C1');
    range.load('values');
    await context.sync();

    expect(range.values[0]).toEqual([1, 2, 3]);
  });
});
```

---

## 7. Code Review Guidelines

### 7.1 Reviewer Checklist

- [ ] Tests written BEFORE implementation (TDD verified)
- [ ] All tests pass locally and in CI
- [ ] Code follows TypeScript/ESLint style guide
- [ ] Public APIs have JSDoc comments
- [ ] No console.log or debug code
- [ ] Performance considerations addressed
- [ ] No obvious security issues
- [ ] Documentation updated if needed

### 7.2 Review Response Time

- **Critical PRs:** Within 4 hours
- **Standard PRs:** Within 24 hours
- **Documentation PRs:** Within 48 hours

### 7.3 Approval Requirements

- At least 1 approval required
- All CI checks must pass
- No unresolved conversations

---

## 8. Continuous Integration (CI)

### 8.1 CI Pipeline

**Triggered on:** Every push to any branch, all PRs

**Steps:**
```yaml
1. Checkout code
2. Install dependencies (npm install)
3. Lint code (ESLint, Prettier)
4. Type check (TypeScript compiler)
5. Run unit tests (Jest)
6. Run integration tests (Jest)
7. Build production bundle (Vite)
8. Run E2E tests (Playwright) - only on develop/main
9. Generate coverage report
10. Upload coverage to Codecov
```

### 8.2 Required Checks for Merge

- ✅ All tests pass
- ✅ Code coverage ≥ 80%
- ✅ No linting errors
- ✅ No TypeScript errors
- ✅ Build succeeds

---

## 9. Documentation Requirements

### 9.1 Code Documentation

**All public APIs must have JSDoc:**

```typescript
/**
 * Generates random samples from a Normal distribution
 *
 * @param mean - The mean (μ) of the distribution
 * @param stddev - The standard deviation (σ), must be > 0
 * @returns A random sample from N(μ, σ²)
 *
 * @example
 * ```typescript
 * const dist = new NormalDistribution(100, 15);
 * const sample = dist.sample(rng);
 * console.log(sample); // ~100
 * ```
 */
sample(rng: RandomNumberGenerator): number {
  // Implementation
}
```

### 9.2 Architecture Decision Records (ADRs)

For significant design decisions, create ADR:

```markdown
# ADR-001: Use Web Workers for Simulation

## Status
Accepted

## Context
Monte Carlo simulations are CPU-intensive and block UI thread.

## Decision
Use Web Workers to execute simulations in background threads.

## Consequences
- Positive: UI remains responsive
- Negative: Data serialization overhead
- Neutral: More complex debugging
```

---

## 10. Common Scenarios

### 10.1 Adding a New Distribution (TDD)

```bash
# 1. Create feature branch
git checkout -b feature/add-beta-distribution

# 2. Write test FIRST (Red)
# Edit: tests/unit/distributions/beta.test.ts

# 3. Run test (should fail)
npm test tests/unit/distributions/beta.test.ts

# 4. Implement distribution (Green)
# Edit: src/distributions/continuous/BetaDistribution.ts

# 5. Run test (should pass)
npm test tests/unit/distributions/beta.test.ts

# 6. Refactor (if needed)

# 7. Export from index
# Edit: src/distributions/index.ts

# 8. Register with factory
# Edit: src/distributions/DistributionFactory.ts

# 9. Add Excel custom function
# Edit: src/functions/distribution-functions/beta.ts

# 10. Run all tests
npm test

# 11. Commit
git add .
git commit -m "test(distributions): add Beta distribution tests"
git commit -m "feat(distributions): implement Beta distribution"

# 12. Push and create PR
git push origin feature/add-beta-distribution
```

### 10.2 Adding a UI Component (TDD)

```bash
# 1. Create feature branch
git checkout -b feature/tornado-chart-component

# 2. Write component test FIRST (Red)
# Edit: tests/unit/taskpane/components/TornadoChart.test.tsx

# 3. Implement component (Green)
# Edit: src/taskpane/components/TornadoChart.tsx

# 4. Test rendering
npm run test:watch

# 5. Add to parent component
# Edit: src/taskpane/components/OutputDashboard.tsx

# 6. Manual testing in Excel
npm run dev

# 7. Commit and PR
git add .
git commit -m "test(ui): add TornadoChart component tests"
git commit -m "feat(ui): implement TornadoChart component"
git push origin feature/tornado-chart-component
```

### 10.3 Fixing a Bug (TDD)

```bash
# 1. Create bugfix branch
git checkout -b bugfix/correlation-negative-eigenvalues

# 2. Write failing test that reproduces bug (Red)
# Edit: tests/unit/engine/correlation.test.ts

# 3. Fix the bug (Green)
# Edit: src/engine/CorrelationEngine.ts

# 4. Verify test passes
npm test

# 5. Add regression test
# Edit: tests/integration/engine/correlation-edge-cases.test.ts

# 6. Commit and PR
git add .
git commit -m "test(engine): add test for negative eigenvalues bug"
git commit -m "fix(engine): handle negative eigenvalues in correlation matrix"
git push origin bugfix/correlation-negative-eigenvalues
```

---

## 11. Communication Channels

### 11.1 GitHub Issues

- **Bug Reports:** Use issue template
- **Feature Requests:** Use issue template
- **Questions:** Use discussions

### 11.2 Pull Request Discussions

- Ask questions in PR comments
- Request specific reviewers with @mention
- Link related issues

### 11.3 Documentation Updates

- Update docs in same PR as code changes
- Create separate PR for documentation-only changes

---

## 12. Onboarding New Developers

### 12.1 Setup Checklist

- [ ] Clone repository
- [ ] Install Node.js (v18+)
- [ ] Install dependencies: `npm install`
- [ ] Install Office.js type definitions
- [ ] Setup Excel with sideloaded add-in
- [ ] Run tests: `npm test`
- [ ] Build project: `npm run build`
- [ ] Start dev server: `npm run dev`

### 12.2 First Contribution

**Good first issues:**
- Add a simple distribution (e.g., Discrete Uniform)
- Fix a documentation typo
- Add unit tests for existing code
- Improve error messages

---

## 13. TDD Best Practices Summary

### 13.1 Test First, Always

✅ **DO:**
- Write test before writing implementation
- Start with simplest test case
- Add more complex tests incrementally

❌ **DON'T:**
- Write code first, then test
- Write all tests at once
- Skip tests for "simple" code

### 13.2 Test Naming

✅ **Good:**
```typescript
it('should return 0 for pdf when x is negative')
it('should throw error when stddev is zero')
it('should generate 10000 samples in under 100ms')
```

❌ **Bad:**
```typescript
it('test pdf')
it('error handling')
it('performance')
```

### 13.3 Test Independence

Each test should:
- Run independently (no shared state)
- Not depend on test execution order
- Clean up after itself

```typescript
// Good: Fresh instance per test
beforeEach(() => {
  distribution = new NormalDistribution(0, 1);
});

// Bad: Shared instance
const distribution = new NormalDistribution(0, 1);
```

---

## 14. Helpful Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run lint                   # Lint code
npm run format                 # Format code with Prettier
npm run type-check             # TypeScript type checking

# Testing (TDD)
npm test                       # Run all tests
npm run test:watch             # Run tests in watch mode (TDD)
npm run test:coverage          # Run tests with coverage
npm run test:unit              # Run unit tests only
npm run test:integration       # Run integration tests only
npm run test:e2e               # Run E2E tests

# Git
git checkout -b feature/name   # Create feature branch
git push origin feature/name   # Push branch
git pull origin develop        # Pull latest develop

# Debugging
npm run debug                  # Start with debugger attached
npm run test:debug             # Debug tests
```

---

## 15. Resources

- **TypeScript Documentation:** https://www.typescriptlang.org/docs/
- **Office Add-ins Docs:** https://learn.microsoft.com/office/dev/add-ins/
- **Jest Testing Framework:** https://jestjs.io/docs/getting-started
- **Test-Driven Development:** https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530
- **Playwright E2E Testing:** https://playwright.dev/
- **React Testing Library:** https://testing-library.com/react

---

This collaboration guide ensures smooth multi-developer workflows with Test-Driven Development at its core. Happy coding! 🚀
