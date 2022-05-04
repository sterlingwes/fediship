import {MMKV} from 'react-native-mmkv';
import {TPeerInfo} from '../../types';

const storage = new MMKV({id: 'peerInstanceInfo'});

export const getPeerStorageKeys = () => storage.getAllKeys();

export const getPeerInfo = (peerHostName: string) => {
  const value = storage.getString(peerHostName);
  if (value) {
    return JSON.parse(value);
  }
};

export const savePeerInfo = (
  peerHostName: string,
  peerInfo: TPeerInfo | null,
) => {
  storage.set(peerHostName, JSON.stringify(peerInfo));
};
