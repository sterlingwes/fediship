import {ColorSchemeName} from 'react-native';
import {MMKV} from 'react-native-mmkv';

const storage = new MMKV({id: 'settings:appearance'});
const systemTheme = 'system_theme';
const chosenScheme = 'chosen_scheme';
const mediaStatusAll = 'media_status_all';

export const retrieveUseSystemTheme = () =>
  storage.getBoolean(systemTheme) !== false;

export const saveUseSystemTheme = (use: boolean) =>
  storage.set(systemTheme, use);

export const retrieveChosenScheme = () =>
  storage.getString(chosenScheme) as 'light' | 'dark' | undefined;

export const saveChosenScheme = (scheme: ColorSchemeName) => {
  if (scheme !== 'light' && scheme !== 'dark') {
    return;
  }
  storage.set(chosenScheme, scheme);
};

let mediaStatusPrefCache: boolean | undefined;
export const saveMediaStatusAllPref = (on: boolean) => {
  storage.set(mediaStatusAll, on);
  mediaStatusPrefCache = on;
};

export const retrieveMediaStatusAllPref = () => {
  if (mediaStatusPrefCache) {
    return mediaStatusPrefCache;
  }
  const on = storage.getBoolean(mediaStatusAll);
  mediaStatusPrefCache = on;
  return mediaStatusPrefCache;
};
