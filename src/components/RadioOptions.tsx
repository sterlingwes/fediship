import React from 'react';
import {TouchableOpacity} from 'react-native';
import {StyleCreator} from '../theme/types';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {Box} from './Box';
import {Type} from './Type';

interface Props {
  options: RadioOption[];
  selection?: string; // id
  onPress: (id: string) => void;
}

export interface RadioOption {
  id: string;
  label: string;
  subLabel?: string;
}

export const RadioOptions = ({options, selection, onPress}: Props) => {
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();
  return (
    <Box>
      {options.map(option => (
        <TouchableOpacity
          key={option.id}
          activeOpacity={0.5}
          onPress={() => onPress(option.id)}>
          <Box fd="row" mv={10}>
            <Box pv={10}>
              <Box style={styles.optionCircle}>
                {option.id === selection ? (
                  <Box style={styles.optionCircleFilled} />
                ) : null}
              </Box>
            </Box>
            <Box ph={20} f={1} cv>
              <Type scale="S">{option.label}</Type>
              {!!option.subLabel && (
                <Type scale="XS" color={getColor('primary')}>
                  {option.subLabel}
                </Type>
              )}
            </Box>
          </Box>
        </TouchableOpacity>
      ))}
    </Box>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  optionCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: getColor('contrastTextColor'),
    overflow: 'hidden',
  },
  optionCircleFilled: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
    borderColor: getColor('contrastTextColor'),
    borderWidth: 6,
    backgroundColor: getColor('success'),
  },
});
