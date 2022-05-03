export interface TAccount {
  id: string; // instance specific
  username: string;
  display_name: string;
  avatar: string; // url
  url: string;
}

export interface TStatus {
  id: string;
  created_at: string;
  content: string; // html
  account: TAccount;
  reblog: TStatus | null;
  url: string;
  in_reply_to_id: string; // ?
  poll?: TPoll;
  sensitive: boolean;
  spoiler_text: string;
  emojis: Emoji[];
  media_attachments?: TMediaAttachment[];
}

export interface TMediaAttachment {
  id: string;
  type: 'image';
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

interface Emoji {
  shortcode: string; // without the preceding / ending ':'
  static_url: string;
  url: string;
  visible_in_picker: true;
}

export type RootStackParamList = {
  Timeline: undefined;
  Profile: {statusUrl: string};
  Thread: {statusUrl: string};
};

interface TStatusContext {
  ancestors: TStatus[];
  descendants: TStatus[];
}

export interface TThread extends TStatusContext {
  status: TStatus;
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
  // "own_votes": [],
  options: TPollOption[];
  // "emojis": []
}
