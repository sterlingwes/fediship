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
}

interface Emoji {
  shortcode: string; // without the preceding / ending ':'
  static_url: string;
  url: string;
  visible_in_picker: true;
}

export type Route = 'timeline' | 'profile' | 'thread';

export type RouteParams = Record<string, string>;

export interface NavigableScreenProps {
  navigation: {
    getParams: () => RouteParams;
    navigate: (route: Route, params?: RouteParams) => void;
  };
}

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
