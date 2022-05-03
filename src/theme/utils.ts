import {useContext, useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {ThemeContext} from './context';
import {StyleCreator, ValidColor} from './types';

export const useThemeStyle = (styleCreator: StyleCreator) => {
  const theme = useContext(ThemeContext);

  const styles = useMemo(() => {
    const themeApi = Object.freeze({
      getColor: (color: ValidColor) => theme.palette[color],
    });

    return StyleSheet.create(styleCreator(themeApi));
  }, [styleCreator, theme.palette]);

  return styles;
};
