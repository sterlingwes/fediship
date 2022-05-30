import type {MMKV} from 'react-native-mmkv';

export const readJson = <T, D = undefined>(
  key: string,
  storage: MMKV,
  defaultValue?: D,
) => {
  const value = storage.getString(key);
  if (!value) {
    return defaultValue as D;
  }

  try {
    return JSON.parse(value) as T;
  } catch (e) {}

  return defaultValue as D;
};
