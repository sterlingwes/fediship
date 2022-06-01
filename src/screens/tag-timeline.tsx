import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {forwardRef} from 'react';
import {useTagTimeline} from '../api';
import {ErrorBoundary} from '../components/ErrorBoundary';
import {SaveTimelineButton} from '../components/SaveTimelineButton';
import {StatusList} from '../components/StatusList';
import {RootStackParamList} from '../types';
import {useMount} from '../utils/hooks';

export const TagTimeline = forwardRef(
  (
    {
      navigation,
      route,
    }: NativeStackScreenProps<RootStackParamList, 'TagTimeline'>,
    ref,
  ) => {
    const {host, tag} = route.params;
    const timeline = useTagTimeline(host, tag);

    useMount(() => {
      const name = `${tag} ${host}`;
      navigation.setOptions({
        headerTitle: `#${name}`,
        headerRight: () => (
          <SaveTimelineButton params={{name, tag: {tag, host}}} />
        ),
      });
    });

    return (
      <ErrorBoundary>
        <StatusList ref={ref} {...timeline} />;
      </ErrorBoundary>
    );
  },
);
