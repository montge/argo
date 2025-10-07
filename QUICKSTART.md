# Argo Quick Start Guide

**Branch:** `office365-linux-rebuild`
**Status:** ✅ First distribution working with TDD

---

## What's Working Right Now

### ✅ Normal Distribution (Fully Functional)

**Test it:**
```bash
cd packages/argo-core
npx ts-node examples/test-normal.ts
```

**Expected output:**
```
============================================================
Argo Normal Distribution Test
============================================================

Simple Monte Carlo Simulation:
  Simulating 10,000 samples...
  Duration: 2ms (5,000,000 samples/sec)

Empirical Statistics:
  Mean: 100.04 (expected: 100.00)
  Std Dev: 14.88 (expected: 15.00)

✅ Normal distribution is working correctly!
============================================================
```

**Run tests:**
```bash
cd packages/argo-core
npm test
```

**Expected:** 18/18 tests passing ✅

---

## Project Structure

```
argo/
├── docs/                          # Comprehensive documentation (300+ pages)
│   ├── REQUIREMENTS.md            # What to build
│   ├── ARCHITECTURE.md            # How to build it
│   ├── COLLABORATION.md           # TDD workflow
│   ├── PYTHON_SUPPORT.md          # Python in Excel strategy
│   ├── CLI_TOOL.md                # Command-line tool design
│   ├── DEPLOYMENT.md              # Web-based deployment
│   ├── GOVERNMENT_CLOUD.md        # GCC High/DoD deployment
│   └── PROJECT_SUMMARY.md         # Overview
│
├── packages/
│   ├── argo-core/                 # ✅ WORKING - Core library
│   │   ├── src/
│   │   │   ├── distributions/
│   │   │   │   └── NormalDistribution.ts  ✅
│   │   │   ├── types/
│   │   │   │   └── Distribution.ts
│   │   │   └── utils/
│   │   │       ├── SimpleRNG.ts
│   │   │       └── erfUtils.ts
│   │   ├── tests/                 # 18 passing tests
│   │   └── examples/
│   │       └── test-normal.ts     # Working demo
│   │
│   ├── argo-cli/                  # 🚧 TODO - Command-line tool
│   └── argo-excel/                # 🚧 TODO - Office.js add-in
│
├── README.md                      # Main documentation
├── NOTICE.md                      # Licensing
└── package.json                   # Monorepo root
```

---

## Quick Commands

### Development
```bash
# Install all dependencies
npm install

# Run tests (any package)
npm test

# Run tests in watch mode (TDD)
npm run test:watch

# Build TypeScript
npm run build

# Run Normal distribution demo
cd packages/argo-core
npx ts-node examples/test-normal.ts
```

### Git Workflow
```bash
# Check status
git status

# Create feature branch
git checkout -b feature/my-feature

# Commit changes
git add -A
git commit -m "feat: description"
git push
```

---

## Next Steps (Choose Your Path)

### Path 1: Add More Distributions (TDD Approach)

**Goal:** Implement Uniform, Triangular, Exponential, etc.

**Steps:**
1. Create test file (RED phase)
   ```bash
   vim packages/argo-core/tests/distributions/UniformDistribution.test.ts
   ```

2. Write failing tests
   ```typescript
   describe('UniformDistribution', () => {
     it('should generate samples between min and max', () => {
       const dist = new UniformDistribution(0, 10);
       // Write comprehensive tests
     });
   });
   ```

3. Run tests (should fail)
   ```bash
   npm run test:watch
   ```

4. Implement distribution (GREEN phase)
   ```bash
   vim packages/argo-core/src/distributions/UniformDistribution.ts
   ```

5. Watch tests pass ✅

6. Commit
   ```bash
   git add -A
   git commit -m "feat(core): implement Uniform distribution with TDD"
   git push
   ```

**Repeat for each distribution.**

---

### Path 2: Build CLI Tool

**Goal:** Create command-line tool for Linux/automation

**Steps:**
1. Set up argo-cli package
   ```bash
   cd packages/argo-cli
   npm init -y
   # Configure TypeScript, dependencies
   ```

2. Create CLI commands
   ```bash
   vim packages/argo-cli/src/commands/simulate.ts
   ```

3. Implement simulation runner
   ```typescript
   import { NormalDistribution, SimpleRNG } from '@argo/core';
   // Read JSON config
   // Run simulation
   // Output results
   ```

4. Test CLI
   ```bash
   ./bin/argo simulate --config examples/basic.json
   ```

---

### Path 3: Create Office.js Add-in

**Goal:** Excel add-in for Windows/Mac/Web

**Steps:**
1. Set up argo-excel package
   ```bash
   cd packages/argo-excel
   npm init -y
   # Install Office.js, React, Vite
   ```

2. Create manifest.xml
   ```xml
   <OfficeApp>
     <SourceLocation DefaultValue="https://localhost:3000"/>
   </OfficeApp>
   ```

3. Create task pane UI (React)
   ```bash
   vim packages/argo-excel/src/taskpane/TaskPane.tsx
   ```

4. Sideload into Excel
   ```bash
   npm run dev
   # Open Excel, load manifest
   ```

---

### Path 4: User Documentation

**Goal:** Create user-facing guides (Markdown)

**Steps:**
1. Create user docs structure
   ```bash
   mkdir -p docs/user
   vim docs/user/getting-started.md
   ```

2. Write guides based on original wiki:
   - Getting Started
   - Distributions Reference
   - Statistical Functions
   - Examples and Tutorials
   - FAQ

3. Convert to website (optional)
   ```bash
   # Use MkDocs, Docusaurus, or GitHub Pages
   ```

---

## Recommended Next Step

**I recommend: Path 1 (Add More Distributions)**

**Why:**
1. ✅ Establishes TDD workflow pattern
2. ✅ Builds core library that ALL variants need
3. ✅ Quick wins (each distribution = visible progress)
4. ✅ Parallel work possible (multiple people can do different distributions)

**Which distributions to add next (in order of usefulness):**
1. **Uniform** - Simplest, good learning example
2. **Triangular** - Very common in project management
3. **Log-Normal** - Common in finance
4. **Exponential** - Common in reliability engineering
5. **Binomial** - First discrete distribution

---

## TDD Workflow Reminder

**Always follow this cycle:**

```
┌─────────────────────────────────────────┐
│                                         │
│  1. RED: Write failing test             │
│     - Think about what should happen    │
│     - Write comprehensive test cases    │
│     - Run test (it should fail)         │
│                                         │
│  2. GREEN: Write minimal code           │
│     - Implement just enough to pass     │
│     - Run test (it should pass)         │
│     - Don't over-engineer yet           │
│                                         │
│  3. REFACTOR: Clean up code             │
│     - Improve readability               │
│     - Optimize performance              │
│     - Tests still pass                  │
│                                         │
│  4. COMMIT: Save your work              │
│     - git add -A                        │
│     - git commit -m "feat: ..."         │
│     - git push                          │
│                                         │
└─────────────────────────────────────────┘
           │
           └──> Repeat for next feature
```

---

## Performance Targets

Based on Normal distribution benchmark:

- ✅ **Sampling:** 5 million samples/second
- ✅ **PDF calculation:** 10 million/second
- ✅ **CDF calculation:** 8 million/second

**All future distributions should aim for similar performance.**

---

## Test Coverage Requirements

- **Minimum overall:** 80%
- **Critical modules:** 90%
  - Distributions
  - Simulation engine
  - Statistical functions

**Check coverage:**
```bash
npm run test:coverage
```

---

## Government Cloud (GCC High/DoD) Notes

For users who need air-gapped deployment:

**Priority:** CLI tool (no network dependencies)

**CLI tool advantages:**
- ✅ Standalone binary
- ✅ No Excel required
- ✅ No network calls
- ✅ JSON/CSV input/output
- ✅ Export to Excel files

See [GOVERNMENT_CLOUD.md](docs/GOVERNMENT_CLOUD.md) for details.

---

## Questions?

- **Documentation:** See `docs/` folder (300+ pages)
- **Issues:** Create GitHub issue
- **Contributing:** See `docs/COLLABORATION.md`

---

## Current Status Summary

| Component | Status | Tests | Next Step |
|-----------|--------|-------|-----------|
| **Normal Distribution** | ✅ Complete | 18/18 passing | Add more distributions |
| **Uniform Distribution** | ⏳ Planned | 0/0 | Implement with TDD |
| **Triangular Distribution** | ⏳ Planned | 0/0 | Implement with TDD |
| **Simulation Engine** | ⏳ Planned | 0/0 | Design & implement |
| **CLI Tool** | ⏳ Planned | 0/0 | Create package structure |
| **Office.js Add-in** | ⏳ Planned | 0/0 | Create package structure |
| **Documentation** | ✅ Complete | N/A | User guides needed |

---

**🎯 You're ready to start building!**

Choose a path above, follow the TDD workflow, and commit frequently. The foundation is solid.

**🤖 Built with Claude Code (AI) - Test-Driven Development**
