import {MMKV} from 'react-native-mmkv';
import Toast from 'react-native-toast-message';

const clearable = [
  'settings:appearance',
  'notifications',
  'oauth_apps',
  'oauth_users',
  'active',
];

export const clearStorage = () => {
  clearable.forEach(id => {
    const storage = new MMKV({id});
    storage.clearAll();
  });

  Toast.show({
    type: 'success',
    text1: 'Cleared!',
  });
};
