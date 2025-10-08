# Argo Jupyter Notebooks

Interactive tutorials and examples for the Argo Monte Carlo simulation library.

## 📚 Available Notebooks

### `argo-tutorial.ipynb` - Complete Tutorial
A comprehensive tutorial covering:
- All 14 probability distributions
- 30 statistical functions
- Monte Carlo simulation engine
- Correlation support
- Real-world examples (construction projects, software development)
- Performance benchmarks

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or 22.x (LTS)
- Python 3.7+ with Jupyter
- npm 10.x

### Installation

1. **Install Argo dependencies:**
   ```bash
   cd /path/to/argo
   npm install
   ```

2. **Install tslab (TypeScript kernel for Jupyter):**
   ```bash
   npm install -g tslab
   ```

3. **Register tslab with Jupyter:**
   ```bash
   tslab install --python=python3
   ```

4. **Verify installation:**
   ```bash
   jupyter kernelspec list
   ```

   You should see `tslab` in the output:
   ```
   Available kernels:
     python3    /usr/local/share/jupyter/kernels/python3
     tslab      /usr/local/share/jupyter/kernels/tslab
   ```

### Running the Notebooks

1. **Start Jupyter from the project root:**
   ```bash
   cd /path/to/argo
   jupyter notebook
   ```

2. **Navigate to the notebooks directory** and open `argo-tutorial.ipynb`

3. **Select the TypeScript kernel** (tslab) if prompted

4. **Run cells** using `Shift+Enter` or the Run button

## 🐳 Running in Docker (Optional)

If you prefer a containerized environment:

```bash
# Build the Docker image
docker build -t argo-notebook -f notebooks/Dockerfile .

# Run Jupyter in Docker
docker run -p 8888:8888 -v $(pwd):/workspace argo-notebook
```

Access Jupyter at `http://localhost:8888` (check console for token).

## 📖 Tutorial Contents

The main tutorial covers:

### 1. Setup and Imports
- Loading the Argo library
- Importing distributions and utilities

### 2. Probability Distributions
- Normal, Triangular, PERT distributions
- Discrete distributions (Binomial, Poisson)
- Sampling and parameter validation

### 3. Statistical Analysis
- Risk metrics (VaR, CVaR)
- Confidence intervals
- Distribution fitting

### 4. Monte Carlo Simulation
- Simple simulations
- Complex dependencies
- Correlated variables
- Progress reporting

### 5. Real-World Examples
- Construction project cost estimation
- Software development timeline
- Budget risk analysis

## 🎯 Learning Path

**Beginner:**
1. Start with Section 2 (Probability Distributions)
2. Try Section 4.1 (Simple Simulation)
3. Experiment with Section 3 (Statistical Analysis)

**Intermediate:**
4. Work through Section 4.2 (Complex Simulation)
5. Try Section 4.3 (Correlated Variables)

**Advanced:**
6. Complete Section 5 (Real-World Examples)
7. Adapt examples to your own use cases
8. Build custom simulations

## 💡 Tips

- **Reproducibility:** All examples use seeded RNGs - change the seed to see different results
- **Performance:** Try increasing iteration counts (10k → 100k) to see performance
- **Customization:** Modify distribution parameters to match your scenarios
- **Formulas:** Use any JavaScript expression in formula variables

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
jupyter notebook
```

### Module not found
The notebook imports from the local `packages/argo-core` directory. Make sure:
1. You're running Jupyter from the project root
2. Dependencies are installed (`npm install`)
3. The package has been built (`npm run build` if needed)

## 📊 Visualizing Results

While the core library doesn't include visualization, you can export results and visualize with:

- **JavaScript:** Plotly, Chart.js, D3.js
- **Python:** matplotlib, seaborn (export JSON and import in Python)
- **Excel:** Export CSV and create charts

Example: Export simulation results to JSON:
```typescript
// In a notebook cell
const fs = require('fs');
fs.writeFileSync('results.json', JSON.stringify(result, null, 2));
```

## 🚀 What's Next?

After completing the tutorial:

1. **Explore the source code:** `/packages/argo-core/src/`
2. **Read the tests:** `/packages/argo-core/tests/` for more examples
3. **Check the docs:** `/docs/` for detailed specifications
4. **Build your model:** Adapt examples to your use case
5. **Share feedback:** Open an issue on GitHub

## 📝 Creating Your Own Notebooks

Feel free to create additional notebooks in this directory:

```bash
# Create a new notebook
jupyter notebook notebooks/my-analysis.ipynb
```

Example use cases:
- Portfolio risk analysis
- Project scheduling
- Cost estimation
- Quality control
- Reliability engineering

## 🤝 Contributing

Found an issue or want to add a tutorial? Contributions welcome!

1. Fork the repo
2. Create a new notebook or improve existing ones
3. Test thoroughly
4. Submit a pull request

## 📚 Additional Resources

- **Argo Documentation:** `/docs/ARCHITECTURE.md`
- **API Reference:** `/docs/REQUIREMENTS.md`
- **Test Examples:** `/packages/argo-core/tests/`
- **Roadmap:** `/ROADMAP.md`

---

**Happy Simulating!** 🎲
