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
  console.log('🚀 Office.onReady called', { host: info.host, platform: info.platform });

  const container = document.getElementById('root');
  if (!container) {
    console.error('❌ Root container not found');
    return;
  }

  // Allow rendering in browser for development (when not in Excel)
  const isInExcel = info.host === Office.HostType.Excel;
  const isDevelopment = import.meta.env.DEV;

  console.log('📊 Environment check:', { isInExcel, isDevelopment });

  if (isInExcel || isDevelopment) {
    console.log('✅ Rendering app...');
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <ThemeProvider theme={argoTheme}>
          <App />
        </ThemeProvider>
      </React.StrictMode>
    );
  } else {
    console.warn('⚠️ App only renders in Excel or development mode');
  }
});
