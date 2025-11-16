# GitHub Issues - Argo Project Quality Improvements

This directory contains formatted GitHub issue templates ready to be created in your repository.

## Issue Summary

| # | Title | Priority | Labels |
|---|-------|----------|--------|
| 01 | Branch coverage below 80% in @argo/cli (64.28%) | HIGH | enhancement, testing, code-quality |
| 02 | Branch coverage below 80% in @argo/excel (64.44%) | CRITICAL | bug, testing, code-quality, react |
| 03 | Low test coverage in intervals.ts (71.91%) | HIGH | enhancement, testing, statistics |
| 04 | 22 moderate severity npm security vulnerabilities | HIGH | security, dependencies, npm |
| 05 | Upgrade deprecated npm dependencies | MEDIUM | dependencies, maintenance, enhancement |
| 06 | Build fails on clean install due to workspace dependency ordering | HIGH | bug, build, monorepo |
| 07 | 145+ console warnings for unregistered Fluent UI icons | MEDIUM | enhancement, testing, ui, developer-experience |
| 08 | Excel add-in bundle size exceeds 500 kB (855 kB) | MEDIUM | performance, enhancement, build |
| 09 | Implement Nested App Authentication (NAA) for modern O365 SSO | HIGH | enhancement, authentication, office365, microsoft-graph |

## How to Create Issues

### Method 1: Manual Creation (Recommended)
1. Go to your GitHub repository
2. Click "Issues" tab
3. Click "New issue"
4. Copy the content from each `.md` file
5. Paste into GitHub issue form
6. Add the labels listed in each file
7. Submit issue

### Method 2: GitHub CLI (if available)
```bash
# For each issue file:
gh issue create --title "Title from file" --body-file ./01-branch-coverage-cli.md --label "enhancement,testing"
```

### Method 3: GitHub API (with token)
```bash
# Set your token
export GITHUB_TOKEN="your_token_here"

# Create issue
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/OWNER/REPO/issues \
  -d @issue-payload.json
```

## Priority Definitions

- **CRITICAL:** Blocks quality standards, needs immediate attention
- **HIGH:** Important for project health, should be addressed soon
- **MEDIUM:** Improves project quality, plan for upcoming sprint
- **LOW:** Nice to have, can be deferred

## Recommended Order of Resolution

1. **Issue #06** - Fix build ordering (blocks development)
2. **Issue #02** - Fix Excel branch coverage (critical quality issue)
3. **Issue #01** - Fix CLI branch coverage (high quality issue)
4. **Issue #03** - Fix intervals.ts coverage (completes core coverage)
5. **Issue #04** - Address security vulnerabilities
6. **Issue #07** - Fix Fluent UI warnings (quick win, improves DX)
7. **Issue #09** - Implement NAA (future-proofs O365 integration)
8. **Issue #08** - Code-split bundle (performance optimization)
9. **Issue #05** - Upgrade dependencies (ongoing maintenance)

## Coverage Targets

All packages should meet:
- **Overall:** 90%+ statement/line coverage
- **Module/Class/Function:** 80%+ coverage
- **Current Status:**
  - `@argo/core`: ✅ 96% (exceeds targets)
  - `@argo/cli`: ⚠️ 89.7% overall, 64% branch (below target)
  - `@argo/excel`: ⚠️ 89.5% overall, 64% branch (below target)

## Additional Context

See `.local/project-analysis.md` for comprehensive project analysis including:
- Detailed coverage breakdowns
- O365 standards compliance review
- Code quality assessment
- Dependency audit
- Recommendations and roadmap
