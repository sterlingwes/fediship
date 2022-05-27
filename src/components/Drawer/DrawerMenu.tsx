import React from 'react';
import {DrawerContentComponentProps} from '@react-navigation/drawer';
import {ScrollView, View} from 'react-native';
import {RootStackParamList} from '../../types';
import {DrawerButton} from './DrawerButton';
import {flex} from '../../utils/styles';
import {StyleCreator} from '../../theme';
import {screenHeight} from '../../dimensions';
import {tabBarHeight} from '../../constants';
import {useThemeStyle} from '../../theme/utils';

export const DrawerMenu = ({
  navigation,
  state,
}: DrawerContentComponentProps) => {
  const styles = useThemeStyle(styleCreator);
  const currentRoute = state.routeNames[state.index];
  const onPress = (route: keyof RootStackParamList) => {
    navigation.navigate(route);
    setTimeout(() => navigation.closeDrawer(), 100);
  };
  return (
    <ScrollView
      style={flex}
      contentContainerStyle={{minHeight: screenHeight - tabBarHeight}}>
      <View style={flex} />
      <DrawerButton
        active={currentRoute === 'Local'}
        onPress={() => onPress('Local')}>
        Local
      </DrawerButton>
      <DrawerButton
        active={currentRoute === 'Federated'}
        onPress={() => onPress('Federated')}>
        Federated
      </DrawerButton>
      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styleCreator: StyleCreator = () => ({
  spacer: {height: 10},
});
