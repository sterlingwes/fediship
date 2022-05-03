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
