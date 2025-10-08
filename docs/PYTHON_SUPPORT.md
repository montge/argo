# Python Support for Argo

**Version:** 5.0
**Last Updated:** 2025-10-07

## Overview

Office 365 Excel is introducing **Python in Excel** (currently in preview), which allows users to run Python code directly within Excel worksheets. This document outlines considerations for Argo's Python support strategy.

---

## 1. Python in Excel Overview

### 1.1 What is Python in Excel?

Microsoft is adding native Python support to Excel through integration with Anaconda:
- Python code runs in Excel formulas: `=PY("python code here")`
- Access to popular libraries: pandas, NumPy, Matplotlib, scikit-learn
- Cloud-based execution (runs on Microsoft Cloud)
- Available in Office 365 subscriptions

### 1.2 Current Status (2025)

- **Availability:** Public Preview
- **Platform:** Excel for Windows, Excel for Web
- **Requirements:** Office 365 E3/E5 or Microsoft 365 Business Standard/Premium
- **Limitations:** Cloud execution only, no custom package installs

---

## 2. Argo Integration Strategy

### 2.1 Parallel Support Model

Argo will support **both** JavaScript/TypeScript (Office.js) and Python approaches:

```
┌─────────────────────────────────────────────────────┐
│                  Argo for Office 365                 │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │   Argo Add-in       │  │   Argo Python       │  │
│  │   (Office.js)       │  │   Package           │  │
│  ├─────────────────────┤  ├─────────────────────┤  │
│  │ - Full UI           │  │ - Lightweight       │  │
│  │ - Task Pane         │  │ - Function-based    │  │
│  │ - Ribbon Commands   │  │ - Pure Python       │  │
│  │ - 35+ Distributions │  │ - Core features     │  │
│  │ - 50+ Stats         │  │ - No UI             │  │
│  │ - Visualizations    │  │ - Library-style     │  │
│  └─────────────────────┘  └─────────────────────┘  │
│           │                        │                 │
│           v                        v                 │
│  Office.js Runtime      Python in Excel Runtime     │
└─────────────────────────────────────────────────────┘
```

### 2.2 Feature Comparison

| Feature | Office.js Add-in | Python in Excel |
|---------|------------------|-----------------|
| **Monte Carlo Simulation** | ✅ Full | ✅ Core |
| **Probability Distributions** | ✅ 35+ | ✅ 20+ |
| **Statistical Functions** | ✅ 50+ | ✅ 30+ |
| **UI (Task Pane, Dialogs)** | ✅ Rich | ❌ Formula-only |
| **Visualizations** | ✅ Interactive | ✅ Static (Matplotlib) |
| **Rank Correlation** | ✅ Yes | ✅ Yes |
| **Real-time Updates** | ✅ Yes | ⚠️ Limited |
| **Offline Support** | ✅ Yes (Desktop) | ❌ Cloud only |
| **Custom Packages** | ✅ Any npm | ❌ Restricted |

### 2.3 Recommended Usage

**Use Office.js Add-in when:**
- Full UI/UX experience needed
- Interactive dashboards required
- Offline/desktop use important
- Enterprise deployment
- Maximum performance needed

**Use Python in Excel when:**
- Simple formula-based workflows
- Python-centric data science teams
- Integration with pandas/NumPy workflows
- Quick prototyping
- No add-in installation possible

---

## 3. Python Package Design: `argo-py`

### 3.1 Package Structure

```
argo-py/
├── setup.py
├── README.md
├── argo/
│   ├── __init__.py
│   ├── simulation.py        # Monte Carlo engine
│   ├── distributions/       # Probability distributions
│   │   ├── __init__.py
│   │   ├── continuous.py    # Normal, Uniform, etc.
│   │   └── discrete.py      # Binomial, Poisson, etc.
│   ├── stats/               # Statistical functions
│   │   ├── __init__.py
│   │   ├── descriptive.py
│   │   └── risk.py
│   └── utils/
│       ├── __init__.py
│       └── correlation.py
└── tests/
    └── ...
```

### 3.2 Example Usage in Excel

**Formula-based simulation:**
```python
=PY("
import argo
import numpy as np

# Define uncertain inputs
demand = argo.distributions.normal(1000, 150)
cost = argo.distributions.triangular(10, 12, 15)

# Run simulation
results = argo.simulate(
    iterations=10000,
    inputs={'demand': demand, 'cost': cost},
    output=lambda d, c: d * c  # Revenue calculation
)

# Return statistics
results.summary()
")
```

**Using with pandas:**
```python
=PY("
import argo
import pandas as pd

# Simulate multiple scenarios
scenarios = pd.DataFrame({
    'low': argo.distributions.normal(100, 10).sample(1000),
    'mid': argo.distributions.normal(150, 15).sample(1000),
    'high': argo.distributions.normal(200, 20).sample(1000)
})

scenarios.describe()
")
```

### 3.3 Core API

```python
# distributions/continuous.py
class Normal:
    def __init__(self, mean, std):
        self.mean = mean
        self.std = std

    def sample(self, size=1):
        """Generate random samples"""
        return np.random.normal(self.mean, self.std, size)

    def pdf(self, x):
        """Probability density function"""
        return scipy.stats.norm.pdf(x, self.mean, self.std)

    def cdf(self, x):
        """Cumulative distribution function"""
        return scipy.stats.norm.cdf(x, self.mean, self.std)

# simulation.py
def simulate(iterations, inputs, output, correlation=None):
    """
    Run Monte Carlo simulation

    Args:
        iterations: Number of simulation runs
        inputs: Dict of {name: distribution} pairs
        output: Function that takes **inputs and returns result
        correlation: Optional correlation matrix

    Returns:
        SimulationResult with statistics
    """
    results = []
    for i in range(iterations):
        # Sample all inputs
        samples = {name: dist.sample() for name, dist in inputs.items()}

        # Apply correlation if specified
        if correlation:
            samples = apply_correlation(samples, correlation)

        # Calculate output
        result = output(**samples)
        results.append(result)

    return SimulationResult(results)

# stats/descriptive.py
def percentile(data, p):
    """Calculate percentile"""
    return np.percentile(data, p)

def var(data, confidence=0.95):
    """Value at Risk"""
    return percentile(data, (1 - confidence) * 100)
```

---

## 4. Implementation Roadmap

### 4.1 Phase 1: Office.js Add-in (Primary)
**Priority:** Critical
**Timeline:** Q1-Q2 2025

- [x] Requirements and architecture
- [ ] Core simulation engine
- [ ] 20+ distributions (MVP)
- [ ] Basic UI (task pane)
- [ ] Excel Desktop support

### 4.2 Phase 2: Python Package (Secondary)
**Priority:** High
**Timeline:** Q3-Q4 2025

- [ ] Design Python API
- [ ] Implement core distributions (NumPy/SciPy-based)
- [ ] Monte Carlo engine
- [ ] Statistical functions
- [ ] PyPI package release
- [ ] Documentation and examples

### 4.3 Phase 3: Hybrid Workflows
**Priority:** Medium
**Timeline:** 2026

- [ ] Office.js Add-in calls Python functions
- [ ] Python functions trigger Add-in UI
- [ ] Unified result visualization
- [ ] Cross-language data exchange

---

## 5. Technical Considerations

### 5.1 Python in Excel Limitations

**Execution Model:**
- Runs in cloud sandbox (not local machine)
- Limited to pre-installed packages (Anaconda distribution)
- No custom package installation (as of 2025)
- Network latency for computation

**Security:**
- Code execution restricted
- No file system access
- No external API calls from Python code

**Performance:**
- Cloud round-trip adds latency
- Large datasets may timeout
- Recalculation slower than local

### 5.2 Workarounds

**For Custom Packages:**
- Include pure-Python implementations in formula
- Use only standard library + Anaconda packages
- Wait for Microsoft to add custom package support

**For Performance:**
- Cache results where possible
- Use smaller iteration counts
- Leverage Excel's calculation engine for simple formulas

**For Offline:**
- Recommend Office.js Add-in for offline scenarios
- Document cloud-only limitation

---

## 6. Migration Path

### 6.1 From Legacy Argo to Argo v5.0

Users of original Argo (Excel 2007-2016) have **three** migration paths:

```
Original Argo (Excel DNA)
         |
         v
┌────────┴────────────────────────────────┐
│                                          │
v                                          v
Argo v5.0 Add-in                   Argo Python Package
(Office.js)                        (Python in Excel)
- Full feature parity              - Core features only
- Rich UI experience               - Formula-based
- Offline support                  - Cloud-based
│                                          │
└────────┬─────────────────────────────────┘
         v
  Hybrid Usage (Both)
  - UI from Add-in
  - Python for data science workflows
```

### 6.2 Function Mapping

**Legacy Argo → Argo v5.0 (Office.js):**
```
=ARGO.NORMAL(mean, std)  →  =ARGO.NORMAL(mean, std)  [Unchanged]
=ARGO.TRIANGULAR(a,b,c)  →  =ARGO.TRIANGULAR(a,b,c)  [Unchanged]
```

**Legacy Argo → Argo Python:**
```
=ARGO.NORMAL(100, 15)    →  =PY("argo.distributions.normal(100, 15).sample()")
=ARGO.MEAN(A1:A1000)     →  =PY("np.mean(xl('A1:A1000'))")
```

---

## 7. Development Tools

### 7.1 Python Package Development

```bash
# Setup Python development environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install numpy scipy pandas matplotlib pytest

# Install argo-py in development mode
pip install -e .

# Run tests
pytest tests/

# Build distribution
python setup.py sdist bdist_wheel

# Upload to PyPI
twine upload dist/*
```

### 7.2 Testing Python in Excel

**Local Testing:**
```bash
# Test Python functions locally before Excel
python -m pytest tests/

# Interactive testing
python -i -c "import argo; argo.distributions.normal(100, 15).sample(10)"
```

**Excel Testing:**
1. Open Excel with Python enabled
2. Enter formula: `=PY("import argo; argo.test()")`
3. Verify output

---

## 8. Documentation Strategy

### 8.1 Separate Documentation

**Office.js Add-in Docs:**
- Installation guide (sideloading, AppSource)
- UI walkthrough
- Custom function reference
- Advanced features (correlation, sensitivity)

**Python Package Docs:**
- PyPI installation: `pip install argo-py`
- Excel formula examples
- API reference
- Integration with pandas/NumPy

### 8.2 Comparison Guide

Create guide comparing approaches:
- When to use Office.js vs Python
- Feature availability matrix
- Performance benchmarks
- Migration examples

---

## 9. Licensing

Both implementations (Office.js and Python) will use **Apache 2.0** license:
- Consistent with original Argo
- Permissive for commercial use
- Compatible with NumPy/SciPy (BSD licenses)
- Clear attribution

---

## 10. Open Questions

1. **Custom Package Support:** When will Excel allow custom Python packages?
2. **Offline Python:** Will Microsoft add local Python execution?
3. **Performance:** What are realistic iteration limits for cloud Python?
4. **API Stability:** How stable is Python in Excel API?
5. **Licensing:** Any restrictions on Python packages distributed for Excel?

---

## 11. Recommendations

### 11.1 Primary Focus: Office.js Add-in

**Rationale:**
- Full feature control
- Rich UI/UX possible
- Offline support
- No platform restrictions
- Better performance

### 11.2 Secondary: Python Package

**Rationale:**
- Complementary offering
- Appeals to Python-centric users
- Lightweight alternative
- Easier for data scientists familiar with Python

### 11.3 Long-term: Hybrid

**Rationale:**
- Best of both worlds
- Office.js Add-in provides UI
- Python provides data science integration
- Unified Argo experience across paradigms

---

## 12. Next Steps

1. ✅ Complete Office.js Add-in requirements and architecture
2. ⏳ Implement Office.js Add-in MVP
3. ⏳ Prototype Python package design
4. ⏳ Test Python in Excel preview
5. ⏳ Gather user feedback on preferred approach
6. ⏳ Iterate based on Python in Excel GA features

---

## 13. References

- **Python in Excel:** https://support.microsoft.com/en-us/office/python-in-excel
- **Python in Excel Docs:** https://learn.microsoft.com/en-us/office/python/python-in-excel-overview
- **Anaconda in Excel:** https://www.anaconda.com/excel
- **NumPy:** https://numpy.org/
- **SciPy:** https://scipy.org/
- **pandas:** https://pandas.pydata.org/
