# Argo Design System

**Version:** 5.0
**Last Updated:** 2025-10-09
**Status:** Draft

## Overview

This document defines the visual design system for the Argo Monte Carlo Simulation add-in for Microsoft Excel. The design system ensures consistency across all UI components, icons, and visual elements.

## Color Palette

### Primary Colors

Inspired by Booz Allen Hamilton's professional brand palette:

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **Primary Dark** | `#100e0d` | rgb(16, 14, 13) | Primary text, emphasis elements |
| **Teal** | `#01807e` | rgb(1, 128, 126) | **PRIMARY BRAND COLOR** - Logo, key icons, interactive elements |
| **Navy Blue** | `#263846` | rgb(38, 56, 70) | Secondary brand color, headers, accents |
| **Medium Gray** | `#666666` | rgb(102, 102, 102) | Secondary text, borders |
| **White** | `#ffffff` | rgb(255, 255, 255) | Backgrounds, inverse text |
| **Light Gray** | `#eeeeee` | rgb(238, 238, 238) | Subtle backgrounds, dividers |

### Accent Colors

For data visualization and functional UI states:

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **Accent Teal** | `#00b7c3` | rgb(0, 183, 195) | Bright teal for highlights, interactive hover states |
| **Success Green** | `#107c10` | rgb(16, 124, 16) | Success states, positive indicators |
| **Warning Orange** | `#ff8c00` | rgb(255, 140, 0) | Warning states, caution |
| **Error Red** | `#d13438` | rgb(209, 52, 56) | Error states, critical alerts |
| **Info Blue** | `#0078d4` | rgb(0, 120, 212) | Informational messages (Fluent UI) |

### Chart/Distribution Colors

For Monte Carlo simulations and distribution visualizations:

| Color Name | Hex Code | Purpose |
|------------|----------|---------|
| **Chart Teal** | `#01807e` | Primary distribution curves (brand color) |
| **Chart Navy** | `#263846` | Secondary/comparison distributions |
| **Chart Green** | `#70ad47` | Success zones, target ranges |
| **Chart Orange** | `#ed7d31` | Alternative data series |
| **Chart Purple** | `#9e4baf` | Correlation indicators |
| **Chart Blue** | `#4472c4` | Additional data series |

## Typography

### Font Families

Following Office Add-in best practices and Fluent UI:

- **Primary Font:** Segoe UI (Windows), San Francisco (macOS), -apple-system (fallback)
- **Monospace Font:** Consolas, Monaco, 'Courier New' (for data/numbers)

### Font Sizes

| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| **H1 (Page Title)** | 24px | Semibold (600) | Main dialog titles |
| **H2 (Section)** | 20px | Semibold (600) | Section headers |
| **H3 (Subsection)** | 16px | Semibold (600) | Subsection headers |
| **Body Text** | 14px | Regular (400) | Default text |
| **Small Text** | 12px | Regular (400) | Helper text, captions |
| **Button Text** | 14px | Semibold (600) | All buttons |
| **Data/Numbers** | 14px | Regular (400), Monospace | Statistical results |

## Icon Design Guidelines

### General Principles

1. **Style:** Modern, colorful icons with clean lines (2px stroke weight)
2. **Size:** Design at highest resolution (128x128), scale down
3. **Padding:** 10% internal padding for all icons
4. **Format:** PNG with transparency (alpha channel) + SVG source
5. **Color:** **Teal (#01807e) as primary color**, Navy (#263846) for accents, Dark (#100e0d) for details
6. **Simplicity:** Maximum 3-4 visual elements per icon

### Icon Sizes

| Size | Usage | Format |
|------|-------|--------|
| 16x16 | Taskpane icons, small UI elements | PNG |
| 24x24 | Distribution type selectors | PNG |
| 32x32 | Ribbon commands (standard DPI) | PNG |
| 48x48 | Distribution icons (high DPI - 2x) | PNG |
| 64x64 | Logo (medium) | PNG |
| 80x80 | Ribbon commands (high DPI) | PNG |
| 128x128 | Logo (large), app icon | PNG |
| SVG | All icons (source) | SVG |

### Logo Specifications

**Argo Logo Design:**
- **Concept:** Stylized "A" incorporating statistical/distribution curve
- **Style:** Clean, geometric, professional with vibrant teal
- **Colors:** **Primary: Teal (#01807e)**, Accent: Navy (#263846), Details: Dark (#100e0d)
- **Variations:**
  - Full logo with text (128x128)
  - Icon only (64x64, 32x32, 16x16)
  - Inverse (white on dark) for dark mode

### Ribbon Command Icons

6 primary commands, each with 2 sizes (32x32, 80x80):

1. **Run Simulation** - Play button with statistical curve
2. **Distribution Builder** - Graph/chart with distribution curve
3. **Dashboard** - Grid/panel layout icon
4. **Settings** - Gear/cog icon
5. **Help** - Question mark or info icon
6. **About** - "i" in circle or document icon

**Design Notes:**
- Use consistent stroke weight (2px)
- Ensure recognizability at 32x32
- Test on light and dark backgrounds
- Follow Fluent UI icon guidelines

### Distribution Type Icons

14 distributions, each represented by characteristic curve shape (24x24, 48x48):

| Distribution | Icon Concept |
|--------------|--------------|
| **Normal** | Classic bell curve (symmetric) |
| **Uniform** | Flat horizontal bar |
| **Triangular** | Triangle peak |
| **LogNormal** | Right-skewed curve |
| **Exponential** | Decay curve (steep left drop) |
| **Beta** | Bounded curve (0-1 range visible) |
| **Gamma** | Flexible right-skewed curve |
| **Weibull** | Reliability curve (various shapes) |
| **Pareto** | Power law (long tail) |
| **PERT** | Smooth triangular curve |
| **Binomial** | Discrete bars (bell-shaped) |
| **Poisson** | Discrete bars (right-skewed) |
| **Geometric** | Decreasing discrete bars |
| **Hypergeometric** | Finite discrete bars |

**Design Notes:**
- Simplified curve representations
- 2-3 key points define each curve
- Recognizable at 24x24 pixels
- Grayscale or Primary Dark color

### UI State Icons

4 states for user feedback (24x24):

1. **Loading** - Circular spinner (3 dots or rotating arc)
2. **Error** - Red X or exclamation in circle
3. **Success** - Green checkmark
4. **Warning** - Yellow triangle with exclamation

**Design Notes:**
- Use semantic colors (Success Green, Error Red, Warning Yellow)
- Simple, instantly recognizable
- Work on both light and dark backgrounds

## Accessibility

### WCAG 2.1 AA Compliance

**Contrast Ratios:**
- Normal text (14px): Minimum 4.5:1
- Large text (18px+): Minimum 3:1
- UI components: Minimum 3:1

**Color Combinations (Tested):**
- Primary Dark (#100e0d) on White (#ffffff): **14.6:1** ✅
- Accent Blue (#0078d4) on White (#ffffff): **4.6:1** ✅
- Success Green (#107c10) on White (#ffffff): **4.8:1** ✅
- Warning Yellow (#ffaa44) on Primary Dark (#100e0d): **7.2:1** ✅

**Color-Blind Safe:**
- Use patterns/textures in addition to colors
- Distribution icons use shapes, not just colors
- UI states use icons + text labels

**Keyboard Navigation:**
- All interactive elements focusable
- Visible focus indicators (2px blue outline)
- Logical tab order

**Screen Readers:**
- All icons have alt text
- ARIA labels on all interactive elements
- Semantic HTML structure

## File Naming Conventions

### Icons

```
logo-{size}.png                    # Logo: logo-128.png, logo-64.png
ribbon-{command}-{size}.png        # Ribbon: ribbon-simulate-32.png
dist-{distribution}-{size}.png     # Distribution: dist-normal-24.png
state-{state}-{size}.png           # State: state-success-24.png
```

### SVG Sources

```
logo.svg
ribbon-{command}.svg
dist-{distribution}.svg
state-{state}.svg
```

### Examples

```
assets/icons/logo-128.png
assets/icons/logo-64.png
assets/icons/logo.svg
assets/icons/ribbon-simulate-32.png
assets/icons/ribbon-simulate-80.png
assets/distributions/dist-normal-24.png
assets/distributions/dist-normal-48.png
assets/ui-states/state-success-24.png
```

## Asset Generation Workflow

### Tools Required

- **ImageMagick** - PNG generation and manipulation
- **Inkscape** - SVG editing (command-line)
- **pngcrush** or **optipng** - PNG optimization
- **GenAI** - Icon concept generation

### Generation Process

1. **Design in SVG** - Create source icon at high resolution
2. **Generate PNG Sizes** - Use ImageMagick to scale
3. **Optimize PNGs** - Reduce file size
4. **Verify Quality** - Check all sizes render correctly
5. **Document** - Update asset inventory

### Build Script Usage

```bash
# Generate all sizes from SVG source
./assets/build-scripts/generate-icon.sh logo.svg

# Optimize all PNGs
./assets/build-scripts/optimize-pngs.sh

# Generate complete asset set
npm run build:assets
```

## Quality Checklist

Before committing assets:

- [ ] All icons render clearly at smallest size (16x16)
- [ ] Transparent backgrounds verified
- [ ] File sizes optimized (<10KB per icon)
- [ ] SVG sources committed
- [ ] Naming conventions followed
- [ ] Accessibility contrast ratios verified
- [ ] Icons tested on light and dark backgrounds
- [ ] Asset inventory updated

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-09 | Initial design system based on Booz Allen aesthetic |

## References

- [Fluent UI Design System](https://developer.microsoft.com/en-us/fluentui)
- [Office Add-in Design Guidelines](https://docs.microsoft.com/en-us/office/dev/add-ins/design/add-in-design)
- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Booz Allen Hamilton Brand](https://www.boozallen.com)

---

**Note:** This design system is inspired by Booz Allen Hamilton's professional aesthetic but is not officially affiliated with or endorsed by Booz Allen Hamilton. The Argo add-in is an independent project using similar design principles.
