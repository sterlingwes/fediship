import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';
import {Keyboard, KeyboardAvoidingView, Platform, View} from 'react-native';
import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';
import {useMount} from '../utils/hooks';
import {flex} from '../utils/styles';
import {SolidButton} from './SolidButton';

const KeyboardBannerContext = createContext({
  visible: false,
  hide: (_?: boolean) => {},
  show: () => {},
});

export const useKeyboardBanner = () => useContext(KeyboardBannerContext);

type SendListener = () => Promise<boolean | (() => any)>;

const sendListeners: SendListener[] = [];

export const registerSendListener = (listener: SendListener) => {
  sendListeners.push(listener);
  console.log(
    'registered keyboard banner send listener #' + sendListeners.length,
  );
};

export const removeSendListener = (listener: SendListener) => {
  const index = sendListeners.findIndex(l => l === listener);
  if (index === -1) {
    console.warn('Could not remove listener, invalid index');
    return;
  }

  sendListeners.splice(index, 1);
};

const callListeners = async () => {
  const shouldHide = await sendListeners.reduce(async (chain, listener) => {
    const chainResult = await chain;
    const newResult = await listener();
    return chainResult || newResult;
  }, Promise.resolve(false) as ReturnType<SendListener>);
  return shouldHide;
};

export const KeyboardBannerProvider = ({children}: {children: ReactNode}) => {
  const [visible, setVisible] = useState(false);
  const [keyboardShown, setKeyboardShown] = useState(false);

  useMount(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardShown(true),
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardShown(false),
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  });

  const show = useCallback(() => {
    if (visible) {
      return;
    }
    setVisible(true);
  }, [setVisible, visible]);

  const hide = useCallback(
    (hideKeyboard = true) => {
      if (!visible) {
        return;
      }
      setVisible(false);
      if (hideKeyboard) {
        Keyboard.dismiss();
      }
    },
    [setVisible, visible],
  );

  return (
    <KeyboardBannerContext.Provider value={{visible, hide, show}}>
      <KeyboardAvoidingView
        style={flex}
        behavior={Platform.OS === 'android' ? undefined : 'padding'}>
        {children}
        {visible && keyboardShown && (
          <KeyboardBanner onPressSend={callListeners} onHide={hide} />
        )}
      </KeyboardAvoidingView>
    </KeyboardBannerContext.Provider>
  );
};

const KeyboardBanner = ({
  onPressSend,
  onHide,
}: {
  onPressSend: () => ReturnType<SendListener>;
  onHide: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const styles = useThemeStyle(styleCreator);

  const onPress = useCallback(async () => {
    setLoading(true);
    const shouldHide = await onPressSend();
    if (shouldHide) {
      onHide();
    }

    if (typeof shouldHide === 'function') {
      shouldHide();
    }
  }, [setLoading, onPressSend, onHide]);

  return (
    <View style={styles.container}>
      <SolidButton loading={loading} onPress={onPress}>
        Send
      </SolidButton>
    </View>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  container: {
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: getColor('baseHighlight'),
    shadowColor: getColor('contrastTextColor'),
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: -5},
  },
});
