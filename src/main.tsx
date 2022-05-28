import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import React from 'react';
import {LogBox, useColorScheme} from 'react-native';
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
import {UserIcon} from './components/icons/UserIcon';
import {User} from './screens/user';
import {ImageViewer} from './screens/image-viewer';
import {TagTimeline} from './screens/tag-timeline';
import {ErrorBoundary} from './components/ErrorBoundary';
import {FollowerList} from './screens/user/followers';
import {FavouritesTimeline} from './screens/timelines/favourites';
import {NotificationProvider, useNotifications} from './utils/notifications';
import {FavouritesProvider} from './storage/recent-favourites';
import {DrawerMenu} from './components/Drawer/DrawerMenu';
import {DrawerHeaderLeft} from './components/Drawer/DrawerHeaderLeft';
import {tabBarHeight} from './constants';
import {
  SavedTimeline,
  SavedTimelineProvider,
  useSavedTimelines,
} from './storage/saved-timelines';
import {MessageIcon} from './components/icons/MessageIcon';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

LogBox.ignoreLogs([
  // TODO: need to silence this for HTMLView specifically...
  'Warning: Each child in a list should have a unique "key" prop.',
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
  </UStack.Navigator>
);

const componentForTimelineType = (tl: SavedTimeline) => {
  if (tl.type) {
    return Timeline;
  }

  if (tl.tag) {
    return TagTimeline;
  }

  throw new Error(`Unsupported timeline saved: ${tl.name}`);
};

const initialParamsForTimelineType = (tl: SavedTimeline) => {
  if (tl.type) {
    return {timeline: tl.type};
  }

  if (tl.tag) {
    return tl.tag;
  }

  return undefined;
};

const TimelineStack = () => {
  const {timelines} = useSavedTimelines();
  return (
    <Drawer.Navigator
      drawerContent={DrawerMenu}
      screenOptions={{
        swipeEdgeWidth: 60,
        swipeEnabled: true,
        headerLeft: DrawerHeaderLeft,
      }}>
      {timelines.map(tl => (
        <Drawer.Screen
          name={tl.name}
          component={componentForTimelineType(tl)}
          initialParams={initialParamsForTimelineType(tl)}
        />
      ))}
      <Drawer.Screen name="Explore" component={Explore} />
    </Drawer.Navigator>
  );
};

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

const Drawer = createDrawerNavigator();

export const App = () => {
  const scheme = useColorScheme();

  return (
    <ErrorBoundary>
      <NotificationProvider>
        <SavedTimelineProvider>
          <FavouritesProvider>
            <ThemeProvider>
              <NavigationContainer
                theme={
                  scheme === 'dark' ? darkNavigationTheme : lightNavigationTheme
                }>
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
                  <Stack.Screen name="TagTimeline" component={TagTimeline} />
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
          </FavouritesProvider>
        </SavedTimelineProvider>
      </NotificationProvider>
      <Toast />
    </ErrorBoundary>
  );
};
