# GitHub Actions CI/CD

This directory contains GitHub Actions workflows for automated testing, coverage reporting, and TDD validation.

## Workflows

### 1. CI - Build and Test (`ci.yml`)

**Triggers:** Push/PR to main branches

**What it does:**
- Tests on Ubuntu, Windows, and macOS
- Tests with Node.js 18.x and 20.x
- Runs linting, builds, and tests
- Uploads coverage to Codecov
- Generates test reports

**Matrix:**
- 3 OS × 2 Node versions = 6 parallel jobs

### 2. Coverage Report (`coverage.yml`)

**Triggers:** Push/PR to main branches

**What it does:**
- Generates detailed coverage reports
- Uploads to Codecov with detailed analysis
- Comments on PRs with coverage changes
- Fails if coverage < 80%

**Coverage Thresholds:**
- Minimum: 80% (branches, functions, lines, statements)
- Target: 90% for critical modules

### 3. TDD Check (`tdd-check.yml`)

**Triggers:** PRs with TypeScript file changes

**What it does:**
- Validates Test-Driven Development approach
- Warns if source files added without tests
- Comments on PR with TDD reminder
- Generates TDD validation summary

**TDD Validation:**
- ⚠️ Warns if new `.ts` files without `.test.ts` files
- ✅ Passes if tests are included with source changes

### 4. Status Badges (`status-badge.yml`)

**Triggers:** Push to main branches, weekly schedule

**What it does:**
- Generates status badges for README
- Updates test/build/coverage badges
- Runs weekly to keep badges current

---

## Viewing Workflow Status

Since `gh` CLI doesn't work on Linux in your environment, use these methods:

### Method 1: GitHub Web UI (Recommended)

1. **View all workflows:**
   ```
   https://github.com/YOUR_USERNAME/argo/actions
   ```

2. **View specific workflow:**
   - Click "Actions" tab in GitHub
   - Select workflow from left sidebar
   - See all runs with status indicators

3. **View run details:**
   - Click any workflow run
   - See jobs, steps, and logs
   - Download artifacts (coverage reports)

### Method 2: GitHub API (Command Line)

**Get latest workflow runs:**
```bash
curl -s -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/YOUR_USERNAME/argo/actions/runs | \
  jq '.workflow_runs[] | {name: .name, status: .status, conclusion: .conclusion, created_at: .created_at}' | head -20
```

**Get status of specific workflow:**
```bash
curl -s -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/YOUR_USERNAME/argo/actions/workflows/ci.yml/runs | \
  jq '.workflow_runs[0] | {status: .status, conclusion: .conclusion, created_at: .created_at}'
```

### Method 3: Commit Status Badges

Add to README.md:
```markdown
![CI](https://github.com/YOUR_USERNAME/argo/workflows/CI%20-%20Build%20and%20Test/badge.svg)
![Coverage](https://img.shields.io/codecov/c/github/YOUR_USERNAME/argo)
```

### Method 4: Watch Notifications

**Email notifications:**
- GitHub sends email for workflow failures
- Configure in Settings > Notifications

**RSS feed:**
```
https://github.com/YOUR_USERNAME/argo/commits/office365-linux-rebuild.atom
```

### Method 5: Git Commit Status

**Check commit status:**
```bash
# After pushing
git log -1 --pretty=format:"%h %s"

# Then check on GitHub
# https://github.com/YOUR_USERNAME/argo/commit/COMMIT_HASH
```

**Status indicators:**
- ✅ Green checkmark = All checks passed
- ❌ Red X = Some checks failed
- 🟡 Yellow dot = Checks running
- ⚪ Gray circle = Checks pending

---

## Local Testing (Before Push)

Run these commands locally to catch issues before pushing:

### Full CI Pipeline Simulation

```bash
# Install dependencies
npm ci

# Lint
npm run lint

# Build all packages
npm run build --workspaces

# Run tests
npm test --workspaces

# Run tests with coverage
npm run test:coverage --workspaces

# Check coverage threshold
cd packages/argo-core
npm run test:coverage
# Should show >80% coverage
```

### Quick Checks

```bash
# Just run tests (fast)
npm test

# Check TypeScript compilation
npm run build

# Lint check (no fix)
npm run lint
```

### Pre-commit Hook (Recommended)

Create `.git/hooks/pre-commit`:
```bash
#!/bin/bash
set -e

echo "Running pre-commit checks..."

# Run tests
npm test --workspaces

# Check linting
npm run lint

echo "✅ Pre-commit checks passed"
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

---

## Codecov Integration

### Setup (First Time)

1. **Sign up at Codecov:**
   - Go to https://codecov.io
   - Sign in with GitHub
   - Add repository

2. **Get upload token:**
   - In Codecov dashboard, go to Settings
   - Copy upload token
   - Add as GitHub secret: `CODECOV_TOKEN`

3. **Badge for README:**
   ```markdown
   [![codecov](https://codecov.io/gh/YOUR_USERNAME/argo/branch/office365-linux-rebuild/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/argo)
   ```

### View Coverage Reports

1. **Codecov Dashboard:**
   ```
   https://codecov.io/gh/YOUR_USERNAME/argo
   ```

2. **PR Comments:**
   - Codecov bot comments on PRs with coverage diff
   - Shows coverage increase/decrease per file

3. **Sunburst Chart:**
   - Visual representation of coverage by module
   - Drill down to see uncovered lines

---

## Troubleshooting

### Workflow Not Running

**Check:**
1. Workflow file syntax (YAML errors)
2. Branch name in `on.push.branches`
3. File paths in `on.push.paths`

**Validate YAML:**
```bash
# Install yamllint
sudo apt install yamllint

# Check workflow files
yamllint .github/workflows/*.yml
```

### Tests Failing in CI but Pass Locally

**Common causes:**
1. **Timezone differences** - Use UTC in tests
2. **File paths** - Use `path.join()` not string concat
3. **Case-sensitive filesystems** - macOS is case-insensitive, Linux isn't
4. **Missing dependencies** - Check `package.json`

**Debug:**
- Add `console.log()` statements
- Check workflow logs in GitHub Actions tab
- Run with same Node version as CI

### Coverage Not Uploading

**Check:**
1. `CODECOV_TOKEN` secret is set
2. Coverage files generated: `packages/*/coverage/coverage-final.json`
3. Internet connectivity (not an issue on GitHub Actions)

---

## Monitoring

### Daily Checks

```bash
# Quick status check
curl -s "https://api.github.com/repos/YOUR_USERNAME/argo/actions/runs?per_page=5" | \
  jq '.workflow_runs[] | "\(.name): \(.conclusion // "running")"'
```

### Weekly Review

1. Check test trends (are tests staying green?)
2. Review coverage trends (is coverage increasing?)
3. Check for flaky tests (intermittent failures)
4. Update dependencies (Dependabot PRs)

---

## Adding New Workflows

1. Create file in `.github/workflows/`
2. Follow naming: `feature-name.yml`
3. Test locally with `act` (if installed)
4. Push and check Actions tab

**Template:**
```yaml
name: My Workflow

on:
  push:
    branches: [ main ]

jobs:
  my-job:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Run something
      run: echo "Hello"
```

---

## Best Practices

1. ✅ **Keep workflows fast** - Parallel jobs, caching
2. ✅ **Fail fast** - Stop on first error
3. ✅ **Clear names** - Descriptive job/step names
4. ✅ **Artifacts** - Save test results, coverage
5. ✅ **Notifications** - Email on failure
6. ✅ **Matrix testing** - Test multiple OS/Node versions
7. ✅ **Secrets** - Never commit tokens/passwords

---

## Resources

- **GitHub Actions Docs:** https://docs.github.com/en/actions
- **Workflow Syntax:** https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions
- **Codecov Docs:** https://docs.codecov.com/docs
- **Jest Coverage:** https://jestjs.io/docs/configuration#collectcoverage-boolean

---

**Questions?** Check workflow logs in GitHub Actions tab or see [COLLABORATION.md](../../docs/COLLABORATION.md)
