let lastFetch: number | undefined;

export const getLastFetch = jest.fn(() => lastFetch);

export const markFetch = jest.fn(() => {
  lastFetch = Date.now();
});

let notifGroup: any;

export const storeNotifGroup = jest.fn(value => {
  notifGroup = value;
});

export const getNotifGroup = jest.fn(() => notifGroup);

let tabRead: number | undefined;

export const markTabRead = jest.fn(() => {
  tabRead = Date.now();
});

export const getTabRead = jest.fn(() => tabRead);

let watermarks: any;

export const getNotifWatermarks = jest.fn(() => watermarks);

export const storeNotifWatermarks = jest.fn(value => {
  watermarks = value;
});

export const resetMockNotificationsStore = (
  values: Record<string, any> = {},
) => {
  lastFetch = values.lastFetch;
  notifGroup = values.notifGroup;
  tabRead = values.tabRead;
  watermarks = values.watermarks;
};
