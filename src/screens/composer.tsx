import React, {useEffect, useRef, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {nanoid} from '../utils/nanoid';

import {useMyMastodonInstance} from '../api/hooks';
import {Box} from '../components/Box';
import {Input} from '../components/Input';
import {
  registerSendListener,
  removeSendListener,
  useKeyboardBanner,
} from '../components/KeyboardBanner';
import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';
import {useMount} from '../utils/hooks';
import {flex} from '../utils/styles';
import {screenHeight} from '../dimensions';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {RootStackParamList} from '../types';

export const Composer = ({
  navigation,
}: BottomTabScreenProps<RootStackParamList, 'Compose'>) => {
  const api = useMyMastodonInstance();
  const keyboardBanner = useKeyboardBanner();
  const [textValue, setTextValue] = useState('');
  const styles = useThemeStyle(styleCreator);
  const idempotency = useRef(nanoid());

  useMount(() => {
    keyboardBanner.show();
    return () => keyboardBanner.hide();
  });

  useEffect(() => {
    const onSend = async () => {
      if (!textValue.trim()) {
        return false;
      }

      await api.sendStatus({status: textValue}, idempotency.current);
      return () => {
        setTextValue('');
        navigation.navigate('Profile', {self: true});
      };
    };

    registerSendListener(onSend);
    return () => removeSendListener(onSend);
  }, [textValue, api, keyboardBanner, navigation]);

  return (
    <View style={flex}>
      <ScrollView style={flex}>
        <Box ph={15} pv={12}>
          <Input
            autoFocus
            scale="M"
            placeholder="Say something!"
            onChangeText={setTextValue}
            value={textValue}
            multiline
            style={styles.input}
          />
        </Box>
      </ScrollView>
    </View>
  );
};

const styleCreator: StyleCreator = () => ({
  container: {},
  input: {
    minHeight: screenHeight / 3,
  },
});
