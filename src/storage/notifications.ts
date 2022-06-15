import {MMKV} from 'react-native-mmkv';

import {NotificationGroups} from '../types';
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

export type NotifWatermarks = Record<keyof NotificationGroups, string>;

export const storeNotifWatermarks = (watermarks: NotifWatermarks) => {
  storage.set('notif_watermarks', JSON.stringify(watermarks));
};

export const getNotifWatermarks = (): NotifWatermarks | null =>
  readJson('notif_watermarks', storage, null);
