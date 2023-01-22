import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {forwardRef} from 'react';
import {useTimeline} from '../api';
import {LegacyStatusList} from '../components/LegacyStatusList';
import {RootStackParamList} from '../types';

export const Timeline = forwardRef(
  (
    {route}: NativeStackScreenProps<RootStackParamList, 'Local' | 'Federated'>,
    ref,
  ) => {
    const timeline = useTimeline(route.params.timeline);

    return <LegacyStatusList ref={ref} {...timeline} />;
  },
);
