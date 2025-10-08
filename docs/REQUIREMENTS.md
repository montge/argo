# Argo for Office 365 Excel - Requirements Document

**Version:** 5.0
**Target Platform:** Office 365 Excel (Modern Web + Desktop)
**Status:** Modern Rebuild Phase
**Last Updated:** 2025-10-07

## Acknowledgment

This project represents a **modern rebuild using Claude Code (AI)** to recreate Argo based on available documentation. The original Argo (v1.0 through v4.3.1) was built for Excel 2007-2016 using .NET technologies that are not suitable for modern Office 365, and this document captures requirements for a rebuild targeting Office 365.

---

## 1. Project Overview

### 1.1 Purpose
Argo is a Monte Carlo simulation add-in for Microsoft Excel that enables:
- Interactive decision support and risk analysis
- Real-time scenario modeling during collaborative sessions
- Statistical analysis integrated seamlessly with Excel workflows

### 1.2 Original System (Legacy)
- **Platform:** Excel 2007-2016 (32-bit)
- **Technology Stack:**
  - ExcelDNA (MIT License) - .NET-Excel integration
  - MathNet.Numerics (MIT License) - Mathematical functions
  - Xceed.WPF.Toolkit (MS-PL) - WPF UI components
  - .NET Framework 4
- **Operating System:** Windows XP or newer

### 1.3 Target System (Modern)
- **Primary Platform:** Office 365 Excel (Desktop + Web)
- **Extended Integrations:** Project management platforms (Phase 2-3)
  - Microsoft Project 365 (Desktop + Web)
  - JIRA (Self-hosted + Cloud)
  - Oracle Primavera P6 (EPPM + Cloud)
- **Technology Stack:**
  - Office Add-ins (Web-based using Office.js)
  - TypeScript/JavaScript
  - Modern web frameworks (React recommended)
  - Statistical computation library (custom + math.js)
  - REST API adapters for PM platforms
- **Operating System:** Cross-platform (Windows primary, with Web support)

**Note:** See [INTEGRATIONS.md](INTEGRATIONS.md) for detailed requirements on project management platform integrations.

---

## 2. Functional Requirements

### 2.1 Core Simulation Engine

#### FR-001: Monte Carlo Simulation
- **Priority:** Critical
- **Description:** Execute Monte Carlo simulations on Excel cell ranges
- **Details:**
  - Support variable number of iterations (user-configurable: 100 to 100,000+)
  - Leverage Excel's calculation dependency chain
  - Update results dynamically as input cells change
  - Provide progress indication for long-running simulations

#### FR-002: Probability Distribution Functions
- **Priority:** Critical
- **Description:** Implement 35+ probability distribution spreadsheet functions
- **Distributions Required:**
  - **Continuous:** Normal, Log-Normal, Uniform, Triangular, Beta, Gamma, Exponential, Weibull, Pareto, Cauchy, Chi-Squared, Student's T, F-Distribution
  - **Discrete:** Binomial, Poisson, Geometric, Hypergeometric, Discrete Uniform, Custom Discrete
  - **Special:** Empirical, Historical Data, PERT
- **Function Format:** Excel UDF (User Defined Functions) like `=ARGO.NORMAL(mean, stddev)`

#### FR-003: Statistical Analysis Functions
- **Priority:** Critical
- **Description:** Provide 50+ statistical analysis functions
- **Categories:**
  - **Descriptive Statistics:** Mean, Median, Mode, Std Dev, Variance, Skewness, Kurtosis, Percentiles
  - **Distributions Analysis:** PDF, CDF, Inverse CDF, Random sampling
  - **Confidence Intervals:** Parametric and non-parametric intervals
  - **Sensitivity Analysis:** Correlation coefficients, regression statistics
  - **Risk Metrics:** VaR (Value at Risk), CVaR, probability of target achievement

#### FR-004: Rank Correlation
- **Priority:** High
- **Description:** Model interdependencies between input variables
- **Details:**
  - Support Pearson, Spearman rank correlation
  - Allow users to define correlation matrices
  - Preserve correlation structure during simulation
  - Validate correlation matrix for positive semi-definiteness

### 2.2 User Interface

#### FR-005: Ribbon Integration
- **Priority:** Critical
- **Description:** Custom Office ribbon tab for Argo controls
- **Controls Required:**
  - Start/Stop Simulation button
  - Settings/Configuration button
  - Distribution Builder button
  - Results Analyzer button
  - Help/Documentation button

#### FR-006: Distribution Builder Dialog
- **Priority:** High
- **Description:** Graphical interface for defining probability distributions
- **Features:**
  - Visual distribution preview (histogram/curve)
  - Parameter input fields with validation
  - Common templates (optimistic/pessimistic scenarios)
  - Distribution fitting from historical data
  - Save/Load distribution definitions

#### FR-007: Output Analysis Dashboard
- **Priority:** High
- **Description:** Interactive dashboard for simulation results
- **Components:**
  - Histogram/frequency distribution charts
  - Cumulative distribution curves
  - Statistical summary tables
  - Percentile markers
  - Tornado charts (sensitivity analysis)
  - Scatter plots (correlation analysis)

#### FR-008: Task Pane Interface
- **Priority:** Medium
- **Description:** Persistent side panel for quick access
- **Features:**
  - Simulation status monitor
  - Quick distribution selector
  - Recent simulations list
  - Parameter quick-edit

### 2.3 Integration & Compatibility

#### FR-009: Excel Formula Integration
- **Priority:** Critical
- **Description:** Seamless integration with native Excel formulas
- **Details:**
  - Functions appear in Excel formula autocomplete
  - Support for array formulas
  - Compatible with Excel tables and named ranges
  - Work with Excel's dependency tracking

#### FR-010: Existing Spreadsheet Support
- **Priority:** Critical
- **Description:** Enable simulation on existing spreadsheets without major restructuring
- **Details:**
  - Non-intrusive cell marking for distributions
  - Preserve existing formulas and formatting
  - Support add-in disable/enable without breaking spreadsheet

#### FR-011: Data Export
- **Priority:** Medium
- **Description:** Export simulation results to various formats
- **Formats:**
  - Excel tables (native)
  - CSV
  - JSON (for programmatic access)
  - PNG/SVG charts

### 2.4 Performance

#### FR-012: Real-Time Interactivity
- **Priority:** High
- **Description:** Enable "blazing fast" simulation updates
- **Targets:**
  - <1 second for simple models (10,000 iterations)
  - <10 seconds for complex models (50,000 iterations)
  - Background calculation support
  - Web Workers for Excel Desktop

#### FR-013: Scalability
- **Priority:** Medium
- **Description:** Handle complex simulation models
- **Limits:**
  - Support 100+ uncertain input cells
  - Support 50+ output cells simultaneously
  - Handle spreadsheets with 10,000+ formula cells

---

## 3. Non-Functional Requirements

### 3.1 Usability

#### NFR-001: Ease of Use
- Intuitive UI requiring minimal training
- Contextual help and tooltips
- Function documentation accessible from Excel
- Sample templates/workbooks included

#### NFR-002: Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- WCAG 2.1 Level AA compliance

### 3.2 Performance

#### NFR-003: Responsiveness
- UI remains responsive during simulation
- Progress indication for operations >2 seconds
- Cancellation support for long operations

#### NFR-004: Memory Efficiency
- Efficient memory management for large simulations
- Avoid memory leaks in long sessions
- Graceful degradation on low-memory systems

### 3.3 Reliability

#### NFR-005: Stability
- No crashes or data loss during normal operation
- Automatic recovery from add-in failures
- Validation of user inputs to prevent errors

#### NFR-006: Accuracy
- Statistical accuracy verified against known distributions
- Reproducible results with seed control
- Numerical stability for edge cases

### 3.4 Security

#### NFR-007: Data Privacy
- All calculations performed client-side (no external servers)
- No collection of user data or spreadsheets
- No network calls except for updates/telemetry (opt-in)

#### NFR-008: Code Signing
- Digitally signed add-in package
- Verify integrity during installation
- Trusted publisher certificate

### 3.5 Maintainability

#### NFR-009: Code Quality
- Modern TypeScript with strict type checking
- Comprehensive unit test coverage (>80%)
- Automated integration tests
- Clear documentation and comments

#### NFR-010: Extensibility
- Plugin architecture for custom distributions
- API for programmatic access
- Custom function registration system

---

## 4. Technical Architecture

### 4.1 Technology Stack

#### Office Add-ins Platform
- **Framework:** Office.js (JavaScript API for Office)
- **Manifest:** XML-based add-in manifest (Office Add-in manifest v1.1+)
- **Hosting:** Local web server (development) / CDN (production)

#### Frontend
- **Language:** TypeScript 5.x
- **Framework:** React 18+ with Hooks
- **UI Library:** Fluent UI React (Microsoft's design system)
- **State Management:** React Context API + useReducer or Zustand
- **Charting:** Recharts or Chart.js

#### Computation
- **Statistical Library:** Custom implementation + math.js
- **Random Number Generation:** Crypto-secure RNG with seedable fallback
- **Web Workers:** For parallel simulation execution

#### Build & Development
- **Build Tool:** Vite or Webpack 5
- **Package Manager:** npm or pnpm
- **Linting:** ESLint + Prettier
- **Testing:** Jest + React Testing Library
- **E2E Testing:** Playwright

### 4.2 Architecture Patterns

#### Add-in Structure
```
argo-office365/
├── manifest.xml           # Office Add-in manifest
├── src/
│   ├── taskpane/         # Task pane UI
│   ├── commands/         # Ribbon commands
│   ├── functions/        # Custom Excel functions
│   ├── engine/           # Simulation engine
│   ├── distributions/    # Probability distributions
│   ├── stats/            # Statistical functions
│   └── utils/            # Utilities
├── assets/               # Icons, images
├── tests/                # Test suites
└── docs/                 # Documentation
```

#### Component Architecture
- **Presentation Layer:** React components (UI)
- **Business Logic Layer:** Service classes (simulation, statistics)
- **Data Layer:** Excel workbook interaction (Office.js)
- **Computation Layer:** Web Workers (heavy calculations)

### 4.3 Multi-User Collaboration Design

#### Concurrent Development Guidelines
- **Feature Branches:** Each developer works on feature branches
- **Module Independence:** Core modules isolated (engine, UI, distributions)
- **Shared Interfaces:** Well-defined TypeScript interfaces
- **Mock Data:** Mock Excel API for local testing without Excel
- **Code Review:** PR-based workflow with automated checks
- **Documentation:** Each module has README and usage examples

---

## 5. Migration Considerations

### 5.1 From Legacy Argo

#### Breaking Changes
- Function names may change (Excel DNA → Office.js custom functions)
- Ribbon UI completely redesigned
- No VSTO/COM add-in support (Web-based only)

#### Compatibility Layer
- Provide legacy function aliases where possible
- Migration wizard for old Argo workbooks
- Documentation for function mapping

### 5.2 Cross-Platform Support

#### Excel Desktop (Windows/Mac)
- Full feature support
- Native performance with Web Workers
- Local file access

#### Excel Web
- Core simulation features supported
- Limited to online file storage
- Some performance constraints

---

## 6. Success Criteria

### 6.1 Minimum Viable Product (MVP)
- [ ] 20+ core probability distributions implemented
- [ ] 30+ statistical functions available
- [ ] Basic Monte Carlo simulation engine
- [ ] Ribbon UI with start/stop controls
- [ ] Simple output dashboard (histogram + stats)
- [ ] Works in Excel Desktop (Windows)

### 6.2 Full Release
- [ ] All 35+ distributions implemented
- [ ] All 50+ statistical functions
- [ ] Rank correlation support
- [ ] Advanced output analysis (tornado, scatter, etc.)
- [ ] Distribution builder UI
- [ ] Cross-platform (Windows, Mac, Web)
- [ ] Sample workbooks and documentation
- [ ] 80%+ test coverage

### 6.3 Performance Benchmarks
- [ ] 10,000 iterations in <1 second (simple model)
- [ ] 50,000 iterations in <10 seconds (complex model)
- [ ] UI responsive at all times
- [ ] Memory usage <500MB for typical models

---

## 7. Risks & Mitigation

### 7.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Office.js performance limitations | High | Medium | Optimize with Web Workers, benchmark early |
| Excel Web feature gaps | Medium | High | Prioritize Desktop, document limitations |
| Statistical accuracy issues | High | Low | Rigorous testing, reference implementations |
| Cross-platform compatibility | Medium | Medium | Test on all platforms regularly |

### 7.2 Project Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Incomplete original documentation | High | High | Reverse engineer from user perspective |
| Scope creep | Medium | High | Strict MVP definition, phased releases |
| Multi-user coordination | Low | Medium | Clear module boundaries, code reviews |

---

## 8. Open Questions

1. **Licensing:** Will this remain open source? Which license (MIT, Apache 2.0)?
2. **Distribution:** Microsoft AppSource or GitHub releases only?
3. **Telemetry:** Include anonymous usage analytics (opt-in)?
4. **Premium Features:** Any paid tier or all features free?
5. **Legacy Support:** Maintain compatibility with Excel 2016 desktop?
6. **Mobile:** Support Excel Mobile apps (iOS/Android)?

---

## 9. References

- Original Argo Landing Page: https://boozallen.github.io/argo
- Argo Wiki: https://github.com/boozallen/argo/wiki
- Office Add-ins Documentation: https://learn.microsoft.com/office/dev/add-ins/
- Office.js API Reference: https://learn.microsoft.com/javascript/api/office
- Excel Custom Functions: https://learn.microsoft.com/office/dev/add-ins/excel/custom-functions-overview

---

## 10. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-07 | Claude Code (AI) | Initial requirements document from modern rebuild |
