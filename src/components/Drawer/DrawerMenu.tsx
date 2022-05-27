import React from 'react';
import {DrawerContentComponentProps} from '@react-navigation/drawer';
import {ScrollView, View} from 'react-native';
import {RootStackParamList} from '../../types';
import {DrawerButton} from './DrawerButton';
import {flex} from '../../utils/styles';
import {StyleCreator} from '../../theme';
import {screenHeight} from '../../dimensions';
import {useThemeStyle} from '../../theme/utils';
import {tabBarHeight} from '../../constants';
import {useSavedTimelines} from '../../storage/saved-timelines';

export const DrawerMenu = ({
  navigation,
  state,
}: DrawerContentComponentProps) => {
  const styles = useThemeStyle(styleCreator);
  const {timelines} = useSavedTimelines();
  const currentRoute = state.routeNames[state.index];
  const onPress = (route: keyof RootStackParamList) => {
    navigation.navigate(route);
    setTimeout(() => navigation.closeDrawer(), 150);
  };
  return (
    <ScrollView
      style={flex}
      contentContainerStyle={{minHeight: screenHeight - tabBarHeight * 2}}>
      <View style={flex} />
      {timelines.map(tl => (
        <DrawerButton
          key={tl.name}
          active={currentRoute === tl.name}
          onPress={() => onPress(tl.name as keyof RootStackParamList)}>
          {tl.name}
        </DrawerButton>
      ))}
      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styleCreator: StyleCreator = () => ({
  spacer: {height: 10},
});
