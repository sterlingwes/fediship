import {observable} from '@legendapp/state';
import {useObservable} from '@legendapp/state/react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {forwardRef, useMemo} from 'react';
import {globalStatuses} from '../../api/status.state';
import {TimelineMeta} from '../../api/timeline.state';
import {StatusList} from '../../components/StatusList';
import {useAuth} from '../../storage/auth';
import {RootStackParamList, TStatus} from '../../types';
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
    const auth = useAuth();
    const {notifs, loading} = useNotificationsForTypes([
      'favourite',
      'mention',
      'reblog',
    ]);
    const timeline = useMemo(() => {
      const uniqueStatuses = new Set<string>();
      notifs.forEach(notif => {
        const status = notif.status as TStatus;
        const statusId = status.url ?? status.uri;
        if (uniqueStatuses.has(statusId)) {
          return;
        }

        const statusMapped = {
          ...status,
          sourceHost: auth.host ?? '',
        };
        globalStatuses[statusId].set(statusMapped);

        uniqueStatuses.add(statusId);
      });

      return observable(Array.from(uniqueStatuses));
    }, [notifs, auth]);

    const metaRef = useObservable({
      loading,
      nextPage: undefined,
      error: '',
    } as TimelineMeta);

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
