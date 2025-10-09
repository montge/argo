# @argo/excel - Excel Add-in

Monte Carlo Simulation Add-in for Microsoft Excel (Office 365)

## Features

- **Task Pane UI**: React-based interface with Fluent UI components
- **Custom Functions**: ARGO.NORMAL(), ARGO.UNIFORM(), ARGO.TRIANGULAR()
- **Booz Allen Brand**: Teal (#01807e) and Navy (#263846) color scheme
- **Office.js Integration**: Read/write Excel ranges, format cells
- **argo-core Integration**: Full access to 14+ probability distributions

## Development

### Prerequisites

- Node.js 18+ (for development on Linux/Mac/Windows)
- **Windows with Excel 365 NOT required** until Sprint 12 (testing/screenshots)

### Quick Start

```bash
# Install dependencies (from workspace root)
npm install

# Start dev server (HTTPS on port 3000)
cd packages/argo-excel
npm run dev

# Build for production
npm run build
```

### Sideloading (Sprint 12 - Windows Required)

**Note:** Sideloading requires Windows with Excel 365 Desktop. This will be done in Sprint 12.

1. Generate self-signed certificates for HTTPS:
   ```bash
   npm run generate-certs
   ```

2. Start dev server:
   ```bash
   npm run dev
   ```

3. In Excel:
   - File → Options → Trust Center → Trust Center Settings
   - Trusted Add-in Catalogs → Add network share
   - Load manifest.xml

## Architecture

```
src/
├── taskpane/          # Main UI (React + Fluent UI)
│   ├── App.tsx        # Main component
│   ├── theme.ts       # Booz Allen brand theme
│   └── index.tsx      # Entry point
├── functions/         # Custom Excel functions
│   └── functions.ts   # ARGO.* formulas
└── types/            # TypeScript definitions
```

## Custom Functions

```excel
=ARGO.NORMAL(100, 15)           # Normal distribution
=ARGO.UNIFORM(0, 100)           # Uniform distribution
=ARGO.TRIANGULAR(0, 50, 100)    # Triangular distribution
```

## Color Scheme

- **Primary Teal**: #01807e (buttons, headers, brand)
- **Navy Blue**: #263846 (accents, secondary elements)
- **Success Green**: #107c10
- **Error Red**: #d13438
- **Warning Orange**: #ff8c00

## Testing

```bash
# Unit tests (Jest + React Testing Library)
npm test

# Watch mode
npm run test:watch
```

## Office.js API

- Excel.run() - Batch API context
- context.workbook - Workbook object
- worksheet.getRange() - Get cell ranges
- range.values - Read/write values
- range.format - Cell formatting

## Sprint 9 Status

✅ Package structure created
✅ Vite + React + TypeScript configured
✅ Office.js integrated
✅ Manifest.xml with colorful icons
✅ Basic task pane UI with Fluent UI
✅ Connected to argo-core
⏳ Accessibility (keyboard navigation, ARIA)
⏳ Security review
⏳ Documentation notebook

## Next: Sprint 10

- Simulation controls UI
- Distribution selector
- Results dashboard with charts
- Additional custom functions
