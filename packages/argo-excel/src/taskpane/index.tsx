import React from 'react';
import { createRoot } from 'react-dom/client';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import { ThemeProvider } from '@fluentui/react/lib/Theme';
import App from './App';
import { argoTheme } from './theme';
import './index.css';

// Initialize Fluent UI icons
initializeIcons();

// Office.js initialization
Office.onReady((info) => {
  if (info.host === Office.HostType.Excel) {
    const container = document.getElementById('root');
    if (container) {
      const root = createRoot(container);
      root.render(
        <React.StrictMode>
          <ThemeProvider theme={argoTheme}>
            <App />
          </ThemeProvider>
        </React.StrictMode>
      );
    }
  }
});
