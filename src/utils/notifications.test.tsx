import React from 'react';
import {Text, View} from 'react-native';
import {render, waitFor} from '@testing-library/react-native';
import {NotificationProvider, useNotifications} from './notifications';
import {MastodonApiClient} from '../api/mastodon';
import {MastodonProvider} from '../api/mastodon-context';
import {NavigationContainer} from '@react-navigation/native';
import {ApiResponse} from '../api/response';

jest.mock('react-native-mmkv');

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

  const mockApi = new MastodonApiClient();

  let getSpy: jest.SpyInstance;

  const Providers = ({children}: {children: JSX.Element}) => (
    <MastodonProvider value={mockApi}>
      <NavigationContainer>
        <NotificationProvider>{children}</NotificationProvider>
      </NavigationContainer>
    </MastodonProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    getSpy = jest
      .spyOn(mockApi, 'authedGet')
      .mockResolvedValue({ok: true, body: []} as ApiResponse);
  });

  describe('base case', () => {
    it('should indicate no notifications', async () => {
      const result = render(<TestComponent />, {wrapper: Providers});
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

  describe('with notifications returned', () => {
    beforeEach(() => {
      getSpy.mockResolvedValue({
        ok: true,
        body: [
          {
            id: '221',
            created_at: '2022-06-05T17:08:39.145Z',
            type: 'favourite',
          },
        ],
      } as ApiResponse);
    });

    it('should indicate one new notification', async () => {
      const result = render(<TestComponent />, {wrapper: Providers});
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
            1
          </Text>
        </View>
      `);
    });
  });
});
