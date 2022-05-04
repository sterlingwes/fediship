import {EffectCallback, useEffect} from 'react';
import {BackHandler} from 'react-native';

// eslint-disable-next-line react-hooks/exhaustive-deps
export const useMount = (fn: EffectCallback) => useEffect(fn, []);

export const useBackHandler = (onBack: () => boolean | null | undefined) => {
  useMount(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);

    return () => sub.remove();
  });
};
