import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {View} from 'react-native';
import {SolidButton} from '../components/SolidButton';
import {Type} from '../components/Type';
import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';
import {RootStackParamList} from '../types';
import {centered, flex} from '../utils/styles';

export const Login = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Login'>) => {
  const styles = useThemeStyle(styleCreator);

  const onLogin = () => {
    navigation.navigate('Authorize', {host: 'swj.io', scope: 'read write'});
  };

  return (
    <View style={[flex, centered]}>
      <Type scale="XL">Welcome!</Type>
      <View style={styles.spacer} />
      <SolidButton onPress={onLogin}>Login</SolidButton>
    </View>
  );
};

const styleCreator: StyleCreator = () => ({
  spacer: {height: 20},
});
