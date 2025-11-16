# 145+ console warnings for unregistered Fluent UI icons in tests

## Summary
Test output is cluttered with Fluent UI icon registration warnings, making it difficult to spot real issues.

## Steps to Reproduce
```bash
cd packages/argo-excel
npm test
```

## Expected Behavior
Tests should run without icon registration warnings.

## Actual Behavior
145+ warnings like:
```
console.warn
  The icon "play" was used but not registered.
  See https://github.com/microsoft/fluentui/wiki/Using-icons for more information.
```

**Affected Icons:**
- `play`
- `clear`
- `settings`
- `barchartvertical`
- Many others used in components

## Root Cause
Fluent UI icons must be explicitly registered before use. Test environment doesn't initialize icons, causing warnings for every icon used in tested components.

## Proposed Solution

### Option 1: Register Icons in Test Setup (Recommended)
Create `packages/argo-excel/tests/setup.ts`:

```typescript
import { initializeIcons } from '@fluentui/react';

// Register all Fluent UI icons before tests run
initializeIcons();
```

Update `jest.config.js`:
```javascript
module.exports = {
  // ...
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};
```

### Option 2: Register Specific Icons
If bundle size is a concern, register only used icons:

```typescript
import { registerIcons } from '@fluentui/react';
import { PlayIcon, ClearIcon, SettingsIcon, BarChartIcon } from '@fluentui/react-icons-mdl2';

registerIcons({
  icons: {
    play: <PlayIcon />,
    clear: <ClearIcon />,
    settings: <SettingsIcon />,
    barchartvertical: <BarChartIcon />,
    // ... other icons
  }
});
```

### Option 3: Mock Icons in Tests
If icons aren't important for test logic:

```typescript
jest.mock('@fluentui/react', () => ({
  ...jest.requireActual('@fluentui/react'),
  Icon: () => <span data-testid="icon-mock" />,
}));
```

## Priority
**MEDIUM** - Quality of life issue, makes test output noisy

## Labels
`enhancement`, `testing`, `ui`, `developer-experience`

## Notes
- Does not affect functionality, only test output quality
- Makes it harder to spot real test failures
- Option 1 is simplest and most robust
