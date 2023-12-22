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

// RN 72 styles.create returns a strict object type
// need to do a bunch of type work to conform to chg
type LooseStyles = any;

export const useThemeStyle = (styleCreator: StyleCreator) => {
  const themeApi = useThemeGetters();

  const styles = useMemo(() => {
    return StyleSheet.create(styleCreator(themeApi));
  }, [styleCreator, themeApi]);

  return styles as LooseStyles;
};

export const useTheme = () => {
  return useContext(ThemeContext);
};
