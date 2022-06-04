import React from 'react';
import {ActivityIndicator, ActivityIndicatorProps} from 'react-native';
import {useThemeGetters} from '../theme/utils';

export const LoadingSpinner = (props: ActivityIndicatorProps) => {
  const {getColor} = useThemeGetters();
  return <ActivityIndicator color={getColor('primary')} {...props} />;
};
