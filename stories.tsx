import React from 'react';
import {
  AppRegistry,
  FlatList,
  ListRenderItem,
  useColorScheme,
} from 'react-native';

import {name as appName} from './app.json';
import {Status} from './src/components/Status';

import {
  darkNavigationTheme,
  lightNavigationTheme,
  StyleCreator,
  ThemeProvider,
} from './src/theme';
import {useThemeStyle} from './src/theme/utils';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ImageViewer} from './src/screens/image-viewer';
import {TStatusMapped} from './src/types';

import statusOneImage from './fixtures/status-one-image.json';
import statusThreeImage from './fixtures/status-three-image.json';
import statusThreeImageVaried from './fixtures/status-three-image-varied.json';
import statusFourImage from './fixtures/status-four-image.json';
import statusFiveImage from './fixtures/status-five-image.json';
import statusTwoImageLandscape from './fixtures/status-two-image-landscape.json';
import statusTwoImage from './fixtures/status-two-image.json';
import statusPixelfed from './fixtures/status-pixelfed-linebreaks.json';
import statusBrPs from './fixtures/status-paragraphs-and-linebreaks.json';
import statusLong from './fixtures/status-long.json';
import statusVideo from './fixtures/status-video.json';
import statusMicroformatsHcard from './fixtures/status-microformats-hcard.json';

const defaultAdditionalProps = {
  isLocal: true,
  onPress: () => {},
};

const statuses: TStatusMapped[] = [
  statusMicroformatsHcard,
  statusVideo,
  statusLong,
  statusOneImage,
  statusTwoImage,
  statusTwoImageLandscape,
  statusThreeImage,
  statusThreeImageVaried,
  statusFourImage,
  statusFiveImage,
  statusPixelfed,
  statusBrPs,
].map(s => ({
  ...s,
  sourceHost: '',
  reblog: s.reblog ? {...s.reblog, sourceHost: ''} : null,
}));

const StatusStory = () => {
  const styles = useThemeStyle(styleCreator);

  const renderStatus: ListRenderItem<TStatusMapped> = ({item}) => (
    <Status {...{...item, ...defaultAdditionalProps}} />
  );

  return (
    <FlatList
      style={styles.wrapper}
      data={statuses}
      renderItem={renderStatus}
    />
  );
};

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

const styleCreator: StyleCreator = () => ({
  wrapper: {
    flex: 1,
  },
});

AppRegistry.registerComponent(appName, () => StoryContainer);
