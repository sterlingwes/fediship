import type {Observable} from '@legendapp/state';
import {Show, useSelector} from '@legendapp/state/react';
import {Legend} from '@legendapp/state/react-native-components';
import React, {useMemo} from 'react';
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
  active: Observable<boolean>;
  loading: Observable<boolean>;
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
            strokeActive$={active}
            strokeActiveColor="transparent"
            strokeInactiveColor={getColor('baseAccent')}
            fillActive$={active}
            fillActiveColor={getColor('goldAccent')}
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

  const isActive = useSelector(active);

  return (
    <Legend.Pressable
      disabled$={loading}
      onPress={onPress}
      hitSlop={10}
      style={[styles.starButton, isActive && styles.starButtonFaved]}>
      <Show if={loading} else={iconButton}>
        <LoadingSpinner />
      </Show>
    </Legend.Pressable>
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
