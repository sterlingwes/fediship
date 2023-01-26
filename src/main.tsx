import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import React from 'react';
import {LogBox, Platform} from 'react-native';
import {Profile} from './screens/profile';
import {
  ThemeProvider,
  darkNavigationTheme,
  lightNavigationTheme,
} from './theme';
import {Thread} from './screens/thread';
import {RootStackParamList} from './types';
import {PeerProfile} from './screens/peer-profile';
import {useTheme, useThemeStyle} from './theme/utils';

import {ImageViewer} from './screens/image-viewer';
import {TagTimeline} from './screens/tag-timeline';
import {ErrorBoundary} from './components/ErrorBoundary';
import {NotificationProvider} from './utils/notifications';

import {SavedTimelineProvider} from './storage/saved-timelines';
import {Authorize} from './screens/user/authorize';
import {AuthProvider, useAuth} from './storage/auth';
import {Login} from './screens/login';
import {KeyboardBannerProvider} from './components/KeyboardBanner';
import {useUserProfile} from './storage/user';

import {NoNetworkCheck} from './components/NoNetworkCheck';
import {TagTimelinePrefs} from './screens/settings/tag-timeline-prefs';
import {PeerPicker} from './screens/settings/peer-picker';
import {HeaderRightButton} from './components/HeaderRightButton';
import {XIcon} from './components/icons/XIcon';
import {ImageCaptioner} from './screens/image-captioner';

import {OSSList} from './screens/about/oss-list';
import {About} from './screens/about/about';
import {TabbedHome} from './screens/tabbed-home';
import {fontStyleFactory} from './components/Type';

LogBox.ignoreLogs([
  // TODO: need to patch rn video
  'ViewPropTypes will be removed from React Native',
  // Was a recent change with fetch proxy work, but...
  'Require cycle: node_modules/react-native/Libraries/Network/fetch.js',
]);

const LIStack = createNativeStackNavigator<RootStackParamList>();
const LoggedInStack = () => {
  const styles = useThemeStyle(fontStyleFactory);
  return (
    <LIStack.Navigator
      screenOptions={{
        orientation: 'portrait_up',
        headerTitleStyle: styles.nativeHeaderFont,
      }}>
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
      <LIStack.Screen name="TagTimelinePrefs" component={TagTimelinePrefs} />
      <LIStack.Screen
        name="PeerPicker"
        component={PeerPicker}
        options={{
          presentation: 'fullScreenModal',
          headerTitle: 'Choose Instance',
          headerRight: props =>
            Platform.OS === 'ios' ? (
              <HeaderRightButton back={props.canGoBack} IconComponent={XIcon} />
            ) : null,
        }}
      />
      <LIStack.Screen
        name="ImageViewer"
        component={ImageViewer}
        options={{
          presentation: 'containedTransparentModal',
          headerShown: false,
          orientation: 'all',
        }}
      />
      <LIStack.Screen
        name="ImageCaptioner"
        component={ImageCaptioner}
        options={{
          presentation: 'containedTransparentModal',
          headerShown: false,
          orientation: 'all',
        }}
      />
      <LIStack.Screen
        name="About"
        component={About}
        options={{
          headerTitle: 'About the App',
          orientation: 'portrait',
        }}
      />
      <LIStack.Screen
        name="OSSList"
        component={OSSList}
        options={{
          headerTitle: '🙏 Open Source ♥️',
          orientation: 'portrait',
        }}
      />
    </LIStack.Navigator>
  );
};

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
        theme.activeScheme === 'light'
          ? lightNavigationTheme
          : darkNavigationTheme
      }>
      {auth.token ? <LoggedInStack /> : <LoggedOutStack />}
    </NavigationContainer>
  );
};

export const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NoNetworkCheck>
          <AuthProvider>
            <NotificationProvider>
              <SavedTimelineProvider>
                <KeyboardBannerProvider>
                  <NavigationRoot />
                </KeyboardBannerProvider>
              </SavedTimelineProvider>
            </NotificationProvider>
          </AuthProvider>
        </NoNetworkCheck>
      </ThemeProvider>
      <Toast />
    </ErrorBoundary>
  );
};
