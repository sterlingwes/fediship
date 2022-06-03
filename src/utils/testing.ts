import {MMKV} from 'react-native-mmkv';
import Toast from 'react-native-toast-message';

const clearable = [
  'active',
  'notifications',
  'oauth_apps',
  'oauth_users',
  'settings:appearance',
  'timelines',
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
