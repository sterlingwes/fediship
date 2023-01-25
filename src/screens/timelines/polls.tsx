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

export const Polls = forwardRef(
  ({navigation}: NativeStackScreenProps<RootStackParamList, 'Polls'>, ref) => {
    const auth = useAuth();
    const {notifs, loading} = useNotificationsForTypes(['poll']);
    const timeline = useMemo(() => {
      const statuses = new Set<string>();
      notifs.forEach(notif => {
        const status = notif.status as TStatus;
        const statusMapped = {
          ...status,
          sourceHost: auth.host ?? '',
        };
        const statusId = status.url ?? status.uri;
        statuses.add(statusId);
        globalStatuses[statusId].set(statusMapped);
      });
      return observable(Array.from(statuses));
    }, [notifs, auth]);

    const metaRef = useObservable({
      loading,
      nextPage: undefined,
      error: '',
    } as TimelineMeta);

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
