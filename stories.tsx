import React from 'react';
import {AppRegistry, useColorScheme} from 'react-native';

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

const Stack = createNativeStackNavigator();

const StoryContainer = () => {
  const scheme = useColorScheme();

  return (
    <ThemeProvider>
      <NavigationContainer
        theme={scheme === 'dark' ? darkNavigationTheme : lightNavigationTheme}>
        <Stack.Navigator>
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
  );
};

AppRegistry.registerComponent(appName, () => StoryContainer);
