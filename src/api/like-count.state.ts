import {MMKV} from 'react-native-mmkv';
import {TStatus} from '../types';
import {getUserFQNFromAccount} from '../utils/mastodon';

interface LikeCountState {
  authorLikeCountLookup: Record<string, number>;
  authorDislikeCountLookup: Record<string, number>;
  boosterLikeCountLookup: Record<string, number>;
  boosterDislikeCountLookup: Record<string, number>;
}

export type LikeCountStateKey = keyof LikeCountState;

const initialCountState = {
  authorLikeCountLookup: {},
  authorDislikeCountLookup: {},
  boosterLikeCountLookup: {},
  boosterDislikeCountLookup: {},
};

const likeCountStatePersisted = new MMKV({id: 'likecount'});

const save = (key: keyof LikeCountState, lookup: Record<string, number>) =>
  likeCountStatePersisted.set(key, JSON.stringify(lookup));

const loadLikeCountState = () => {
  return likeCountStatePersisted.getAllKeys().reduce(
    (acc, key) => ({
      ...acc,
      [key]: JSON.parse(likeCountStatePersisted.getString(key) ?? '{}'),
    }),
    initialCountState,
  );
};

export const likeCountState: LikeCountState = loadLikeCountState();

export const saveStatusLike = (status: TStatus) => {
  if (status.reblog) {
    const reblogger = getUserFQNFromAccount(status.account);
    likeCountState.boosterLikeCountLookup[reblogger] =
      (likeCountState.boosterLikeCountLookup[reblogger] ?? 0) + 1;
    save('boosterLikeCountLookup', likeCountState.boosterLikeCountLookup);

    const author = getUserFQNFromAccount(status.reblog.account);
    likeCountState.authorLikeCountLookup[author] =
      (likeCountState.authorLikeCountLookup[author] ?? 0) + 1;
    save('authorLikeCountLookup', likeCountState.authorLikeCountLookup);
  } else {
    const author = getUserFQNFromAccount(status.account);
    likeCountState.authorLikeCountLookup[author] =
      (likeCountState.authorLikeCountLookup[author] ?? 0) + 1;
    save('authorLikeCountLookup', likeCountState.authorLikeCountLookup);
  }
};

export const saveStatusDislike = (status: TStatus) => {
  if (status.reblog) {
    const reblogger = getUserFQNFromAccount(status.account);
    likeCountState.boosterDislikeCountLookup[reblogger] =
      (likeCountState.boosterDislikeCountLookup[reblogger] ?? 0) + 1;
    save('boosterDislikeCountLookup', likeCountState.boosterDislikeCountLookup);

    const author = getUserFQNFromAccount(status.reblog.account);
    likeCountState.authorDislikeCountLookup[author] =
      (likeCountState.authorDislikeCountLookup[author] ?? 0) + 1;
    save('authorDislikeCountLookup', likeCountState.authorDislikeCountLookup);
  } else {
    const author = getUserFQNFromAccount(status.account);
    likeCountState.authorDislikeCountLookup[author] =
      (likeCountState.authorDislikeCountLookup[author] ?? 0) + 1;
    save('authorDislikeCountLookup', likeCountState.authorDislikeCountLookup);
  }
};
