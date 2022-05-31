import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import React from 'react';
import {LogBox} from 'react-native';
import {Profile} from './screens/profile';
import {Explore} from './screens/explore';
import {
  ThemeProvider,
  darkNavigationTheme,
  lightNavigationTheme,
} from './theme';
import {Thread} from './screens/thread';
import {RootStackParamList} from './types';
import {PeerProfile} from './screens/peer-profile';
import {useTheme, useThemeGetters} from './theme/utils';
import {HomeIcon} from './components/icons/HomeIcon';
import {UserIcon} from './components/icons/UserIcon';
import {User} from './screens/user';
import {ImageViewer} from './screens/image-viewer';
import {TagTimeline} from './screens/tag-timeline';
import {ErrorBoundary} from './components/ErrorBoundary';
import {FollowerList} from './screens/user/followers';
import {FavouritesTimeline} from './screens/timelines/favourites';
import {NotificationProvider, useNotifications} from './utils/notifications';
import {FavouritesProvider} from './storage/recent-favourites';
import {tabBarHeight} from './constants';
import {SavedTimelineProvider} from './storage/saved-timelines';
import {MessageIcon} from './components/icons/MessageIcon';
import {AppearanceSettings} from './screens/settings/apperance';
import {TimelineStack} from './timeline-stack';
import {Authorize} from './screens/user/authorize';
import {AuthProvider, useAuth} from './storage/auth';
import {Login} from './screens/login';
import {KeyboardBannerProvider} from './components/KeyboardBanner';
import {useUserProfile} from './storage/user';

const Tab = createBottomTabNavigator();

LogBox.ignoreLogs([
  // TODO: need to silence this for HTMLView specifically...
  'Warning: Each child in a list should have a unique "key" prop.',
  // TODO: need to patch rn video
  'ViewPropTypes will be removed from React Native',
]);

const iconForTab =
  (tab: 'home' | 'compose' | 'user') =>
  ({focused}: {focused: boolean}) => {
    const {getColor} = useThemeGetters();
    switch (tab) {
      case 'home':
        return (
          <HomeIcon
            color={focused ? getColor('blueAccent') : getColor('primary')}
          />
        );
      case 'compose':
        return (
          <MessageIcon
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

const UStack = createNativeStackNavigator();

const UserStack = () => (
  <UStack.Navigator>
    <UStack.Screen
      name="UserMain"
      component={User}
      options={{headerTitle: 'You'}}
    />
    <UStack.Screen
      name="FollowerList"
      component={FollowerList}
      options={{headerTitle: ''}}
    />
    <UStack.Screen
      name="FavouritesTimeline"
      component={FavouritesTimeline}
      options={{headerTitle: ''}}
    />
    <UStack.Screen
      name="MyProfile"
      component={Profile}
      options={{headerShown: false}}
    />
    <UStack.Screen
      name="AppearanceSettings"
      component={AppearanceSettings}
      options={{headerTitle: 'Appearance'}}
    />
  </UStack.Navigator>
);

const TabbedHome = () => {
  const {newNotifCount, tabRead} = useNotifications();
  return (
    <Tab.Navigator screenOptions={{tabBarStyle: {height: tabBarHeight}}}>
      <Tab.Screen
        name="Timelines"
        component={TimelineStack}
        options={{
          tabBarIcon: iconForTab('home'),
          tabBarShowLabel: false,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Compose"
        component={Explore}
        options={{tabBarIcon: iconForTab('compose'), tabBarShowLabel: false}}
      />
      <Tab.Screen
        name="User"
        component={UserStack}
        options={{
          tabBarIcon: iconForTab('user'),
          tabBarShowLabel: false,
          tabBarBadge: !tabRead && newNotifCount ? newNotifCount : undefined,
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

const LIStack = createNativeStackNavigator<RootStackParamList>();
const LoggedInStack = () => (
  <LIStack.Navigator>
    <LIStack.Screen
      name="Tabs"
      component={TabbedHome}
      options={{headerShown: false}}
    />

    <LIStack.Screen
      name="Profile"
      component={Profile}
      options={{headerShown: false}}
    />
    <LIStack.Screen name="Thread" component={Thread} />
    <LIStack.Screen name="PeerProfile" component={PeerProfile} />
    <LIStack.Screen name="TagTimeline" component={TagTimeline} />
    <LIStack.Screen
      name="ImageViewer"
      component={ImageViewer}
      options={{
        presentation: 'containedTransparentModal',
        headerShown: false,
      }}
    />
  </LIStack.Navigator>
);

const LOStack = createNativeStackNavigator<RootStackParamList>();
const LoggedOutStack = () => (
  <LOStack.Navigator>
    <LOStack.Screen
      name="Login"
      component={Login}
      options={{headerShown: false}}
    />
    <LOStack.Screen name="Authorize" component={Authorize} />
  </LOStack.Navigator>
);

const NavigationRoot = () => {
  const theme = useTheme();
  const auth = useAuth();
  useUserProfile();

  return (
    <NavigationContainer
      theme={
        theme.activeScheme === 'dark'
          ? darkNavigationTheme
          : lightNavigationTheme
      }>
      {auth.token ? <LoggedInStack /> : <LoggedOutStack />}
    </NavigationContainer>
  );
};

export const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <SavedTimelineProvider>
            <FavouritesProvider>
              <ThemeProvider>
                <KeyboardBannerProvider>
                  <NavigationRoot />
                </KeyboardBannerProvider>
              </ThemeProvider>
            </FavouritesProvider>
          </SavedTimelineProvider>
        </NotificationProvider>
      </AuthProvider>
      <Toast />
    </ErrorBoundary>
  );
};
