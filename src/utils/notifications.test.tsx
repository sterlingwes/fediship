import React from 'react';
import {Text, View} from 'react-native';
import {render, waitFor} from '@testing-library/react-native';
import {NotificationProvider, useNotifications} from './notifications';
import {MastodonProvider} from '../api/mastodon-context';
import {NavigationContainer} from '@react-navigation/native';
import * as MockStore from '../storage/notifications';

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

          expect(MockStore.storeNotifWatermarks).toHaveBeenCalledWith({
            favourite: '221',
          });
        });
      });
    });

    describe('subsequent fetch with new notifications', () => {
      let wrapper: ReturnType<typeof createWrapper>;
      beforeEach(() => {
        // @ts-expect-error magic mock
        MockStore.resetMockNotificationsStore({watermarks: {favourite: '221'}});

        wrapper = createWrapper({
          getNotifications: () =>
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
    });
  });
});
