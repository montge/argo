# Excel add-in bundle size exceeds 500 kB recommendation (855 kB)

## Summary
The Excel add-in JavaScript bundle is 855 kB uncompressed (252 kB gzipped), exceeding Vite's 500 kB recommendation.

## Steps to Reproduce
```bash
cd packages/argo-excel
npm run build
```

## Expected Behavior
Bundle chunks should be < 500 kB for optimal loading performance.

## Actual Behavior
```
dist/assets/taskpane-flCCP5CX.js    855.53 kB │ gzip: 252.39 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking
- Adjust chunk size limit for this warning
```

## Root Cause
All dependencies (React, Fluent UI, Recharts, @argo/core) are bundled into a single chunk, causing a large initial download.

## Impact
- Slower initial add-in load time
- Poor user experience on slow connections
- Unnecessary download of code that may not be used immediately

## Proposed Solution

### Option 1: Route-Based Code Splitting (Recommended)
Split by tab/feature using dynamic imports:

```typescript
// In App.tsx
const SimulationTab = lazy(() => import('./components/SimulationTab'));
const ResultsTab = lazy(() => import('./components/ResultsTab'));
const SettingsTab = lazy(() => import('./components/SettingsTab'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      {selectedTab === 'simulation' && <SimulationTab />}
      {selectedTab === 'results' && <ResultsTab />}
      {selectedTab === 'settings' && <SettingsTab />}
    </Suspense>
  );
}
```

### Option 2: Vendor Chunk Separation
Split large dependencies into separate chunks in `vite.config.ts`:

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'fluent-ui': ['@fluentui/react'],
          'charts': ['recharts'],
          'core': ['@argo/core'],
        },
      },
    },
  },
});
```

### Option 3: Lazy Load Charts
Charts are only needed on Results tab, so load them on-demand:

```typescript
const ResultsChart = lazy(() => import('./components/ResultsChart'));
```

## Expected Impact
- **Initial bundle:** ~200-300 kB (React + Fluent UI essentials)
- **Lazy-loaded chunks:** 100-200 kB per tab
- **Faster perceived load time:** User sees UI while background chunks load

## Priority
**MEDIUM** - Performance optimization, affects user experience

## Labels
`performance`, `enhancement`, `build`

## Notes
- Gzipped size (252 kB) is acceptable for modern connections
- Route-based splitting provides best UX improvement
- Consider lazy loading Recharts (large library, only used in Results tab)
