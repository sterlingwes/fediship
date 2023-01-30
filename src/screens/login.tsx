import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {View} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import {globalAuthPersist} from '../api/user.state';
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
  route,
}: NativeStackScreenProps<RootStackParamList, 'Login'>) => {
  const {secondary} = route.params ?? {};
  const auth = useAuth();
  const [host, setHost] = useState('');
  const {getColor} = useThemeGetters();
  const styles = useThemeStyle(styleCreator);

  const onLogin = () => {
    if (secondary) {
      navigation.navigate('AuthorizeAnother', {
        host,
        scope: oauthScopes,
        secondary,
      });
    } else {
      auth.setAuth({host});
      navigation.navigate('Authorize', {host, scope: oauthScopes});
    }
  };

  return (
    <View style={[flex, centered]}>
      <Type scale="XL">Where does this account live?</Type>
      <View style={styles.spacer} />
      <TextInput
        value={host}
        onChangeText={setHost}
        style={styles.input}
        placeholder="example.com"
        placeholderTextColor={getColor('contrastAccent')}
        keyboardType="url"
        autoCorrect={false}
        spellCheck={false}
        autoCapitalize="none"
      />
      <View style={styles.spacer} />
      <SolidButton onPress={onLogin} disabled={!host}>
        {secondary ? 'Authorize' : 'Login'}
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
