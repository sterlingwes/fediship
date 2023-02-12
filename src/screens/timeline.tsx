import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {forwardRef} from 'react';
import {useTimeline} from '../api';
import {StatusList} from '../components/StatusList';
import {RootStackParamList} from '../types';

export const Timeline = forwardRef(
  (
    {route}: NativeStackScreenProps<RootStackParamList, 'Home' | 'Federated'>,
    ref,
  ) => {
    const timeline = useTimeline(route.params.timeline);

    return <StatusList ref={ref} {...timeline} />;
  },
);
