import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {useColorScheme} from 'react-native';
import {Profile} from './screens/profile';
import {Explore} from './screens/explore';
import {
  ThemeProvider,
  darkNavigationTheme,
  lightNavigationTheme,
} from './theme';
import {Thread} from './screens/thread';
import {Timeline} from './screens/timeline';
import {RootStackParamList} from './types';
import {PeerProfile} from './screens/peer-profile';
import {useThemeGetters} from './theme/utils';
import {HomeIcon} from './components/icons/HomeIcon';
import {MapIcon} from './components/icons/MapIcon';
import {UserIcon} from './components/icons/UserIcon';
import {User} from './screens/user';
import {ImageViewer} from './screens/image-viewer';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

const iconForTab =
  (tab: 'home' | 'explore' | 'user') =>
  ({focused}: {focused: boolean}) => {
    const {getColor} = useThemeGetters();
    switch (tab) {
      case 'home':
        return (
          <HomeIcon
            color={focused ? getColor('blueAccent') : getColor('primary')}
          />
        );
      case 'explore':
        return (
          <MapIcon
            color={focused ? getColor('blueAccent') : getColor('primary')}
          />
        );
      case 'user':
        return (
          <UserIcon
            color={focused ? getColor('blueAccent') : getColor('primary')}
          />
        );
      default:
        return null;
    }
  };

const TabbedHome = () => (
  <Tab.Navigator screenOptions={{tabBarStyle: {height: 85}}}>
    <Tab.Screen
      name="Home"
      component={Timeline}
      options={{tabBarIcon: iconForTab('home'), tabBarShowLabel: false}}
    />
    <Tab.Screen
      name="Explore"
      component={Explore}
      options={{tabBarIcon: iconForTab('explore'), tabBarShowLabel: false}}
    />
    <Tab.Screen
      name="User"
      component={User}
      options={{tabBarIcon: iconForTab('user'), tabBarShowLabel: false}}
    />
  </Tab.Navigator>
);

export const App = () => {
  const scheme = useColorScheme();

  return (
    <ThemeProvider>
      <NavigationContainer
        theme={scheme === 'dark' ? darkNavigationTheme : lightNavigationTheme}>
        <Stack.Navigator>
          <Stack.Screen
            name="Tabs"
            component={TabbedHome}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Profile"
            component={Profile}
            options={{headerShown: false}}
          />
          <Stack.Screen name="Thread" component={Thread} />
          <Stack.Screen name="PeerProfile" component={PeerProfile} />
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
