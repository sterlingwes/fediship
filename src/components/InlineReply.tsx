import React, {useEffect, useRef, useState} from 'react';
import {
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useMyMastodonInstance} from '../api/hooks';
import {StyleCreator} from '../theme';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {useMount} from '../utils/hooks';
import {nanoid} from '../utils/nanoid';
import {Input} from './Input';
import {
  registerSendListener,
  removeSendListener,
  useKeyboardBanner,
} from './KeyboardBanner';
import {ReplyLine} from './ReplyLine';
import {Type} from './Type';
import {useUserProfile} from '../storage/user';
import {Box} from './Box';
import {ExternalLink} from './icons/ExternalLinkIcon';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList, Visibility} from '../types';

export const InlineReply = ({
  inReplyToId,
  onSent,
}: {
  inReplyToId: string;
  onlyReply?: boolean;
  onSent?: () => void;
}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const keyboardBanner = useKeyboardBanner();
  const [textValue, setTextValue] = useState('');
  const [replying, setReplying] = useState(false);
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();
  const idempotency = useRef(nanoid());
  const activeUser = useUserProfile();
  const inputRef = useRef<TextInput | null>();

  const api = useMyMastodonInstance();

  useMount(() => {
    keyboardBanner.show();
    return () => keyboardBanner.hide();
  });

  useEffect(() => {
    const onSend = async () => {
      if (!textValue.trim()) {
        return false;
      }

      await api.sendStatus(
        {
          status: textValue,
          in_reply_to_id: inReplyToId,
          visibility: Visibility.Unlisted,
        },
        idempotency.current, // TODO: merge headers properly in HTTPClient
      );
      setTextValue('');
      setReplying(false);
      onSent?.();
      return true;
    };

    registerSendListener(onSend);
    return () => removeSendListener(onSend);
  }, [textValue, api, inReplyToId, keyboardBanner, onSent]);

  const onPressReply = () => {
    setReplying(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  const onLeaveInput = () => {
    if (!textValue.trim()) {
      setReplying(false);
    }
  };

  return (
    <View style={styles.container}>
      <Box pb={25}>
        <ReplyLine visible height={15} />
        {activeUser && (
          <Image
            source={{uri: activeUser?.avatar_static}}
            style={[styles.userAvatar, replying && styles.userAvatarReplying]}
          />
        )}
      </Box>
      <View style={styles.rightCol}>
        {replying ? (
          <>
            <Type style={styles.yourReply} scale="S" semiBold>
              Your reply:
            </Type>
            <Input
              ref={ref => (inputRef.current = ref)}
              scale="S"
              style={styles.input}
              placeholder="Say something!"
              onChangeText={setTextValue}
              onBlur={onLeaveInput}
              value={textValue}
              multiline
            />
          </>
        ) : (
          <>
            <TouchableOpacity
              activeOpacity={0.5}
              style={styles.replyBtn}
              onPress={onPressReply}>
              <Type color={getColor('baseAccent')}>Reply</Type>
            </TouchableOpacity>
            <ExternalLink
              style={styles.externalLinkIconButton}
              color={getColor('primary')}
              onPress={() =>
                navigation.navigate('Compose', {
                  inReplyToId,
                  routeTime: Date.now(),
                })
              }
            />
          </>
        )}
      </View>
    </View>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  container: {
    flexDirection: 'row',
    paddingLeft: 15,
    borderBottomColor: getColor('baseAccent'),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rightCol: {
    flex: 1,
    paddingTop: 6,
    paddingLeft: 5,
  },
  replyBtn: {
    padding: 10,
  },
  yourReply: {
    marginTop: 10,
    marginBottom: 4,
    paddingLeft: 12,
    color: getColor('primary'),
  },
  input: {
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  userAvatar: {
    width: 60,
    height: 60,
    resizeMode: 'cover',
    borderRadius: 5,
    backgroundColor: getColor('baseAccent'),
    opacity: 0.5,
  },
  userAvatarReplying: {
    opacity: 1,
  },
  externalLinkIconButton: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
});
