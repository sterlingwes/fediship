import {MMKV} from 'react-native-mmkv';

import {globalStatuses} from '../api/status.state';

const storage = new MMKV({id: 'status-seen'});

/**
 * hydrate just the keys and if there's a match by ID we can getNumber()
 * for the time and fill it in lazy like
 */
const hydrateKeys = () => {
  return storage.getAllKeys().reduce((acc, id) => ({...acc, [id]: true}), {});
};

// string is status url, number is timestamp seen
const pendingIds = [] as [string, number][];
const lookup: Record<string, number | boolean | undefined> = hydrateKeys();

let persistIntervalStarted = false;

const persistInterval = 500; // needs to be short enough that we don't drop too many on kill
const startPersistInterval = () => {
  persistIntervalStarted = true;
  setInterval(() => {
    pendingIds.forEach(([id, time]) => storage.set(id, time));
    pendingIds.length = 0;
  }, persistInterval);
};

export const markStatusSeen = (statusUrlUri: string) => {
  if (!persistIntervalStarted) {
    startPersistInterval();
  }

  const status = globalStatuses[statusUrlUri].peek();
  let id = statusUrlUri;
  const time = Date.now();

  if (status?.reblog) {
    id = status.reblog.url ?? status.reblog.uri;
  }

  if (!id) {
    return;
  }

  pendingIds.push([id, time]);
  lookup[id] = time;
};

/**
 * for the given status url and timestamp for the given time we're currently
 * viewing in the timeline, return true if the status was seen before and we
 * should hide
 *
 * returns false if the status was seen before but our timelineTimestamp is on
 * or before the time the status was seen (user should be able to go far enough
 * back in time to see the status again)
 */
export const getStatusSeen = (
  statusUrlUri: string,
  timelineTimestamp: number,
) => {
  const time = lookup[statusUrlUri];
  if (!time) {
    return false;
  }

  if (typeof time === 'boolean') {
    const timeSeen = storage.getNumber(statusUrlUri);
    if (typeof timeSeen === 'undefined') {
      console.warn(
        'Status url match in getStatusSeen but no time saved',
        statusUrlUri,
      );
      return false;
    }

    lookup[statusUrlUri] = timeSeen;
  }

  return timelineTimestamp <= (lookup[statusUrlUri] ?? 0);
};
