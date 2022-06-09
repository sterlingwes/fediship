import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {useMyMastodonInstance} from '../api/hooks';
import {
  NotificationGroups,
  NormalizedNotif,
  TNotification,
  NotificationType,
} from '../types';
import {AppState} from 'react-native';
import {
  getLastFetch,
  getNotifGroup,
  getNotifWatermarks,
  markFetch,
  markTabRead,
  NotifWatermarks,
  storeNotifGroup,
  storeNotifWatermarks,
} from '../storage/notifications';
import {useMount} from './hooks';

const generateWatermarks = (notifs: NotificationGroups) => {
  return (Object.keys(notifs) as Array<keyof NotificationGroups>).reduce(
    (acc, notifType) => ({
      ...acc,
      [notifType]: notifs[notifType][0]?.id,
    }),
    {} as NotifWatermarks,
  );
};

const supportedNotifTypes: TNotification['type'][] = [
  'follow',
  'favourite',
  'mention',
  'reblog',
  'poll',
];

/**
 * returns true if a notification type has an id watermark that doesn't match
 * one that was fetched or saved - this probably indicates a new notification
 * has arrived
 */
const compareWatermarks = (
  savedWatermark: NotifWatermarks,
  newWatermark: NotifWatermarks,
) => {
  return !!supportedNotifTypes.find(notifType => {
    return newWatermark[notifType] !== savedWatermark[notifType];
  });
};

const groupTypes = (notifications: NormalizedNotif[]): NotificationGroups =>
  notifications.reduce(
    (acc, notif) => ({
      ...acc,
      [notif.type]: acc[notif.type] ? [...acc[notif.type], notif] : [notif],
    }),
    {} as NotificationGroups,
  );

const filterByWatermarks = (
  notifs: NotificationGroups,
  watermarks?: NotifWatermarks | undefined | null,
): NotificationGroups =>
  watermarks
    ? (Object.keys(notifs) as Array<keyof NotificationGroups>).reduce(
        (acc, type) => {
          if (notifs[type]?.[0] && notifs[type][0].id === watermarks[type]) {
            return {
              ...acc,
              [type]: [],
            };
          }

          return acc;
        },
        notifs,
      )
    : notifs;

const countNotifs = (notifs: NotificationGroups) =>
  Object.values(notifs).reduce((acc, entries) => acc + entries.length, 0);

const filterNotifTypes = (notifs: TNotification[]): NormalizedNotif[] =>
  notifs
    .filter(notif => supportedNotifTypes.includes(notif.type))
    .map(notif => ({
      ...notif,
      key: notif.created_at ? new Date(notif.created_at).valueOf() : notif.id,
    }))
    .sort((a, b) => {
      if (typeof a.key === 'number' && typeof b.key === 'number') {
        return b.key - a.key;
      }

      if (typeof a.key === 'string' && typeof b.key === 'string') {
        return b.key.localeCompare(a.key);
      }

      return b.id.localeCompare(a.id);
    });

const fetchFrequency = 120000; // 2 mins

const NotificationContext = React.createContext<{
  tabRead: boolean;
  setTabRead: Dispatch<SetStateAction<boolean>>;
}>({
  tabRead: true,
  setTabRead: () => {},
});

export const NotificationProvider = ({children}: {children: JSX.Element}) => {
  const [tabRead, setTabRead] = useState(true);
  return (
    <NotificationContext.Provider value={{tabRead, setTabRead}}>
      {children}
    </NotificationContext.Provider>
  );
};

const notifTypes: NotificationType[] = [
  'follow',
  'favourite',
  'reblog',
  'mention',
  'poll',
  'follow_request',
];

export const useNotificationsForTypes = (types: Array<NotificationType>) => {
  const api = useMyMastodonInstance();
  const [loading, setLoading] = useState(false);
  const [notifs, setNotifs] = useState<TNotification[]>([]);

  useMount(() => {
    const fetchNotifs = async () => {
      setLoading(true);
      const excludeTypes = notifTypes.filter(
        type => types.includes(type) === false,
      );
      const result = await api.getNotifications({excludeTypes});
      setNotifs(result);
      setLoading(false);
    };

    fetchNotifs();
  });

  return {notifs, loading};
};

export const useNotifications = () => {
  const api = useMyMastodonInstance();

  const fetching = useRef(false);
  const {tabRead, setTabRead} = useContext(NotificationContext);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [lastFetch, setLastFetch] = useState(getLastFetch());
  const [newNotifCount, setNewNotifCount] = useState(0);
  const [notifs, setNotifs] = useState<NotificationGroups>(getNotifGroup());
  const initialWatermarks = useRef(getNotifWatermarks());

  useFocusEffect(
    useCallback(() => {
      const currentAppState = AppState.currentState;

      const fetchNotifs = async () => {
        if (fetching.current) {
          return;
        }

        if (
          currentAppState === 'background' ||
          (lastFetch && Date.now() - lastFetch <= fetchFrequency)
        ) {
          return;
        }

        fetching.current = true;
        markFetch();
        setLastFetch(Date.now());

        try {
          const notifications = await api.getNotifications();
          const supported = filterNotifTypes(notifications);
          if (supported && supported.length) {
            const grouped = groupTypes(supported);
            const groupedFiltered = filterByWatermarks(
              grouped,
              initialWatermarks.current,
            );

            storeNotifGroup(groupedFiltered);

            const newWatermarks = generateWatermarks(grouped);

            if (initialWatermarks.current == null) {
              // initial load, skip checking watermarks until next fetch
              initialWatermarks.current = newWatermarks;
              storeNotifWatermarks(newWatermarks);
              return;
            }

            if (compareWatermarks(initialWatermarks.current, newWatermarks)) {
              initialWatermarks.current = newWatermarks;
              storeNotifWatermarks(newWatermarks);
              const count = countNotifs(groupedFiltered);
              setNewNotifCount(count);
              setTabRead(false);
              setNotifs(groupedFiltered);
            }
          }
        } catch (e) {
          console.error(e);
        }

        fetching.current = false;
      };

      setLoadingNotifications(true);
      fetchNotifs().then(() => setLoadingNotifications(false));
    }, [setNotifs, api, lastFetch, setTabRead]),
  );

  const readTab = () => {
    markTabRead();
    setTabRead(true);
  };

  const readType = (type: keyof NotificationGroups) => {
    delete notifs[type];
    const newGroup = {...notifs};
    setNotifs(newGroup);
    storeNotifGroup(newGroup);
    const watermarks = generateWatermarks(notifs);
    storeNotifWatermarks(watermarks);
    initialWatermarks.current = watermarks;
  };

  return {
    notifs,
    newNotifCount,
    tabRead,
    readTab,
    readType,
    loadingNotifications,
    watermarks: {
      current: initialWatermarks.current,
      saved: getNotifWatermarks(),
    },
  };
};
