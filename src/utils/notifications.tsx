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
  getLastTypeReads,
  getNotifGroup,
  markFetch,
  markTabRead,
  ReadTimeLookup,
  saveLastNotifTime,
  setLastTypeReads,
  storeNotifGroup,
} from '../storage/notifications';
import {useMount} from './hooks';

const supportedNotifTypes: TNotification['type'][] = [
  'follow',
  'favourite',
  'mention',
  'reblog',
  'poll',
];

const groupTypes = (notifications: NormalizedNotif[]): NotificationGroups =>
  notifications.reduce(
    (acc, notif) => ({
      ...acc,
      [notif.type]: acc[notif.type] ? [...acc[notif.type], notif] : [notif],
    }),
    {} as NotificationGroups,
  );

const countNotifs = (notifs: NotificationGroups) =>
  Object.values(notifs).reduce((acc, entries) => acc + entries.length, 0);

const isNew = (notif: TNotification, lastReadTimes: ReadTimeLookup) => {
  const lastTime = lastReadTimes[notif.type];
  return !lastTime || lastTime < new Date(notif.created_at).valueOf();
};

const filterNotifTypes = (
  notifs: TNotification[],
  lastReadTimes: ReadTimeLookup,
): NormalizedNotif[] =>
  notifs
    .filter(
      notif =>
        supportedNotifTypes.includes(notif.type) && isNew(notif, lastReadTimes),
    )
    .map(notif => ({
      ...notif,
      key: new Date(notif.created_at).valueOf(),
    }))
    .sort((a, b) => {
      if (typeof a.key === 'number' && typeof b.key === 'number') {
        return b.key - a.key;
      }

      return b.id.localeCompare(a.id);
    });

const fetchFrequency = 120000; // 2 mins

const NotificationContext = React.createContext<{
  tabRead: boolean;
  newNotifCount: number;
  loadingNotifications: boolean;
  setTabRead: Dispatch<SetStateAction<boolean>>;
  setNewNotifCount: Dispatch<SetStateAction<number>>;
  setLoadingNotifications: Dispatch<SetStateAction<boolean>>;
}>({
  tabRead: true,
  newNotifCount: 0,
  loadingNotifications: false,
  setTabRead: () => {},
  setNewNotifCount: () => {},
  setLoadingNotifications: () => {},
});

export const NotificationProvider = ({children}: {children: JSX.Element}) => {
  const [tabRead, setTabRead] = useState(true);
  const [newNotifCount, setNewNotifCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  return (
    <NotificationContext.Provider
      value={{
        tabRead,
        newNotifCount,
        loadingNotifications,
        setTabRead,
        setNewNotifCount,
        setLoadingNotifications,
      }}>
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

  const {
    tabRead,
    newNotifCount,
    loadingNotifications,
    setTabRead,
    setNewNotifCount,
    setLoadingNotifications,
  } = useContext(NotificationContext);

  const localFetching = useRef(false);
  const [notifs, setNotifs] = useState<NotificationGroups>(getNotifGroup());

  useFocusEffect(
    useCallback(() => {
      const currentAppState = AppState.currentState;

      const fetchNotifs = async () => {
        if (localFetching.current) {
          return;
        }

        const lastFetch = getLastFetch();

        if (
          currentAppState === 'background' ||
          (lastFetch && Date.now() - lastFetch <= fetchFrequency)
        ) {
          return;
        }

        markFetch();
        localFetching.current = true;

        try {
          const notifications = await api.getNotifications();
          const previousReadTimes = getLastTypeReads();
          const supported = filterNotifTypes(notifications, previousReadTimes);
          if (supported && supported.length) {
            const currentLastTime = supported[0].key;
            saveLastNotifTime(currentLastTime);
            const grouped = groupTypes(supported);
            storeNotifGroup(grouped);
            const count = countNotifs(grouped);
            setNewNotifCount(count);
            setTabRead(false);
            setNotifs(grouped);
          }
        } catch (e) {
          console.error(e);
        }

        localFetching.current = false;
      };

      setLoadingNotifications(true);
      fetchNotifs().then(() => setLoadingNotifications(false));

      // given how expensive re-evaluating this callback could be, take care
      // in ensuring these dependencies rarely change
    }, [setNotifs, api, setTabRead, setNewNotifCount, setLoadingNotifications]),
  );

  const readTab = () => {
    markTabRead();
    setTabRead(true);
  };

  const readType = (
    type: keyof NotificationGroups | Array<keyof NotificationGroups>,
  ) => {
    const latest = getLastTypeReads();
    let newTimes: ReadTimeLookup | undefined;
    if (Array.isArray(type)) {
      newTimes = type.reduce((acc, t) => ({...acc, [t]: Date.now()}), latest);
    } else {
      newTimes = {...latest, [type]: Date.now()};
    }

    setLastTypeReads(newTimes);

    const notifList = Object.values(notifs).reduce(
      (acc, arr) => acc.concat(arr),
      [] as NormalizedNotif[],
    );
    const supported = filterNotifTypes(notifList, newTimes);
    const grouped = groupTypes(supported);
    storeNotifGroup(grouped);
    const count = countNotifs(grouped);
    setNewNotifCount(count);
    setNotifs(grouped);
    if (!count) {
      setTabRead(true);
    }
  };

  return {
    notifs,
    newNotifCount,
    tabRead,
    readTab,
    readType,
    loadingNotifications,
  };
};
