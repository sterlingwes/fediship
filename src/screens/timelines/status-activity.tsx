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

export const StatusActivity = forwardRef(
  (
    {navigation}: NativeStackScreenProps<RootStackParamList, 'StatusActivity'>,
    ref,
  ) => {
    const {timeline, metaRef} = useNotificationsForTypes([
      'favourite',
      'mention',
      'reblog',
    ]);

    useMount(() => {
      navigation.setOptions({
        headerTitle: 'Interactions',
      });
    });

    return (
      <StatusList
        showDetail
        showThreadFavouritedBy
        {...{...defaultStatusListProps, timeline, metaRef}}
        ref={ref}
      />
    );
  },
);
