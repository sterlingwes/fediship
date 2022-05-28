import React, {useState} from 'react';
import {ColorSchemeName, useColorScheme} from 'react-native';
import {
  retrieveChosenScheme,
  retrieveUseSystemTheme,
  saveChosenScheme,
  saveUseSystemTheme,
} from '../storage/settings/appearance';
import {darkPalette} from './dark';
import {lightPalette} from './light';
import {TThemeContext} from './types';

const themes = Object.freeze({
  light: lightPalette,
  dark: darkPalette,
});

export const ThemeContext = React.createContext<TThemeContext>({
  palette: darkPalette,
  activeScheme: null,
  chosenScheme: null,
  setChosenScheme: () => {},
  systemSetting: true,
  setUseSystemSetting: () => {},
});

export const ThemeProvider = ({children}: {children: JSX.Element}) => {
  const scheme = useColorScheme();
  const [chosenScheme, setChosenScheme] = useState<ColorSchemeName>(
    retrieveChosenScheme(),
  );
  const [systemSetting, setUseSystemSetting] = useState(
    retrieveUseSystemTheme(),
  );

  const activeScheme =
    (systemSetting ? scheme : chosenScheme) || chosenScheme || 'dark';

  return (
    <ThemeContext.Provider
      value={{
        palette: themes[activeScheme],
        activeScheme,
        chosenScheme,
        setChosenScheme: choice => {
          saveChosenScheme(choice);
          setChosenScheme(choice);
        },
        systemSetting,
        setUseSystemSetting: use => {
          saveUseSystemTheme(use);
          setUseSystemSetting(use);
        },
      }}>
      {children}
    </ThemeContext.Provider>
  );
};
