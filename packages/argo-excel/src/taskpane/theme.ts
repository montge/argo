import { createTheme, ITheme } from '@fluentui/react/lib/Styling';

/**
 * Argo Custom Theme - Booz Allen Hamilton Brand Colors
 *
 * Primary Teal: #01807e
 * Navy Blue: #263846
 * Medium Gray: #666666
 */
export const argoTheme: ITheme = createTheme({
  palette: {
    themePrimary: '#01807e',      // Teal - primary brand color
    themeLighterAlt: '#f0fafa',
    themeLighter: '#c5ebea',
    themeLight: '#96dbd9',
    themeTertiary: '#3fb8b5',
    themeSecondary: '#019b98',
    themeDarkAlt: '#017270',
    themeDark: '#01605f',
    themeDarker: '#014746',

    neutralLighterAlt: '#faf9f8',
    neutralLighter: '#f3f2f1',
    neutralLight: '#edebe9',
    neutralQuaternaryAlt: '#e1dfdd',
    neutralQuaternary: '#d0d0d0',
    neutralTertiaryAlt: '#c8c6c4',
    neutralTertiary: '#a19f9d',
    neutralSecondary: '#605e5c',
    neutralSecondaryAlt: '#666666',  // Medium gray
    neutralPrimaryAlt: '#3b3a39',
    neutralPrimary: '#323130',
    neutralDark: '#263846',          // Navy blue - secondary brand

    black: '#100e0d',                // Primary dark
    white: '#ffffff',

    // Accent colors for states
    accent: '#01807e',               // Teal
    redDark: '#d13438',              // Error red
    green: '#107c10',                // Success green
    yellow: '#ff8c00',               // Warning orange
  },
  semanticColors: {
    link: '#01807e',
    linkHovered: '#019b98',
  }
});
