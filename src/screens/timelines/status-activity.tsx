import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {forwardRef, useMemo} from 'react';
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
    const statuses = useMemo(() => {
      return notifs.map(notif => {
        const status = notif.status as TStatus;
        return {
          ...status,
          sourceHost: auth.host ?? '',
        };
      });
    }, [notifs, auth]);

    useMount(() => {
      navigation.setOptions({
        headerTitle: 'Your Activity',
      });
    });

    return (
      <StatusList
        {...{...defaultStatusListProps, statuses, loading}}
        ref={ref}
      />
    );
  },
);
