import {MMKV} from 'react-native-mmkv';
import Toast from 'react-native-toast-message';

export const clearStorage = () => {
  const notifications = new MMKV({id: 'notifications'});
  notifications.clearAll();
  Toast.show({
    type: 'success',
    text1: 'Cleared!',
  });
};
