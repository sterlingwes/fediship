import {Theme as NavTheme} from '@react-navigation/native';

import {TThemeContext} from './types';

export const lightPalette: TThemeContext['palette'] = Object.freeze({
  base: '#fffbf5',
  baseHighlight: '#FFEDD1',
  baseAccent: '#f8ce8a',
  contrastAccent: '#4f8722',
  primary: '#0b4f6c',
  secondary: '#b02e0c',
  blueAccent: '#0b4f6c',
  goldAccent: '#d9ae21',
  warning: '#ff5050',
  error: '#df405a',
  success: '#418054',

  baseTextColor: '#0F1014',
  contrastTextColor: '#fffbf5',

  shadowColor: '#0F1014',
});

export const lightNavigationTheme: NavTheme = Object.freeze({
  dark: false,
  colors: {
    primary: '#373D4C',
    background: '#fffbf5',
    card: '#FFEDD1',
    text: '#0F1014',
    border: '#f8ce8a',
    notification: '#0b4f6c',
  },
});
