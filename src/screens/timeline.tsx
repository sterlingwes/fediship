import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {forwardRef} from 'react';
import {useTimeline} from '../api';
import {ErrorBoundary} from '../components/ErrorBoundary';
import {StatusList} from '../components/StatusList';
import {RootStackParamList} from '../types';

export const Timeline = forwardRef(
  (
    {route}: NativeStackScreenProps<RootStackParamList, 'Local' | 'Federated'>,
    ref,
  ) => {
    const timeline = useTimeline(route.params.timeline);

    return (
      <ErrorBoundary>
        <StatusList ref={ref} {...timeline} />;
      </ErrorBoundary>
    );
  },
);
