import {TPeerInfo} from '../../types';
import {getPeerInfo, getPeerStorageKeys} from './peer-storage';

export const getRankedPeers = () => {
  const keys = getPeerStorageKeys();
  const peerInfos = keys
    .map(key => getPeerInfo(key))
    .filter(info => !!info) as TPeerInfo[];
  return peerInfos.sort((a, b) => {
    if (!a.stats) {
      return 1;
    }
    if (!b.stats) {
      return -1;
    }
    if (!a.stats || !b.stats) {
      return 0;
    }
    return b.stats.user_count - a.stats.user_count;
  });
};
