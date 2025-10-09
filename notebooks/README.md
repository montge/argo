# Argo Jupyter Notebooks

Interactive tutorials and examples for the Argo Monte Carlo simulation library.

## 📚 Available Notebooks

The tutorial series is organized into 5 focused notebooks covering all aspects of Argo:

### `01-distributions.ipynb` - Probability Distributions
Complete guide to all 14 probability distributions:
- **10 Continuous:** Normal, Uniform, Triangular, LogNormal, Exponential, Beta, Gamma, Weibull, Pareto, PERT
- **4 Discrete:** Binomial, Poisson, Geometric, Hypergeometric
- Sampling, parameters, PDF/CDF, statistical properties
- Real-world use cases for each distribution

### `02-statistics.ipynb` - Statistical Analysis
Complete guide to 24 statistical functions:
- **Descriptive Statistics:** mean, median, mode, variance, standard deviation, skewness, kurtosis
- **Percentiles & Quantiles:** percentile, quantile, quartiles, IQR
- **Confidence Intervals:** Normal, Bootstrap, margin of error, sample size
- **Distribution Fitting:** fitNormal, fitLogNormal, goodness-of-fit (Kolmogorov-Smirnov)
- Quality control and data analysis examples

### `03-risk-analysis.ipynb` - Risk Metrics
Complete guide to 6 risk assessment functions:
- **Value at Risk (VaR):** Maximum expected loss at confidence level
- **Conditional VaR (CVaR):** Expected shortfall beyond VaR
- **Probability Functions:** Exceeding, below, between thresholds
- **Target Probabilities:** Meeting objectives within tolerance
- Financial risk and project risk examples

### `04-monte-carlo.ipynb` - Simulation Engine
Complete guide to the MonteCarloEngine:
- Simple and complex simulations
- Input variables with probability distributions
- Formula variables with dependency resolution
- Correlation modeling (Cholesky decomposition, Gaussian copula)
- Progress reporting for long simulations
- Real-world project risk analysis

### `05-cli-usage.ipynb` - Command Line Tool
Complete guide to the Argo CLI:
- `argo distributions` - List all distributions
- `argo generate` - Create configuration templates
- `argo validate` - Validate JSON configs
- `argo simulate` - Run simulations from configs
- JSON schema reference and examples

## 🎯 Learning Path

**Complete Beginner:**
1. **01-distributions.ipynb** - Learn the building blocks
2. **04-monte-carlo.ipynb (Part 1-2)** - First simulations
3. **02-statistics.ipynb (Part 1-2)** - Analyze results

**Intermediate:**
4. **03-risk-analysis.ipynb** - Risk assessment techniques
5. **04-monte-carlo.ipynb (Part 3-4)** - Dependencies and correlations
6. **05-cli-usage.ipynb** - Production workflows

**Advanced:**
7. **04-monte-carlo.ipynb (Part 5-6)** - Real-world applications
8. **02-statistics.ipynb (Part 3-4)** - Advanced analysis
9. Build your own custom simulations

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or 22.x (LTS)
- Python 3.7+
- npm 10.x

### Option 1: Automated Setup (Recommended)

1. **Run the setup script from the project root:**
   ```bash
   cd /path/to/argo
   ./notebooks/setup-venv.sh
   ```

2. **Start the notebook server:**
   ```bash
   ./notebooks/start-notebook.sh
   ```

The setup script will:
- Create a Python virtual environment in `notebooks/.venv`
- Install Jupyter and required Python packages
- Install and register tslab (TypeScript kernel)
- Build the argo-core package
- Start Jupyter with all tutorial notebooks

### Option 2: Manual Setup

1. **Install Argo dependencies:**
   ```bash
   cd /path/to/argo
   npm install
   npm run build
   ```

2. **Create Python virtual environment:**
   ```bash
   python3 -m venv notebooks/.venv
   source notebooks/.venv/bin/activate
   ```

3. **Install Python requirements:**
   ```bash
   pip install -r notebooks/requirements.txt
   ```

4. **Install tslab (TypeScript kernel for Jupyter):**
   ```bash
   npm install -g tslab
   tslab install --python=notebooks/.venv/bin/python
   ```

5. **Start Jupyter:**
   ```bash
   source notebooks/.venv/bin/activate
   jupyter notebook notebooks/
   ```

### Running the Notebooks

1. **Select the TypeScript kernel** (tslab) if prompted
2. **Open any notebook** (01 through 05)
3. **Run cells** using `Shift+Enter` or the Run button
4. **Work through sequentially** or jump to topics of interest

## 🐳 Running in Docker (Optional)

If you prefer a containerized environment:

```bash
# Build the Docker image
docker build -t argo-notebook -f notebooks/Dockerfile .

# Run Jupyter in Docker
docker run -p 8888:8888 -v $(pwd):/workspace argo-notebook
```

Access Jupyter at `http://localhost:8888` (check console for token).

## 🧪 Testing Notebooks

### Automated Testing (CI/CD)

All notebooks are automatically tested in GitHub Actions on every push. The CI pipeline:
- Executes all notebooks headlessly using `jupyter nbconvert --execute`
- Validates that all cells run without errors
- Archives executed notebooks as artifacts
- Fails the build if any notebook fails

### Local Testing

Test notebooks locally before committing:

```bash
# Test all notebooks
cd notebooks
./test-notebooks.sh

# Test specific notebook
./test-notebooks.sh 01-distributions.ipynb 04-monte-carlo.ipynb
```

The test script will:
- Execute each notebook in headless mode
- Generate execution logs
- Report pass/fail status
- Save executed notebooks to `test-output/`

### Test Requirements

For notebooks to pass automated tests:
- All cells must execute without exceptions
- No broken imports or missing dependencies
- Execution must complete within timeout (3 minutes per cell, 5 minutes total)
- No interactive prompts or user input required

### Adding New Notebooks

When creating new notebooks:
1. Ensure all code cells are executable
2. Test locally with `./test-notebooks.sh`
3. Add notebook to repository
4. Verify CI passes before merging

## 📖 Detailed Contents

### 01: Probability Distributions (702 lines, 24 cells)
- All 14 distributions with examples
- Parameter explanations and use cases
- 10,000 sample generation per distribution
- PDF/CDF calculations
- Statistical properties validation

### 02: Statistical Analysis (574 lines, 15 cells)
- 12 descriptive statistics functions
- 5 percentile/quantile functions
- 4 confidence interval functions
- 3 distribution fitting functions
- Quality control case study

### 03: Risk Analysis (555 lines, 13 cells)
- Value at Risk (VaR) for loss estimation
- Conditional VaR (CVaR) for tail risk
- Probability calculations for scenarios
- Target achievement analysis
- Portfolio and project risk examples

### 04: Monte Carlo Simulation (601 lines, 16 cells)
- Part 1: Simple single-variable simulation
- Part 2: Multiple variables with formulas
- Part 3: Complex dependency chains
- Part 4: Correlated variables (Gaussian copula)
- Part 5: Progress reporting callbacks
- Part 6: Real software project risk simulation

### 05: CLI Usage (310 lines, 13 cells)
- Part 1: List distributions command
- Part 2: Generate configuration templates
- Part 3: Validate JSON schemas
- Part 4: Run simple simulations
- Part 5: Custom project risk configs
- Part 6: JSON output mode
- Part 7: Schema reference
- Part 8: File cleanup

## 💡 Tips

- **Reproducibility:** All examples use seeded RNGs - change the seed to see different results
- **Performance:** Try increasing iteration counts (10k → 100k) to see performance
- **Customization:** Modify distribution parameters to match your scenarios
- **Formulas:** Use any JavaScript expression in formula variables
- **Save Results:** Export to JSON for further analysis or visualization

## 🔧 Troubleshooting

### "Kernel not found" error
```bash
# Re-install tslab
npm install -g tslab
tslab install --python=python3 --force
```

### Import errors
```bash
# Make sure you're in the project root when starting Jupyter
cd /path/to/argo
npm install
npm run build
jupyter notebook notebooks/
```

### Module not found
The notebooks import from the local `packages/argo-core` directory. Make sure:
1. You're running Jupyter from the project root
2. Dependencies are installed (`npm install`)
3. The package has been built (`npm run build`)

### Slow execution
If notebooks run slowly:
- Reduce iteration counts (20000 → 10000)
- Close other applications
- Check system resources
- Docker may add overhead

## 📊 Visualizing Results

While the core library doesn't include visualization, you can export results and visualize with:

- **JavaScript:** Plotly, Chart.js, D3.js (in additional notebook cells)
- **Python:** matplotlib, seaborn (export JSON and import in Python)
- **Excel:** Export CSV and create charts

Example: Export simulation results to JSON:
```typescript
// In a notebook cell
const fs = require('fs');
fs.writeFileSync('results.json', JSON.stringify(result.samples, null, 2));
```

## 🚀 What's Next?

After completing the tutorials:

1. **Explore the source code:** `/packages/argo-core/src/`
2. **Read the tests:** `/packages/argo-core/tests/` for more examples
3. **Check the docs:** `/docs/` for detailed specifications
4. **Try the CLI:** `node packages/argo-cli/bin/argo.js --help`
5. **Build your model:** Adapt examples to your use case
6. **Share feedback:** Open an issue on GitHub

## 📝 Creating Your Own Notebooks

Feel free to create additional notebooks in this directory:

```bash
# Create a new notebook
jupyter notebook notebooks/my-analysis.ipynb
```

Example use cases:
- Portfolio risk analysis
- Project scheduling and PERT
- Cost estimation and budgeting
- Quality control and Six Sigma
- Reliability engineering
- Sales forecasting
- Supply chain optimization
- Clinical trial design

## 🤝 Contributing

Found an issue or want to add a tutorial? Contributions welcome!

1. Fork the repo
2. Create a new notebook or improve existing ones
3. Test thoroughly with `./test-notebooks.sh`
4. Submit a pull request

## 📚 Additional Resources

- **Argo Documentation:** `/docs/ARCHITECTURE.md`
- **API Reference:** `/docs/REQUIREMENTS.md`
- **Test Examples:** `/packages/argo-core/tests/`
- **Roadmap:** `/ROADMAP.md`
- **CLI Package:** `/packages/argo-cli/README.md`

---

**Happy Simulating!** 🎲
