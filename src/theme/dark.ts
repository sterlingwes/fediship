import {Theme as NavTheme} from '@react-navigation/native';

import {TThemeContext} from './types';

export const darkPalette: TThemeContext['palette'] = Object.freeze({
  base: '#282c37',
  baseHighlight: '#373D4C',
  baseAccent: '#59627B',
  primary: '#9baec8',
  secondary: '#d9e1e8',
  blueAccent: '#2b90d9',
  goldAccent: '#ca8f04',
  warning: '#ff5050',
  error: '#df405a',
  success: '#79bd9a',

  baseTextColor: '#E6EEF6',
  contrastTextColor: '#0F1014',

  shadowColor: '#0F1014',
});

export const darkNavigationTheme: NavTheme = Object.freeze({
  dark: true,
  colors: {
    primary: '#9baec8',
    background: '#282c37',
    card: '#282c37',
    text: '#E6EEF6',
    border: '#59627B',
    notification: '#2b90d9',
  },
});
