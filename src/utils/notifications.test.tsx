import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {render, waitFor, fireEvent} from '@testing-library/react-native';
import {NotificationProvider, useNotifications} from './notifications';
import {MastodonProvider} from '../api/mastodon-context';
import {NavigationContainer} from '@react-navigation/native';
import * as MockStore from '../storage/notifications';

jest.mock('react-native-mmkv');

jest.mock('../storage/notifications');

describe('notifications e2e', () => {
  const TestComponent = () => {
    const {tabRead, newNotifCount, loadingNotifications} = useNotifications();
    return (
      <View>
        {loadingNotifications ? <Text>Loading</Text> : <Text>Loaded</Text>}
        <Text>tabRead: {tabRead.toString()}</Text>
        <Text>newNotifCount: {newNotifCount}</Text>
      </View>
    );
  };

  const createWrapper =
    (mockApi: any) =>
    ({children}: {children: JSX.Element}) =>
      (
        <MastodonProvider value={mockApi}>
          <NavigationContainer>
            <NotificationProvider>{children}</NotificationProvider>
          </NavigationContainer>
        </MastodonProvider>
      );

  beforeEach(() => {
    jest.clearAllMocks();
    // @ts-expect-error magic mock
    MockStore.resetMockNotificationsStore();
  });

  describe('base case', () => {
    it('should indicate no notifications', async () => {
      const result = render(<TestComponent />, {
        wrapper: createWrapper({
          getNotifications: () => Promise.resolve([]),
        }),
      });
      await waitFor(() => result.getByText('Loaded'));
      expect(result.toJSON()).toMatchInlineSnapshot(`
        <View>
          <Text>
            Loaded
          </Text>
          <Text>
            tabRead: 
            true
          </Text>
          <Text>
            newNotifCount: 
            0
          </Text>
        </View>
      `);
      result.unmount();
    });
  });

  describe('marking type as read', () => {
    let wrapper: ReturnType<typeof createWrapper>;

    const TestComponentReadable = () => {
      const {tabRead, newNotifCount, loadingNotifications, readType} =
        useNotifications();
      const onPressReadFollows = () => readType('follow');
      return (
        <View>
          {loadingNotifications ? <Text>Loading</Text> : <Text>Loaded</Text>}
          <Text>tabRead: {tabRead.toString()}</Text>
          <Text>newNotifCount: {newNotifCount}</Text>
          <Pressable onPress={onPressReadFollows}>
            <Text>Read Follows</Text>
          </Pressable>
        </View>
      );
    };

    beforeEach(() => {
      wrapper = createWrapper({
        getNotifications: () =>
          Promise.resolve([
            {
              id: '221',
              created_at: '2022-06-05T17:08:39.145Z',
              type: 'favourite',
            },
            {
              id: '220',
              created_at: '2022-06-05T11:08:39.145Z',
              type: 'follow',
            },
            {
              id: '219',
              created_at: '2022-06-04T17:08:39.145Z',
              type: 'follow',
            },
          ]),
      });
    });

    it('should store new watermarks', async () => {
      const result = render(<TestComponentReadable />, {wrapper});
      await waitFor(() => result.getByText('Loaded'));
      expect(result.toJSON()).toMatchInlineSnapshot(`
        <View>
          <Text>
            Loaded
          </Text>
          <Text>
            tabRead: 
            false
          </Text>
          <Text>
            newNotifCount: 
            3
          </Text>
          <View
            accessible={true}
            collapsable={false}
            focusable={true}
            onBlur={[Function]}
            onClick={[Function]}
            onFocus={[Function]}
            onResponderGrant={[Function]}
            onResponderMove={[Function]}
            onResponderRelease={[Function]}
            onResponderTerminate={[Function]}
            onResponderTerminationRequest={[Function]}
            onStartShouldSetResponder={[Function]}
          >
            <Text>
              Read Follows
            </Text>
          </View>
        </View>
      `);

      const el = await result.findByText('Read Follows');
      await fireEvent(el, 'press');

      expect(MockStore.setLastTypeReads).toHaveBeenCalledTimes(1);
      expect(MockStore.setLastTypeReads).toHaveBeenCalledWith({
        follow: expect.any(Number),
      });
    });
  });

  describe('with notifications returned', () => {
    describe('initial fetch', () => {
      let wrapper: ReturnType<typeof createWrapper>;
      beforeEach(() => {
        wrapper = createWrapper({
          getNotifications: () =>
            Promise.resolve([
              {
                id: '221',
                created_at: '2022-06-05T17:08:39.145Z',
                type: 'favourite',
              },
            ]),
        });

        it('should not indicate new notifications even if there are some', async () => {
          const result = render(<TestComponent />, {wrapper});
          await waitFor(() => result.getByText('Loaded'));
          expect(result.toJSON()).toMatchInlineSnapshot(`
            <View>
              <Text>
                Loaded
              </Text>
              <Text>
                tabRead: 
                true
              </Text>
              <Text>
                newNotifCount: 
                0
              </Text>
            </View>
          `);
        });
      });
    });

    describe('two hook uses', () => {
      let wrapper: ReturnType<typeof createWrapper>;
      let getSpy: jest.SpyInstance;

      const TestComponent2 = () => {
        const {loadingNotifications} = useNotifications();
        return (
          <View>
            {loadingNotifications ? <Text>Loading</Text> : <Text>Loaded</Text>}
          </View>
        );
      };

      beforeEach(() => {
        // @ts-expect-error magic mock
        MockStore.resetMockNotificationsStore({
          lastTypeReads: {favourite: 1654448919145},
        });

        getSpy = jest.fn(() =>
          Promise.resolve([
            {
              id: '222',
              created_at: '2022-06-06T17:08:39.145Z',
              type: 'follow',
            },
            {
              id: '221',
              created_at: '2022-06-05T17:08:39.145Z',
              type: 'favourite',
            },
          ]),
        );
        wrapper = createWrapper({
          getNotifications: getSpy,
        });
      });

      it('should not lead to duplicate operations', async () => {
        const result = render(<TestComponent />, {wrapper});
        const result2 = render(<TestComponent2 />, {wrapper});
        await waitFor(
          () => result.getByText('Loaded') && result2.getByText('Loaded'),
        );
        expect(MockStore.markFetch).toHaveBeenCalledTimes(1);
        expect(getSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('subsequent fetch with new notifications', () => {
      let wrapper: ReturnType<typeof createWrapper>;
      let getSpy: jest.SpyInstance;
      beforeEach(() => {
        // @ts-expect-error magic mock
        MockStore.resetMockNotificationsStore({
          lastTypeReads: {favourite: 1654448919145},
        });

        getSpy = jest.fn(() =>
          Promise.resolve([
            {
              id: '222',
              created_at: '2022-06-06T17:08:39.145Z',
              type: 'follow',
            },
            {
              id: '221',
              created_at: '2022-06-05T17:08:39.145Z',
              type: 'favourite',
            },
          ]),
        );
        wrapper = createWrapper({
          getNotifications: getSpy,
        });
      });

      it('should indicate there are new ones', async () => {
        const result = render(<TestComponent />, {wrapper});
        await waitFor(() => result.getByText('Loaded'));
        expect(result.toJSON()).toMatchInlineSnapshot(`
          <View>
            <Text>
              Loaded
            </Text>
            <Text>
              tabRead: 
              false
            </Text>
            <Text>
              newNotifCount: 
              1
            </Text>
          </View>
        `);
      });

      it('should store new watermark after initial fetch', async () => {
        const result = render(<TestComponent />, {wrapper});
        await waitFor(() => result.getByText('Loaded'));
        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(MockStore.saveLastNotifTime).toHaveBeenCalledWith(1654535319145);
      });

      describe('subsequent fetch with the same notification result', () => {
        beforeEach(() => {
          jest
            .spyOn(MockStore, 'getLastTypeReads')
            // @ts-expect-error partial mock
            .mockReturnValue({favourite: 1654535319145});
        });

        it('should indicate no new notifications', async () => {
          const result = render(<TestComponent />, {wrapper});
          await waitFor(() => result.getByText('Loaded'));
          expect(getSpy).toHaveBeenCalledTimes(1);
          expect(result.toJSON()).toMatchInlineSnapshot(`
            <View>
              <Text>
                Loaded
              </Text>
              <Text>
                tabRead: 
                false
              </Text>
              <Text>
                newNotifCount: 
                1
              </Text>
            </View>
          `);
        });
      });

      describe('subsequent mount too soon after last fetch', () => {
        beforeEach(() => {
          jest
            .spyOn(MockStore, 'getLastFetch')
            .mockReturnValue(Date.now() + 10e6);
          jest
            .spyOn(MockStore, 'getLastTypeReads')
            // @ts-expect-error partial mock
            .mockReturnValue({favourite: 1654448919145});
        });

        it('should not fetch & indicate no new notifications', async () => {
          const result = render(<TestComponent />, {wrapper});
          await waitFor(() => result.getByText('Loaded'));
          expect(getSpy).not.toHaveBeenCalled();
          expect(result.toJSON()).toMatchInlineSnapshot(`
            <View>
              <Text>
                Loaded
              </Text>
              <Text>
                tabRead: 
                true
              </Text>
              <Text>
                newNotifCount: 
                0
              </Text>
            </View>
          `);
        });
      });
    });
  });
});
