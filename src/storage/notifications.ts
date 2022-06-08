import {MMKV} from 'react-native-mmkv';

import {NotificationGroups} from '../types';
import {readJson} from './utils';

const storage = new MMKV({id: 'notifications'});

export const getLastFetch = () => storage.getNumber('last_fetch');

export const markFetch = () => {
  storage.set('last_fetch', Date.now());
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
