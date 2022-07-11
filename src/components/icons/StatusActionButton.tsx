import React, {useMemo} from 'react';
import {Pressable} from 'react-native';
import {StyleCreator} from '../../theme/types';
import {useThemeGetters, useThemeStyle} from '../../theme/utils';
import {LoadingSpinner} from '../LoadingSpinner';
import {BookmarkIcon} from './BookmarkIcon';
import {StarIcon} from './StarIcon';

export const StatusActionButton = ({
  icon,
  active,
  loading,
  onPress,
}: {
  icon: 'bookmark' | 'favourite';
  active: boolean | undefined;
  loading: boolean;
  onPress: () => void;
}) => {
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();

  const iconButton = useMemo(() => {
    switch (icon) {
      case 'favourite':
        return (
          <StarIcon
            width="18"
            height="18"
            stroke={active ? 'transparent' : getColor('baseAccent')}
            fill={active ? getColor('goldAccent') : undefined}
          />
        );
      case 'bookmark':
        return (
          <BookmarkIcon
            width="18"
            height="18"
            stroke={active ? 'transparent' : getColor('baseAccent')}
            fill={active ? getColor('goldAccent') : undefined}
          />
        );
    }
  }, [icon, getColor, active]);

  return (
    <Pressable
      disabled={loading}
      onPress={onPress}
      style={[styles.starButton, active && styles.starButtonFaved]}>
      {loading ? <LoadingSpinner /> : iconButton}
    </Pressable>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  starButton: {
    position: 'absolute',
    top: 8,
    padding: 4,
    backgroundColor: getColor('base'),
    borderRadius: 16,
    borderWidth: 1,
    borderColor: getColor('baseAccent'),
  },
  starButtonFaved: {
    borderColor: getColor('goldAccent'),
  },
});
