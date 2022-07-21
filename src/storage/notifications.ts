import {MMKV} from 'react-native-mmkv';

import {NotificationGroups, NotificationType} from '../types';
import {readJson} from './utils';

const storage = new MMKV({id: 'notifications'});

let lastFetchCache: number | undefined;
export const getLastFetch = () => {
  if (lastFetchCache) {
    return lastFetchCache;
  }
  const last = storage.getNumber('last_fetch');
  lastFetchCache = last;
  return last;
};

export const markFetch = () => {
  const now = Date.now();
  storage.set('last_fetch', now);
  lastFetchCache = now;
};

export const markTabRead = () => storage.set('tab_read', Date.now());

export const storeNotifGroup = (notifGroup: NotificationGroups) =>
  storage.set('notif_group', JSON.stringify(notifGroup));

export const getNotifGroup = (): NotificationGroups =>
  readJson('notif_group', storage, {} as NotificationGroups);

export const getLastNotifTime = (): number | undefined =>
  storage.getNumber('last_notif_time');

export const saveLastNotifTime = (lastNotifTime: number) =>
  storage.set('last_notif_time', lastNotifTime);

export type ReadTimeLookup = Record<NotificationType, number | undefined>;

export const getLastTypeReads = (): ReadTimeLookup =>
  readJson('last_type_read_times', storage, {} as ReadTimeLookup);

export const setLastTypeReads = (typeReads: ReadTimeLookup) =>
  storage.set('last_type_read_times', JSON.stringify(typeReads));
