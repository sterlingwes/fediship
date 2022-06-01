import {Theme as NavTheme} from '@react-navigation/native';

import {TThemeContext} from './types';

export const lightPalette: TThemeContext['palette'] = Object.freeze({
  base: '#E4EBF1',
  baseHighlight: '#C5D8E8',
  baseAccent: '#8AB1D0',
  primary: '#373D4C',
  secondary: '#59627B',
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
    primary: '#373D4C',
    background: '#E4EBF1',
    card: '#E4EBF1',
    text: '#0F1014',
    border: '#C5D8E8',
    notification: '#2b90d9',
  },
});
