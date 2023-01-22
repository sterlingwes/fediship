import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {forwardRef, useMemo} from 'react';
import {LegacyStatusList} from '../../components/LegacyStatusList';
import {useAuth} from '../../storage/auth';
import {RootStackParamList, TStatus, TStatusMapped} from '../../types';
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
    const statuses = useMemo(() => {
      const uniqueStatuses = new Set<string>();
      const statusList: TStatusMapped[] = [];
      notifs.forEach(notif => {
        const status = notif.status as TStatus;
        if (uniqueStatuses.has(status.id)) {
          return;
        }

        uniqueStatuses.add(status.id);
        statusList.push({
          ...status,
          sourceHost: auth.host ?? '',
        });
      });

      return statusList;
    }, [notifs, auth]);

    useMount(() => {
      navigation.setOptions({
        headerTitle: 'Interactions',
      });
    });

    return (
      <LegacyStatusList
        showDetail
        showThreadFavouritedBy
        {...{...defaultStatusListProps, statuses, loading}}
        ref={ref}
      />
    );
  },
);
