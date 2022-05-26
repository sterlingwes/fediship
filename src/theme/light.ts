import {Theme as NavTheme} from '@react-navigation/native';

import {TThemeContext} from './types';

export const lightPalette: TThemeContext['palette'] = Object.freeze({
  base: '#d9e1e8',
  baseHighlight: '#C8DAEB',
  baseAccent: '#b0c0cf',
  primary: '#649FC8',
  secondary: '#282c37',
  blueAccent: '#2b90d9',
  goldAccent: '#ca8f04',
  warning: '#ff5050',
  error: '#df405a',
  success: '#418054',

  baseTextColor: '#0F1014',
  contrastTextColor: '#E6EEF6',
});

export const lightNavigationTheme: NavTheme = Object.freeze({
  dark: false,
  colors: {
    primary: '#9bcbed',
    background: '#d9e1e8',
    card: '#d9e1e8',
    text: '#0F1014',
    border: '#b0c0cf',
    notification: '#2b90d9',
  },
});
