import React from 'react';
import {AppRegistry} from 'react-native';

import {name as appName} from './app.json';

import {
  darkNavigationTheme,
  lightNavigationTheme,
  ThemeProvider,
} from './src/theme';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ImageViewer} from './src/screens/image-viewer';
import {StatusStory} from './stories/status.stories';
import {useTheme} from './src/theme/utils';
import {TabbedHome} from './src/screens/tabbed-home';
import {MastodonProvider} from './src/api/mastodon-context';
import {MastodonApiClient} from './src/api/mastodon';

const Stack = createNativeStackNavigator();

const fetchOverride = (url: RequestInfo, options: RequestInit) => {
  console.log('fetch!', {url, options});
  return Promise.resolve(new Response());
};

const mastoApi = new MastodonApiClient({
  host: 'fake.host',
  token: 'fake-token',
  fetchOverride,
});

const StoryContainer = () => {
  const theme = useTheme();

  return (
    <MastodonProvider value={mastoApi}>
      <ThemeProvider>
        <NavigationContainer
          theme={
            theme.activeScheme === 'light'
              ? lightNavigationTheme
              : darkNavigationTheme
          }>
          <Stack.Navigator>
            <Stack.Screen name="TabbedHome" component={TabbedHome} />
            <Stack.Screen name="Status" component={StatusStory} />
            <Stack.Screen
              name="ImageViewer"
              component={ImageViewer}
              options={{
                presentation: 'containedTransparentModal',
                headerShown: false,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </MastodonProvider>
  );
};

AppRegistry.registerComponent(appName, () => StoryContainer);
