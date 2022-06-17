import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';
import Animated from 'react-native-reanimated';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';
import {RootStackParamList} from '../types';
import {BackButton} from './BackButton';
import {Type} from './Type';

interface FloatingHeaderProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  title?: string;
  transparent?: boolean;
  style?: ViewStyle;
}

export const FloatingHeader = ({
  navigation,
  title,
  style,
}: FloatingHeaderProps) => {
  const {top} = useSafeAreaInsets();
  const styles = useThemeStyle(styleCreator);

  return (
    <View style={[styles.header, {paddingTop: top || 20}]}>
      <Animated.View style={[styles.headerOpaque, style]} />
      <Animated.View style={[styles.title, style]}>
        <SafeAreaView edges={['top']}>
          <Type center scale="XS" semiBold>
            {title ?? ''}
          </Type>
        </SafeAreaView>
      </Animated.View>
      <BackButton
        onPress={() => navigation.goBack()}
        style={[styles.headerBackBtn]}
      />
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: getColor('base'),
    borderBottomColor: getColor('baseHighlight'),
    borderBottomWidth: 1,
  },
  headerBackBtn: {
    top: -5,
    marginLeft: 20,
  },
  title: {
    paddingTop: 10,
    ...StyleSheet.absoluteFillObject,
  },
});
