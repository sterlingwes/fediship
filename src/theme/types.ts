import {ColorValue, StyleSheet} from 'react-native';

export interface TThemeContext {
  palette: {
    base: ColorValue;
    baseHighlight: ColorValue;
    baseAccent: ColorValue;
    primary: ColorValue;
    secondary: ColorValue;
    blueAccent: ColorValue;
    goldAccent: ColorValue;
    warning: ColorValue;
    error: ColorValue;
    success: ColorValue;

    baseTextColor: ColorValue;
    contrastTextColor: ColorValue;
  };
}

export type ValidColor = keyof TThemeContext['palette'];

interface StyleCreatorApi {
  getColor: (colorName: ValidColor) => ColorValue;
}

type StyleSheetValue = Parameters<typeof StyleSheet.create>[0];

export type StyleCreator = (api: StyleCreatorApi) => StyleSheetValue;
