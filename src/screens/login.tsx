import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {View} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import {SolidButton} from '../components/SolidButton';
import {Type} from '../components/Type';
import {oauthScopes} from '../constants';
import {useAuth} from '../storage/auth';
import {StyleCreator} from '../theme';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {RootStackParamList} from '../types';
import {centered, flex} from '../utils/styles';

export const Login = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Login'>) => {
  const auth = useAuth();
  const [host, setHost] = useState('');
  const {getColor} = useThemeGetters();
  const styles = useThemeStyle(styleCreator);

  const onLogin = () => {
    auth.setAuth({host});
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
        placeholderTextColor={getColor('baseHighlight')}
        keyboardType="url"
        autoCorrect={false}
        spellCheck={false}
        autoCapitalize="none"
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
    color: getColor('baseTextColor'),
    width: '80%',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
