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

const Stack = createNativeStackNavigator();

const StoryContainer = () => {
  const theme = useTheme();
  console.log({theme});

  return (
    <ThemeProvider>
      <NavigationContainer
        theme={
          theme.activeScheme === 'light'
            ? lightNavigationTheme
            : darkNavigationTheme
        }>
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
