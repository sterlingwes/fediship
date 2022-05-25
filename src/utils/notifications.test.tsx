import React from 'react';
import MockDate from 'mockdate';
import {NavigationContainer} from '@react-navigation/native';
import {act, renderHook} from '@testing-library/react-hooks';
import {NotificationProvider, useNotifications} from './notifications';
import * as ApiHooks from '../api/hooks';
import * as NotificationStorage from '../storage/notifications';

jest.mock('react-native-mmkv');
jest.mock('../storage/notifications');

describe('useNotifications', () => {
  let fetchSpy: jest.SpyInstance;
  let initialDateTime: number;

  beforeEach(() => {
    jest.clearAllMocks();

    initialDateTime = Date.now();
    MockDate.set(initialDateTime);

    fetchSpy = jest.fn(() => Promise.resolve());
    // @ts-expect-error testing subset of api client
    jest.spyOn(ApiHooks, 'useMyMastodonInstance').mockImplementation(() => ({
      getNotifications: fetchSpy,
    }));
  });

  const wrapper = ({children}: any) => (
    <NotificationProvider>
      <NavigationContainer>{children}</NavigationContainer>
    </NotificationProvider>
  );

  describe('with no notifications pending', () => {
    it('should indicate no notifications', () => {
      const {result} = renderHook(() => useNotifications(), {wrapper});

      expect(result.current).toEqual(
        expect.objectContaining({
          newNotifCount: 0,
          notifs: {},
          tabRead: true,
        }),
      );
    });

    it('should fetch notifications', () => {
      renderHook(() => useNotifications(), {wrapper});

      expect(fetchSpy).toHaveBeenCalled();
    });
  });

  describe('having recently fetched notifications', () => {
    beforeEach(() => {
      // @ts-expect-error mock
      NotificationStorage.getLastFetch.mockReturnValue(initialDateTime);

      MockDate.set(initialDateTime + 10000);
    });

    it('should not call fetch', () => {
      renderHook(() => useNotifications(), {wrapper});

      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  describe('having not recently fetched notifications', () => {
    beforeEach(() => {
      // @ts-expect-error mock
      NotificationStorage.getLastFetch.mockReturnValue(initialDateTime);

      MockDate.set(initialDateTime + 200000);
    });

    it('should call fetch', () => {
      renderHook(() => useNotifications(), {wrapper});

      expect(fetchSpy).toHaveBeenCalled();
    });
  });

  describe('user tab read state', () => {
    let fetchPromise: Promise<any>;

    beforeEach(() => {
      // @ts-expect-error mock
      NotificationStorage.getLastFetch.mockReturnValue(initialDateTime);

      MockDate.set(initialDateTime + 200000);
    });

    describe('has no prior watermarks', () => {
      beforeEach(() => {
        // @ts-expect-error mock
        NotificationStorage.getNotifWatermarks.mockReturnValue({});

        fetchPromise = new Promise(resolve => resolve([]));
        fetchSpy.mockReturnValue(fetchPromise);
      });

      it('should return tabRead=true', () => {
        const {result} = renderHook(() => useNotifications(), {wrapper});

        expect(result.current.tabRead).toBe(true);
      });
    });

    describe('has the same watermarks', () => {
      beforeEach(() => {
        // @ts-expect-error mock
        NotificationStorage.getNotifWatermarks.mockReturnValue({follow: '101'});

        fetchPromise = new Promise(resolve =>
          resolve([{type: 'follow', id: '101'}]),
        );
        fetchSpy.mockReturnValue(fetchPromise);
      });

      it('should return tabRead=true', async () => {
        const {result} = renderHook(() => useNotifications(), {wrapper});
        await act(() => fetchPromise);

        expect(result.current.tabRead).toBe(true);
      });
    });

    describe('has new values in the incoming watermark', () => {
      beforeEach(() => {
        // @ts-expect-error mock
        NotificationStorage.getNotifWatermarks.mockReturnValue({follow: '101'});

        fetchPromise = new Promise(resolve =>
          resolve([
            {type: 'follow', id: '102'},
            {type: 'follow', id: '101'},
          ]),
        );
        fetchSpy.mockReturnValue(fetchPromise);
      });

      it('should return tabRead=false', async () => {
        const {result} = renderHook(() => useNotifications(), {wrapper});
        await act(() => fetchPromise);

        expect(result.current.tabRead).toBe(false);
      });
    });

    describe('has no value for type in the incoming watermark', () => {
      beforeEach(() => {
        // @ts-expect-error mock
        NotificationStorage.getNotifWatermarks.mockReturnValue({follow: '101'});

        fetchPromise = new Promise(resolve =>
          resolve([
            {type: 'somethingelse', id: '102'},
            {type: 'somethingelse', id: '101'},
          ]),
        );
        fetchSpy.mockReturnValue(fetchPromise);
      });

      it('should return tabRead=true', async () => {
        const {result} = renderHook(() => useNotifications(), {wrapper});
        await act(() => fetchPromise);

        expect(result.current.tabRead).toBe(true);
      });
    });

    describe('has new values in the incoming watermark and none in the saved watermark', () => {
      beforeEach(() => {
        // @ts-expect-error mock
        NotificationStorage.getNotifWatermarks.mockReturnValue({});

        fetchPromise = new Promise(resolve =>
          resolve([
            {type: 'follow', id: '100'},
            {type: 'follow', id: '99'},
            {type: 'follow', id: '98'},
          ]),
        );
        fetchSpy.mockReturnValue(fetchPromise);
      });

      it('should return tabRead=false', async () => {
        const {result} = renderHook(() => useNotifications(), {wrapper});
        await act(() => fetchPromise);

        expect(result.current.newNotifCount).toBe(3);
        expect(result.current.tabRead).toBe(false);
      });
    });
  });

  describe('read state on notif types', () => {
    let fetchPromise: Promise<any>;

    beforeEach(() => {
      // @ts-expect-error mock
      NotificationStorage.getLastFetch.mockReturnValue(initialDateTime);

      MockDate.set(initialDateTime + 200000);
    });

    describe('receiving the same entries for a previously read type', () => {
      beforeEach(() => {
        const follows = [
          {type: 'follow', id: '102'},
          {type: 'follow', id: '101'},
        ];

        // @ts-expect-error mock
        NotificationStorage.getNotifWatermarks.mockReturnValue({follow: '102'});
        // @ts-expect-error mock
        NotificationStorage.getNotifGroup.mockReturnValue({follow: follows});

        fetchPromise = new Promise(resolve => resolve(follows));
        fetchSpy.mockReturnValue(fetchPromise);
      });

      it('should not indicate there are more unread', async () => {
        const {result} = renderHook(() => useNotifications(), {wrapper});
        await act(() => fetchPromise);

        expect(result.current.tabRead).toBe(true);
        expect(result.current.notifs.follow).toHaveLength(0);
      });
    });
  });
});
