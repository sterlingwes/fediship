import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {User} from './user';
import {FollowerList} from './user/followers';
import {FavouritesTimeline} from './timelines/favourites';
import {AppearanceSettings} from './settings/apperance';
import {StatusActivity} from './timelines/status-activity';
import {Polls} from './timelines/polls';
import {Profile} from './profile';
import {fontStyleFactory} from '../components/Type';
import {useThemeStyle} from '../theme/utils';

const UStack = createNativeStackNavigator();

export const UserStack = () => {
  const styles = useThemeStyle(fontStyleFactory);
  return (
    <UStack.Navigator
      screenOptions={{
        orientation: 'portrait_up',
        headerTitleStyle: styles.nativeHeaderFont,
      }}>
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
        name="StatusActivity"
        component={StatusActivity}
        options={{headerTitle: ''}}
      />
      <UStack.Screen
        name="Polls"
        component={Polls}
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
};
