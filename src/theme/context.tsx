import React from 'react';
import {useColorScheme} from 'react-native';
import {darkPalette} from './dark';
import {lightPalette} from './light';
import {TThemeContext} from './types';

const themes = Object.freeze({
  light: lightPalette,
  dark: darkPalette,
});

export const ThemeContext = React.createContext<TThemeContext>({
  palette: darkPalette,
});

export const ThemeProvider = ({children}: {children: JSX.Element}) => {
  const theme = useColorScheme();
  return (
    <ThemeContext.Provider value={{palette: themes[theme || 'dark']}}>
      {children}
    </ThemeContext.Provider>
  );
};
