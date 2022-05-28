import {ColorSchemeName} from 'react-native';
import {MMKV} from 'react-native-mmkv';

const storage = new MMKV({id: 'settings:appearance'});
const systemTheme = 'system_theme';
const chosenScheme = 'chosen_scheme';

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
