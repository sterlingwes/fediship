import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';
import {RootStackParamList} from '../types';
import {BackButton} from './BackButton';
import {Type} from './Type';

interface FloatingHeaderProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  title?: string;
  transparent?: boolean;
}

export const FloatingHeader = ({
  navigation,
  title,
  transparent,
}: FloatingHeaderProps) => {
  const {top} = useSafeAreaInsets();
  const styles = useThemeStyle(styleCreator);

  return (
    <View
      style={[
        styles.header,
        {paddingTop: top || 20},
        !transparent && styles.headerOpaque,
      ]}>
      <BackButton
        onPress={() => navigation.goBack()}
        style={[styles.headerBackBtn]}
        transparent={transparent}
      />
      <Type style={styles.title} semiBold>
        {title ?? ''}
      </Type>
      <View />
    </View>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  header: {
    flexDirection: 'row',
    position: 'absolute',
    left: 0,
    right: 0,
    paddingBottom: 10,
  },
  headerOpaque: {
    backgroundColor: getColor('base'),
    borderBottomColor: getColor('baseHighlight'),
    borderBottomWidth: 1,
  },
  headerBackBtn: {
    marginLeft: 20,
  },
  title: {
    flex: 1,
  },
});
