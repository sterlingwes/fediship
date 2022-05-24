import {MMKV} from 'react-native-mmkv';
import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useState} from 'react';
import {useMyMastodonInstance} from '../api/hooks';
import {NotificationGroups, TNotification} from '../types';
import {AppState} from 'react-native';

const storage = new MMKV({id: 'notifications'});

const groupTypes = (notifications: TNotification[]): NotificationGroups =>
  notifications.reduce(
    (acc, notif) => ({
      ...acc,
      [notif.type]: acc[notif.type] ? [...acc[notif.type], notif] : [notif],
    }),
    {} as NotificationGroups,
  );

const supportedNotifTypes: TNotification['type'][] = [
  'follow',
  'favourite',
  'mention',
  'reblog',
  'poll',
];

const filterNotifTypes = (notifs: TNotification[]) =>
  notifs.filter(notif => supportedNotifTypes.includes(notif.type));

const fetchFrequency = 120000; // 2 mins

const getLastFetch = () => storage.getNumber('last_fetch');

const markFetch = () => {
  storage.set('last_fetch', Date.now());
};

const setNotifGroup = (notifGroup: NotificationGroups) =>
  storage.set('notif_group', JSON.stringify(notifGroup));

const markTabRead = () => storage.set('tab_read', Date.now());

const getTabRead = () => storage.getNumber('tab_read');

const getNotifGroup = (): NotificationGroups => {
  const value = storage.getString('notif_group');
  if (!value) {
    return {} as NotificationGroups;
  }

  try {
    return JSON.parse(value);
  } catch (e) {}

  return {} as NotificationGroups;
};

export const useNotifications = () => {
  const api = useMyMastodonInstance();
  const lastFetch = getLastFetch();
  const lastTabRead = getTabRead();

  const [newNotifCount, setNewNotifCount] = useState(0);
  const [notifs, setNotifs] = useState<NotificationGroups>(getNotifGroup());

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
        const notifications = await api.getNotifications();
        const supported = filterNotifTypes(notifications);
        if (supported && supported.length) {
          const grouped = groupTypes(supported);
          setNotifs(grouped);
          setNewNotifCount(supported.length);
          setNotifGroup(grouped);
        }
      };

      fetchNotifs();
    }, [setNotifs, api, lastFetch]),
  );

  const readTab = () => {
    markTabRead();
  };

  const readType = (type: keyof NotificationGroups) => {
    delete notifs[type];
    setNotifs(notifs);
  };

  const tabRead =
    lastFetch && lastTabRead ? lastFetch < lastTabRead : undefined;

  // todo: need read timestamp / min_id for tab and sub types
  // so that we can filter appropriately

  return {notifs, newNotifCount, tabRead, readTab, readType};
};
