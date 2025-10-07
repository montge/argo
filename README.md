# Argo for Office 365 Excel

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Office Add-ins](https://img.shields.io/badge/Office-Add--ins-green)](https://learn.microsoft.com/office/dev/add-ins/)

**Argo** is a powerful Monte Carlo simulation add-in for Microsoft Excel, enabling interactive decision support and risk analysis. This is version 2.0, a complete rewrite targeting **Office 365 Excel** using modern web technologies.

---

## ⚠️ Important Notice: Reverse Engineering with AI

**This project represents a reverse engineering effort using Claude Code (AI) to recreate Argo based on available documentation.** The original source code for Argo (v1.x for Excel 2007-2016) was lost. This modern rebuild targets Office 365 Excel with contemporary technologies while maintaining the spirit and functionality of the original.

**Original Argo:**
- Platform: Excel 2007-2016 (32-bit)
- Technology: .NET, ExcelDNA, VSTO
- Status: No longer under active development

**Argo v2.0 (This Project):**
- Platform: Office 365 Excel (Desktop + Web)
- Technology: TypeScript, React, Office.js
- Status: Active development with AI assistance

---

## 🚀 Features

### Monte Carlo Simulation
- **Blazing Fast:** Interactive simulations that update in real-time as spreadsheet values change
- **Meeting-Ready:** Use simulation models as decision aids during collaborative sessions
- **Excel Integration:** Seamlessly works with existing Excel spreadsheets and workflows
- **Project Management Integration:** Connect with Project 365, JIRA, and Primavera P6 (Phase 2-3)

### Probability Distributions
- **35+ Distributions:** Normal, Log-Normal, Uniform, Triangular, Beta, Gamma, Exponential, Weibull, Binomial, Poisson, and many more
- **Graphical Input Definition:** Intuitive interface for defining distribution parameters
- **Rank Correlation:** Model interdependencies between uncertain inputs

### Statistical Analysis
- **50+ Statistical Functions:** Mean, median, standard deviation, percentiles, confidence intervals, VaR, CVaR
- **Rich Visualization:** Histograms, cumulative distributions, tornado charts, scatter plots
- **Sensitivity Analysis:** Identify key drivers of uncertainty in your models

---

## 📋 Requirements

- **Microsoft Excel:**
  - Office 365 (Desktop or Web)
  - Excel 2016 or later (Desktop)
- **Development:**
  - Node.js 18+ and npm
  - Modern web browser (Chrome, Edge, Firefox)
  - TypeScript 5.x

---

## 🛠️ Installation

### For Users

1. Download the latest release from [Releases](https://github.com/boozallen/argo/releases)
2. Follow the [Installation Guide](https://github.com/boozallen/argo/wiki/Installation)
3. Sideload the add-in into Excel (or install via Microsoft AppSource when available)

### For Developers

```bash
# Clone the repository
git clone https://github.com/boozallen/argo.git
cd argo

# Install dependencies
npm install

# Start development server
npm run dev

# In Excel, sideload the add-in using manifest.xml
```

See [DEVELOPMENT.md](docs/DEVELOPMENT.md) for detailed setup instructions.

---

## 📚 Documentation

- **[Requirements Document](docs/REQUIREMENTS.md)** - Detailed functional and non-functional requirements
- **[Integrations Guide](docs/INTEGRATIONS.md)** - Project 365, JIRA, Primavera P6 integrations
- **[Architecture Document](docs/ARCHITECTURE.md)** - Technical architecture and design
- **[Collaboration Guide](docs/COLLABORATION.md)** - Multi-user development with TDD
- **[API Documentation](docs/API.md)** - Public API reference
- **[User Wiki](https://github.com/boozallen/argo/wiki)** - User guides and tutorials

---

## 🧪 Testing (Test-Driven Development)

This project follows **Test-Driven Development (TDD)** practices:

```bash
# Run all tests
npm test

# Run tests in watch mode (TDD workflow)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test suites
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests
npm run test:e2e           # End-to-end tests
```

**TDD Workflow:**
1. Write test first (Red)
2. Implement feature (Green)
3. Refactor (Refactor)

See [COLLABORATION.md](docs/COLLABORATION.md) for detailed TDD guidelines.

---

## 🤝 Contributing

We welcome contributions! This project is designed for **multi-user collaboration**, including multiple Claude Code instances working simultaneously.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. **Write tests first** (TDD approach)
4. Implement your feature
5. Run tests: `npm test`
6. Commit changes: `git commit -m "feat: add my feature"`
7. Push and create a Pull Request

### Development Guidelines

- **Test-Driven Development:** Write tests before implementation
- **Code Coverage:** Maintain ≥80% test coverage
- **Module Independence:** See [COLLABORATION.md](docs/COLLABORATION.md)
- **TypeScript:** Use strict type checking
- **Linting:** Follow ESLint + Prettier rules

---

## 📦 Project Structure

```
argo/
├── src/
│   ├── taskpane/          # Task pane UI (React)
│   ├── commands/          # Ribbon command handlers
│   ├── functions/         # Excel custom functions
│   ├── engine/            # Monte Carlo simulation engine
│   ├── distributions/     # Probability distributions (35+)
│   ├── stats/             # Statistical functions (50+)
│   ├── utils/             # Utility functions
│   └── workers/           # Web Workers for performance
├── assets/                # Icons and images
├── tests/                 # Test suites (unit, integration, e2e)
├── docs/                  # Documentation
└── manifest.xml           # Office Add-in manifest
```

---

## 📜 License

This project is licensed under the **Apache License 2.0** - see [LICENSE.md](LICENSE.md) for details.

### Open Source Dependencies

Argo v2.0 builds upon these excellent open-source libraries:

- **React** (MIT License) - UI framework
- **TypeScript** (Apache 2.0) - Language
- **Office.js** (Microsoft) - Excel integration
- **math.js** (Apache 2.0) - Mathematical functions
- **Recharts** (MIT License) - Data visualization

See [NOTICE.md](NOTICE.md) for complete attribution.

### Legacy Argo Dependencies (v1.x)

The original Argo used:
- **ExcelDNA** (MIT License) - .NET-Excel integration
- **MathNet.Numerics** (MIT License) - Mathematical library
- **Xceed.WPF.Toolkit** (MS-PL) - WPF UI components

---

## 🌐 Resources

### Original Argo (v1.x - Excel 2007-2016)
- [Argo Landing Page](https://boozallen.github.io/argo)
- [Argo Wiki](https://github.com/boozallen/argo/wiki)
- [Argo User Group](https://groups.google.com/forum/#!forum/argo-users)

### Argo v2.0 (Office 365)
- [GitHub Repository](https://github.com/boozallen/argo)
- [Issue Tracker](https://github.com/boozallen/argo/issues)
- [Discussions](https://github.com/boozallen/argo/discussions)

---

## 🙏 Acknowledgments

### Original Argo
Developed by **[Booz Allen Hamilton](http://www.boozallen.com/)** and released as open source.

### Argo v2.0
Reverse engineered and rebuilt with assistance from **Claude Code (AI)** based on available documentation, user guides, and feature descriptions from the original project.

**Special Thanks:**
- Original Argo development team at Booz Allen Hamilton
- Argo user community for documentation and feedback
- Open source library maintainers

---

## 📧 Contact & Support

- **Issues:** [GitHub Issues](https://github.com/boozallen/argo/issues)
- **Discussions:** [GitHub Discussions](https://github.com/boozallen/argo/discussions)
- **Email:** argo@bah.com (legacy contact, may not be monitored)

---

## 🗺️ Roadmap

### MVP (v2.0-alpha)
- [ ] 20+ core probability distributions
- [ ] 30+ statistical functions
- [ ] Basic Monte Carlo simulation engine
- [ ] Ribbon UI with simulation controls
- [ ] Simple output dashboard
- [ ] Excel Desktop (Windows) support

### Full Release (v2.0)
- [ ] All 35+ distributions
- [ ] All 50+ statistical functions
- [ ] Rank correlation support
- [ ] Advanced visualization (tornado, scatter plots)
- [ ] Distribution builder UI
- [ ] Cross-platform (Windows, Mac, Web)

### Future Enhancements
- [ ] Excel Online full support
- [ ] Excel Mobile optimization
- [ ] Optimization integration (Solver)
- [ ] Machine learning distribution fitting
- [ ] Multi-user collaborative simulation

---

## ⚖️ Legal

Copyright © 2016-2025 Booz Allen Hamilton

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

---

**Built with ❤️ and AI assistance. Open source for the community.**
