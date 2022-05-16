export interface TAccount {
  id: string; // instance specific
  acct: string; // same as username
  avatar: string; // url
  avatar_static: string; // version w/ no animation?
  bot: boolean;
  created_at: string;
  discoverable: boolean;
  display_name: string;
  emojis: Emoji[];
  fields: any[];
  followers_count: number;
  following_count: number;
  group: boolean;
  header: string; // url
  header_static: string;
  last_status_at: string;
  locked: boolean;
  note: string;
  statuses_count: number;
  url: string;
  username: string;
}

export interface TStatus {
  id: string;
  created_at: string;
  content: string; // html
  account: TAccount;
  favourited: boolean;
  reblog: TStatus | null;
  reblogged: boolean;
  url: string | null;
  uri: string;
  in_reply_to_id: string; // ?
  poll?: TPoll;
  sensitive: boolean;
  spoiler_text: string;
  emojis: Emoji[];
  media_attachments?: TMediaAttachment[];
}

// misskey "status"
export interface TNote {
  id: string;
  createdAt: string;
  userId: string;
  user: {
    id: string;
    name: string;
    username: string;
    host: string | null;
    avatarUrl: string;
    avatarBlurhash: string;
    avatarColor: string | null;
    isAdmin: boolean;
    emojis: [];
    onlineStatus: string;
  };
  text: string;
  cw: null;
  visibility: string;
  renoteCount: number;
  repliesCount: number;
  reactions: Record<string, number>;
  emojis: [];
  fileIds: [];
  files: [];
  replyId: string;
  renoteId: string;
}

// https://docs.joinmastodon.org/entities/attachment/
export interface TMediaAttachment {
  id: string;
  type: 'image' | 'gifv' | 'video' | 'audio';
  url: string;
  preview_url: string;
  remote_url: string;
  text_url: null;
  meta: {
    original: {
      width: number;
      height: number;
      size: string;
      aspect: number;
    };
    small: {
      width: number;
      height: number;
      size: string;
      aspect: number;
    };
  };
  description: string;
  blurhash: string;
}

export interface Emoji {
  shortcode: string; // without the preceding / ending ':'
  static_url: string;
  url: string;
  visible_in_picker: true;
}

export type RootStackParamList = {
  Tabs: undefined;
  Home: undefined;
  Explore: undefined;
  User: undefined;
  Profile: {statusUrl?: string; account?: TAccount};
  Thread: {statusUrl: string; id: string};
  PeerProfile: TPeerInfo;
  ImageViewer: TMediaAttachment;
};

export interface TStatusContext {
  ancestors?: TStatus[] | undefined;
  descendants?: TStatus[] | undefined;
}

export interface TThread extends TStatusContext {
  status?: TStatus | undefined;
  localStatuses: Record<string, TStatus>;
}

interface TPollOption {
  title: string;
  votes_count: number;
}

export interface TPoll {
  id: string;
  expires_at: string; // "2022-05-03T01:20:16.000Z",
  expired: boolean;
  multiple: boolean;
  votes_count: number;
  voters_count: number;
  voted: boolean;
  own_votes: number[];
  options: TPollOption[];
  // "emojis": []
}

export interface TPeerInfo {
  uri: string; // peer host
  title: string;
  short_description: string;
  description: string;
  email: string; // contact email
  version: string; // mastodon version
  urls: {
    streaming_api: string; // wss url
  };
  stats: {
    user_count: number;
    status_count: number;
    domain_count: number;
  };
  thumbnail: string; // url
  languages: string[]; // locale like 'en'
  registrations: boolean;
  approval_required: boolean;
}

export interface TProfileResult {
  account: TAccount;
  timeline: TStatus[];
}
