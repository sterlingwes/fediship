let lastFetch: number | undefined;

export const getLastFetch = jest.fn(() => lastFetch);

export const markFetch = jest.fn(() => {
  lastFetch = Date.now();
});

let notifGroup = {};

export const storeNotifGroup = jest.fn(value => {
  notifGroup = value;
});

export const getNotifGroup = jest.fn(() => notifGroup);

let tabRead: number | undefined;

export const markTabRead = jest.fn(() => {
  tabRead = Date.now();
});

export const getTabRead = jest.fn(() => tabRead);

let lastNotifTime: string | undefined;

export const getLastNotifTime = jest.fn(() => lastNotifTime);

export const saveLastNotifTime = jest.fn((lastTime: string) => {
  lastNotifTime = lastTime;
});

let lastTypeReads: any;

export const getLastTypeReads = jest.fn(() => lastTypeReads ?? {});

export const setLastTypeReads = jest.fn(lastReads => {
  lastTypeReads = lastReads;
});

export const resetMockNotificationsStore = (
  values: Record<string, any> = {},
) => {
  lastFetch = values.lastFetch;
  notifGroup = values.notifGroup;
  tabRead = values.tabRead;
  lastNotifTime = values.lastNotifTime;
  lastTypeReads = values.lastTypeReads;
};
