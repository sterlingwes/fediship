import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {View} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import {SolidButton} from '../components/SolidButton';
import {Type} from '../components/Type';
import {oauthScopes} from '../constants';
import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';
import {RootStackParamList} from '../types';
import {centered, flex} from '../utils/styles';

export const Login = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Login'>) => {
  const [host, setHost] = useState('');
  const styles = useThemeStyle(styleCreator);

  const onLogin = () => {
    navigation.navigate('Authorize', {host, scope: oauthScopes});
  };

  return (
    <View style={[flex, centered]}>
      <Type scale="XL">Welcome!</Type>
      <View style={styles.spacer} />
      <TextInput
        value={host}
        onChangeText={setHost}
        style={styles.input}
        placeholder="example.com"
      />
      <View style={styles.spacer} />
      <SolidButton onPress={onLogin} disabled={!host}>
        Login
      </SolidButton>
    </View>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  spacer: {height: 20},
  input: {
    backgroundColor: getColor('baseAccent'),
    width: '80%',
    borderRadius: 10,
    paddingHorizontal: 16,
  },
});
