import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {forwardRef} from 'react';
import {StatusList} from '../../components/StatusList';
import {RootStackParamList} from '../../types';
import {useMount} from '../../utils/hooks';
import {useNotificationsForTypes} from '../../utils/notifications';

const defaultStatusListProps = {
  error: '',
  hasMore: false,
  reloading: false,
  loadingMore: false,
  fetchTimeline: () => Promise.resolve(),
  reloadTimeline: () => Promise.resolve(),
};

export const Polls = forwardRef(
  ({navigation}: NativeStackScreenProps<RootStackParamList, 'Polls'>, ref) => {
    const {timeline, metaRef} = useNotificationsForTypes(['poll']);

    useMount(() => {
      navigation.setOptions({
        headerTitle: 'Polls',
      });
    });

    return (
      <StatusList
        {...{...defaultStatusListProps, timeline, metaRef}}
        ref={ref}
      />
    );
  },
);
