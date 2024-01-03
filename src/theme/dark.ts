import {Theme as NavTheme} from '@react-navigation/native';

import {TThemeContext} from './types';

export const darkPalette: TThemeContext['palette'] = Object.freeze({
  base: '#101010',
  baseHighlight: '#191919',
  baseAccent: '#616161',
  contrastAccent: '#2b90d9',
  primary: '#FFF',
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
    primary: '#FFF',
    background: '#101010',
    card: '#101010',
    text: '#E6EEF6',
    border: '#191919',
    notification: '#2b90d9',
  },
});
