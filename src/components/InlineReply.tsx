import React, {useEffect, useRef, useState} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {useMyMastodonInstance} from '../api/hooks';
import {StyleCreator} from '../theme';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {useMount} from '../utils/hooks';
import {flex} from '../utils/styles';
import {nanoid} from '../utils/nanoid';
import {Input} from './Input';
import {
  registerSendListener,
  removeSendListener,
  useKeyboardBanner,
} from './KeyboardBanner';
import {ReplyLine} from './ReplyLine';
import {Type} from './Type';

export const InlineReply = ({inReplyToId}: {inReplyToId: string}) => {
  const keyboardBanner = useKeyboardBanner();
  const [textValue, setTextValue] = useState('');
  const [replying, setReplying] = useState(false);
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();
  const idempotency = useRef(nanoid());

  const api = useMyMastodonInstance();

  useMount(() => {
    keyboardBanner.show();
    return () => keyboardBanner.hide();
  });

  useEffect(() => {
    const onSend = async () => {
      await api.sendStatus(
        {status: textValue, in_reply_to_id: inReplyToId},
        idempotency.current, // TODO: merge headers properly in HTTPClient
      );
      // TODO: refresh thread and ensure just-sent response is at the top
      keyboardBanner.hide(true);
    };

    registerSendListener(onSend);
    return () => removeSendListener(onSend);
  }, [textValue, api, inReplyToId, keyboardBanner]);

  return (
    <View style={styles.container}>
      <View style={styles.leftCol}>
        <ReplyLine visible stretch />
      </View>
      <View style={flex}>
        {replying ? (
          <>
            <Type style={styles.yourReply} scale="S" semiBold>
              Your reply:
            </Type>
            <Input
              scale="S"
              style={styles.input}
              placeholder="Say something!"
              onChangeText={setTextValue}
              value={textValue}
              multiline
            />
          </>
        ) : (
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.replyBtn}
            onPress={() => setReplying(true)}>
            <Type color={getColor('baseAccent')}>Reply</Type>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  container: {
    flexDirection: 'row',
    paddingLeft: 44.5, // TODO: find a better way to align
  },
  leftCol: {
    flexDirection: 'column',
    marginRight: 34,
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
    marginBottom: 10,
  },
});
