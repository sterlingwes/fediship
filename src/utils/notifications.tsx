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
import {NotificationGroups, TNotification} from '../types';
import {AppState} from 'react-native';
import {
  getLastFetch,
  getNotifGroup,
  getNotifWatermarks,
  markFetch,
  markTabRead,
  NotifWatermarks,
  setNotifGroup,
  setNotifWatermarks,
} from '../storage/notifications';

const generateWatermarks = (notifs: NotificationGroups) => {
  return (Object.keys(notifs) as Array<keyof NotificationGroups>).reduce(
    (acc, notifType) => ({
      ...acc,
      [notifType]: notifs[notifType][0].id,
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

const groupTypes = (notifications: TNotification[]): NotificationGroups =>
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

const filterNotifTypes = (notifs: TNotification[]) =>
  notifs.filter(notif => supportedNotifTypes.includes(notif.type));

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

export const useNotifications = () => {
  const api = useMyMastodonInstance();

  const {tabRead, setTabRead} = useContext(NotificationContext);
  const [lastFetch, setLastFetch] = useState(getLastFetch());
  const [newNotifCount, setNewNotifCount] = useState(0);
  const [notifs, setNotifs] = useState<NotificationGroups>(getNotifGroup());
  const initialWatermarks = useRef(getNotifWatermarks());

  useFocusEffect(
    useCallback(() => {
      const currentAppState = AppState.currentState;

      const fetchNotifs = async () => {
        if (
          currentAppState === 'background' ||
          (lastFetch && Date.now() - lastFetch <= fetchFrequency)
        ) {
          return;
        }

        markFetch();
        setLastFetch(Date.now());

        const notifications = await api.getNotifications();
        const supported = filterNotifTypes(notifications);
        if (supported && supported.length) {
          const grouped = filterByWatermarks(
            groupTypes(supported),
            initialWatermarks.current,
          );
          setNotifs(grouped);
          const count = countNotifs(grouped);
          setNewNotifCount(count);
          setNotifGroup(grouped);

          const newWatermarks = generateWatermarks(grouped);

          if (initialWatermarks.current == null) {
            // initial load, skip checking watermarks until next fetch
            initialWatermarks.current = newWatermarks;
            setNotifWatermarks(newWatermarks);
            return;
          }

          if (compareWatermarks(initialWatermarks.current, newWatermarks)) {
            initialWatermarks.current = newWatermarks;
            setNotifWatermarks(newWatermarks);
            setTabRead(false);
          }
        }
      };

      fetchNotifs();
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
    setNotifGroup(newGroup);
    const watermarks = generateWatermarks(notifs);
    setNotifWatermarks(watermarks);
    initialWatermarks.current = watermarks;
  };

  return {notifs, newNotifCount, tabRead, readTab, readType};
};
