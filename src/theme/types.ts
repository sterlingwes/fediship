import {ColorSchemeName, ColorValue, StyleSheet} from 'react-native';

export interface TThemeContext {
  palette: {
    base: ColorValue;
    baseHighlight: ColorValue;
    baseAccent: ColorValue;
    contrastAccent: ColorValue;
    primary: ColorValue;
    secondary: ColorValue;
    blueAccent: ColorValue;
    goldAccent: ColorValue;
    warning: ColorValue;
    error: ColorValue;
    success: ColorValue;

    baseTextColor: ColorValue;
    contrastTextColor: ColorValue;
    shadowColor: ColorValue;
  };

  activeScheme: ColorSchemeName;
  chosenScheme: ColorSchemeName;
  setChosenScheme: (scheme: ColorSchemeName) => void;
  systemSetting: boolean;
  setUseSystemSetting: (use: boolean) => void;
}

export type ValidColor = keyof TThemeContext['palette'];

export interface StyleCreatorApi {
  getColor: (colorName: ValidColor) => ColorValue;
}

type StyleSheetValue = Parameters<typeof StyleSheet.create>[0];

export type StyleCreator = (api: StyleCreatorApi) => StyleSheetValue;
