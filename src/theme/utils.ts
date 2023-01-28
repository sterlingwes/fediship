import {useContext, useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {ThemeContext} from './context';
import {StyleCreator, ValidColor} from './types';

export const useThemeGetters = () => {
  const theme = useContext(ThemeContext);

  return useMemo(() => {
    return Object.freeze({
      getColor: (color: ValidColor) => theme.palette[color],
      scheme: theme.activeScheme,
    });
  }, [theme.palette, theme.activeScheme]);
};

export const useThemeStyle = (styleCreator: StyleCreator) => {
  const themeApi = useThemeGetters();

  const styles = useMemo(() => {
    return StyleSheet.create(styleCreator(themeApi));
  }, [styleCreator, themeApi]);

  return styles;
};

export const useTheme = () => {
  return useContext(ThemeContext);
};
