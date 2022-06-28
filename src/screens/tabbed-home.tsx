import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {tabBarHeight} from '../constants';
import {HomeIcon} from '../components/icons/HomeIcon';
import {MessageIcon} from '../components/icons/MessageIcon';
import {UserIcon} from '../components/icons/UserIcon';
import {TimelineStack} from '../timeline-stack';
import {useNotifications} from '../utils/notifications';
import {Composer} from './composer';
import {UserStack} from './user-stack';
import {useThemeGetters} from '../theme/utils';

const Tab = createBottomTabNavigator();

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

export const TabbedHome = () => {
  const {bottom} = useSafeAreaInsets();
  const {newNotifCount, tabRead} = useNotifications();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {height: tabBarHeight + bottom},
        tabBarHideOnKeyboard: true,
      }}>
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
        component={Composer}
        options={{
          tabBarIcon: iconForTab('compose'),
          tabBarShowLabel: false,
        }}
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
