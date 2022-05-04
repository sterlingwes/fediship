import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {useColorScheme} from 'react-native';
import {Profile} from './profile';
import {
  ThemeProvider,
  darkNavigationTheme,
  lightNavigationTheme,
} from './theme';
import {Thread} from './thread';
import {Timeline} from './timeline';
import {RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const App = () => {
  const scheme = useColorScheme();

  return (
    <ThemeProvider>
      <NavigationContainer
        theme={scheme === 'dark' ? darkNavigationTheme : lightNavigationTheme}>
        <Stack.Navigator>
          <Stack.Screen name="Timeline" component={Timeline} />
          <Stack.Screen
            name="Profile"
            component={Profile}
            options={{headerShown: false}}
          />
          <Stack.Screen name="Thread" component={Thread} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
};
