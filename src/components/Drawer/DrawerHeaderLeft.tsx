import {DrawerNavigationProp} from '@react-navigation/drawer';
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {StyleCreator} from '../../theme/types';
import {useThemeGetters, useThemeStyle} from '../../theme/utils';
import {RootStackParamList} from '../../types';
import {ListIcon} from '../icons/ListIcon';

export const DrawerHeaderLeft = () => {
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();
  const navigation = useNavigation<DrawerNavigationProp<RootStackParamList>>();
  return (
    <TouchableOpacity
      onPress={navigation.toggleDrawer}
      style={styles.touchable}>
      <ListIcon color={getColor('primary')} />
    </TouchableOpacity>
  );
};

const styleCreator: StyleCreator = () => ({
  touchable: {paddingLeft: 12},
});
