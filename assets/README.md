# Argo Assets

This directory contains all visual assets for the Argo Monte Carlo Simulation add-in for Microsoft Excel.

## Directory Structure

```
assets/
├── icons/              # Application icons and ribbon commands
├── distributions/      # Distribution type icons (14 types)
├── ui-states/         # UI state indicators (loading, error, success, warning)
├── build-scripts/     # Asset generation and optimization scripts
├── DESIGN_SYSTEM.md   # Complete design system documentation
└── README.md          # This file
```

## Asset Inventory

### Icons (Application & Ribbon)

**Logo (Argo):**
- `logo-16.png` - 16×16 - Taskpane icon
- `logo-32.png` - 32×32 - Small icon
- `logo-64.png` - 64×64 - Medium icon
- `logo-80.png` - 80×80 - Large icon
- `logo-128.png` - 128×128 - App icon
- `logo.svg` - SVG source

**Ribbon Commands (6 commands × 2 sizes = 12 files):**
- `ribbon-simulate-32.png` / `ribbon-simulate-80.png` - Run Simulation
- `ribbon-builder-32.png` / `ribbon-builder-80.png` - Distribution Builder
- `ribbon-dashboard-32.png` / `ribbon-dashboard-80.png` - Dashboard
- `ribbon-settings-32.png` / `ribbon-settings-80.png` - Settings
- `ribbon-help-32.png` / `ribbon-help-80.png` - Help
- `ribbon-about-32.png` / `ribbon-about-80.png` - About

### Distribution Icons (14 types × 2 sizes = 28 files)

Each distribution has 24×24 and 48×48 (2x for high DPI) versions:

- `dist-normal-24.png` / `dist-normal-48.png` - Normal distribution
- `dist-uniform-24.png` / `dist-uniform-48.png` - Uniform distribution
- `dist-triangular-24.png` / `dist-triangular-48.png` - Triangular distribution
- `dist-lognormal-24.png` / `dist-lognormal-48.png` - LogNormal distribution
- `dist-exponential-24.png` / `dist-exponential-48.png` - Exponential distribution
- `dist-beta-24.png` / `dist-beta-48.png` - Beta distribution
- `dist-gamma-24.png` / `dist-gamma-48.png` - Gamma distribution
- `dist-weibull-24.png` / `dist-weibull-48.png` - Weibull distribution
- `dist-pareto-24.png` / `dist-pareto-48.png` - Pareto distribution
- `dist-pert-24.png` / `dist-pert-48.png` - PERT distribution
- `dist-binomial-24.png` / `dist-binomial-48.png` - Binomial distribution
- `dist-poisson-24.png` / `dist-poisson-48.png` - Poisson distribution
- `dist-geometric-24.png` / `dist-geometric-48.png` - Geometric distribution
- `dist-hypergeometric-24.png` / `dist-hypergeometric-48.png` - Hypergeometric distribution

### UI State Icons (4 states)

- `state-loading-24.png` - Loading spinner
- `state-error-24.png` - Error indicator
- `state-success-24.png` - Success checkmark
- `state-warning-24.png` - Warning triangle

### Build Scripts

- `generate-icon.sh` - Generate PNG sizes from SVG source
- `optimize-pngs.sh` - Optimize all PNG files
- `verify-assets.sh` - Verify all required assets exist

## Asset Generation

### Prerequisites

Install required tools:

```bash
# Ubuntu/Debian
sudo apt-get install imagemagick inkscape pngcrush optipng

# macOS
brew install imagemagick inkscape pngcrush optipng
```

### Generate Icons from SVG

```bash
# Generate all sizes from a single SVG
cd assets/build-scripts
./generate-icon.sh ../icons/logo.svg logo 16 32 64 80 128

# Generate ribbon command icon
./generate-icon.sh ribbon-simulate.svg ribbon-simulate 32 80
```

### Optimize All PNGs

```bash
cd assets/build-scripts
./optimize-pngs.sh
```

### Build All Assets

```bash
# From project root
npm run build:assets
```

## Design System

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for complete design guidelines including:

- Color palette (inspired by Booz Allen Hamilton)
- Typography specifications
- Icon design guidelines
- Accessibility requirements (WCAG 2.1 AA)
- File naming conventions

## Quick Reference

### Color Palette

- **Primary Dark:** `#100e0d` - Main icons and text
- **White:** `#ffffff` - Backgrounds
- **Accent Blue:** `#0078d4` - Interactive elements (Fluent UI)
- **Success Green:** `#107c10` - Success states
- **Warning Yellow:** `#ffaa44` - Warning states
- **Error Red:** `#d13438` - Error states

### Icon Sizes

- 16×16 - Small taskpane icons
- 24×24 - Distribution selectors
- 32×32 - Ribbon commands (standard DPI)
- 48×48 - Distribution icons (high DPI)
- 64×64 - Medium logo
- 80×80 - Ribbon commands (high DPI)
- 128×128 - Large app icon

### File Naming Convention

```
{type}-{name}-{size}.{ext}

Examples:
logo-128.png
ribbon-simulate-32.png
dist-normal-24.png
state-success-24.png
```

## Quality Standards

All assets must meet:

- ✅ **Clarity:** Recognizable at smallest size (16×16)
- ✅ **Transparency:** PNG with alpha channel
- ✅ **Optimization:** <10KB per icon
- ✅ **Source:** SVG source file committed
- ✅ **Naming:** Follow naming conventions
- ✅ **Accessibility:** WCAG 2.1 AA contrast ratios
- ✅ **Compatibility:** Test on light and dark backgrounds

## Asset Status

| Category | Total Files | Status | Progress |
|----------|-------------|--------|----------|
| Logo | 6 files | ⏳ Pending | 0/6 |
| Ribbon Icons | 12 files | ⏳ Pending | 0/12 |
| Distribution Icons | 28 files | ⏳ Pending | 0/28 |
| UI State Icons | 4 files | ⏳ Pending | 0/4 |
| **Total** | **50 files** | **⏳ Sprint 8** | **0/50** |

## Contributing

When adding new assets:

1. Design SVG source at high resolution
2. Run generation script for all required sizes
3. Optimize PNGs with `optimize-pngs.sh`
4. Update asset inventory in this README
5. Verify quality checklist in DESIGN_SYSTEM.md
6. Commit both SVG source and generated PNGs

## Tools & Resources

### Design Tools
- **Inkscape** - Free SVG editor
- **ImageMagick** - Command-line image manipulation
- **GIMP** - Advanced raster editing (if needed)

### GenAI Resources
- **Claude (Anthropic)** - Icon concept generation
- **DALL-E / Midjourney** - Visual concept exploration

### References
- [Fluent UI Icons](https://aka.ms/fluentui-icons)
- [Office Add-in Icons](https://docs.microsoft.com/en-us/office/dev/add-ins/design/add-in-icons)
- [Material Design Icons](https://material.io/icons/)

## Version History

| Version | Date | Changes | Files Added |
|---------|------|---------|-------------|
| 1.0 | 2025-10-09 | Initial asset structure | 0 |

---

**Next Steps:**
1. Generate logo concepts using GenAI
2. Create SVG sources for all icons
3. Run build scripts to generate PNG sizes
4. Verify all assets meet quality standards
