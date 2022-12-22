import type {Ref} from 'react';

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
  fields: TField[];
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

export interface TField {
  name: string; // plain text
  value: string; // HTML
  verified_at?: string | null;
}

export interface TApp {
  id: string;
  name: string;
  website: string | null;
  redirect_uri: string;
  client_id: string;
  client_secret: string;
  vapid_key: string;
}

export interface TToken {
  access_token: string;
  token_type: string; // Bearer
  scope: string;
  created_at: number;
}

export interface TStatus {
  id: string;
  bookmarked?: boolean;
  created_at: string;
  content: string; // html
  account: TAccount;
  favourited?: boolean;
  favourites_count?: number;
  reblog: TStatusMapped | null;
  reblogged?: boolean;
  reblogs_count?: number;
  url: string | null;
  uri: string;
  in_reply_to_id: string | null;
  replies_count?: number;
  poll: TPoll | null;
  sensitive: boolean;
  pinned?: boolean;
  spoiler_text?: string | null;
  emojis?: Emoji[] | null;
  media_attachments?: TMediaAttachment[];
  visibility: Visibility | string;
}

export interface TStatusMapped extends TStatus {
  sourceHost: string;
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

export enum Visibility {
  Public = 'public', // Visible to everyone, shown in public timelines.
  Unlisted = 'unlisted', // Visible to public, but not included in public timelines.
  Private = 'private', // Visible to followers only, and to any mentioned users.
  Direct = 'direct', // Visible only to mentioned users.
}

// https://docs.joinmastodon.org/entities/attachment/
export interface TMediaAttachment {
  id: string;
  type: string; // 'image' | 'gifv' | 'video' | 'audio';
  url: string;
  preview_url: string;
  remote_url: string;
  text_url: null;
  meta: {
    original: {
      width: number;
      height: number;
      size?: string;
      aspect?: number;
    };
    small: {
      width: number;
      height: number;
      size: string;
      aspect: number;
    };
  };
  description: string | null;
  blurhash: string;
}

export interface Emoji {
  shortcode: string; // without the preceding / ending ':'
  static_url: string;
  url: string;
  visible_in_picker: boolean;
  category?: string;
}

interface TimelineParams {
  timeline: 'home' | 'public';
  ref?: Ref<unknown>;
}

export type RootStackParamList = {
  Tabs: undefined;
  Drawer: undefined;
  Timelines: undefined;
  Local: TimelineParams;
  Federated: TimelineParams;
  Explore: undefined;
  Compose: undefined | {inReplyToId: string; routeTime: number};
  User: undefined;
  About: undefined;
  OSSList: undefined;
  Login: undefined;
  Authorize: {host: string; scope: string};
  UserMain: undefined;
  TagTimeline: {host: string; tag: string};
  TagTimelinePrefs: {
    name: string;
    host: string;
    tag: string;
    nextRoute: string;
  };
  PeerPicker: undefined;
  FavouritesTimeline: {type: 'favourites' | 'bookmarks'};
  StatusActivity: undefined;
  Polls: undefined;
  Profile: {
    account?: TAccount;
    host?: string;
    accountHandle?: string;
    self?: boolean;
  };
  MyProfile: {
    account?: TAccount;
    host?: string;
    accountHandle?: string;
    self?: boolean;
  };
  Thread: {
    statusUrl: string;
    id: string;
    showThreadFavouritedBy?: boolean;
    focusedStatusPreload: TStatusMapped;
  };
  PeerProfile: {host: string};
  ImageViewer: {index: number; attachments: TMediaAttachment[]};
  ImageCaptioner: {
    attachments: Array<{
      uri: string;
      width: number | undefined;
      height: number | undefined;
    }>;
  };
  FollowerList: {source: 'mine' | 'theirs'};
  AppearanceSettings: undefined;
};

export interface Webfinger {
  subject: string; // acct
  aliases: string[];
  links: {rel: string; type: string; href: string}[];
}

export interface APObject {
  '@context': any[];
  id: string;
}

type Url = string;

export interface APPerson extends APObject {
  type: 'Person' | 'Service';
  following: Url;
  followers: Url;
  inbox: Url;
  outbox: Url;
  featured: Url;
  preferredUsername: string;
  name: string;
  summary: string;
  url?: Url;
  manuallyApprovesFollowers: boolean;
  discoverable: boolean;
  publicKey: {
    id: string;
    owner: Url;
    publicKeyPem: string;
  };
  // tag: any[]
  attachment: APPersonAttachment[];
  endpoints: {
    sharedInbox: Url;
  };
  icon?: {
    // avatar
    type: 'Image';
    mediaType: string;
    url: Url;
  };
  image?: {
    // banner
    type: 'Image';
    mediaType: string;
    url: Url;
  };
}

export interface APPersonAttachment {
  type: string;
  name: string;
  value: string;
}

export interface APOrderedCollectionPage<T> extends APObject {
  type: 'OrderedCollectionPage';
  next: Url;
  prev: Url;
  partOf: Url; // main collection url
  orderedItems?: Array<T>;
  items?: Array<T>;
}

export interface APOrderedCollection<T> extends APObject {
  id: string; // url for mastodon collection this is
  type: 'OrderedCollection';
  totalItems: number;
  orderedItems: Array<T>;
}

export interface APCreate extends APObject {
  id: string; // url for mastodon status create
  type: 'Create';
  actor: Url;
  published: string; // datetime
  to: string[];
  cc: string[];
  object: APNote | APAnnounce;
}

interface APAnnounce extends APObject {
  id: string; // url for status activity
  type: 'Announce';
  actor: Url; // booster
  published: string; // datetime
  to: string[];
  cc: string[];
  object: Url; // mastodon status detail
}

type ShortLocale = string; // "en"
export interface APNote extends APObject {
  id: string; // url for mastodon status detail
  type: 'Note';
  summary: null; // ?
  inReplyTo: Url;
  published: string; // datetime
  url: Url;
  attributedTo: string; // actor
  to: string[];
  cc: string[];
  sensitive: boolean;
  atomUri: Url;
  inReplyToAtomUri: Url;
  conversation: string; // some convo ID
  content: string;
  contentMap: Record<ShortLocale, string>;
  attachment: APAttachment[];
  tag: Array<APMention | APHashtag>;
  replies: any[]; // doesn't seem to resolve for mastodon at least
}

export interface APMention extends APObject {
  type: 'Mention';
  href: Url;
  name: string; // @name@host.place
}

export interface APHashtag extends APObject {
  type: 'Hashtag';
  href: Url;
  name: string; // includes #
}

export interface APAttachment extends APObject {
  type: 'Document';
  mediaType: string; // mime type
  url: Url;
  name: string; // content caption / alt
  blurhash: string;
  focalPoint: number[];
  width: number;
  height: number;
}

export interface TStatusContext {
  ancestors?: TStatusMapped[] | undefined;
  descendants?: TStatusMapped[] | undefined;
}

export interface TThread extends TStatusContext {
  status?: TStatusMapped | undefined;
  localStatuses: Record<string, TStatusMapped>;
  localResponse: Omit<TThread, 'localStatuses'> | undefined;
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
  own_votes: number[] | null;
  options: TPollOption[];
  // "emojis": []
}

export type NotificationType =
  | 'follow'
  | 'follow_request'
  | 'mention'
  | 'reblog'
  | 'favourite'
  | 'poll'
  | 'status';

export interface TNotification {
  id: string;
  type: NotificationType;
  created_at: string;
  account: TAccount;
  status?: TStatus | null;
}

export type NormalizedNotif = TNotification & {key: number};
export type NotificationGroups = Record<NotificationType, NormalizedNotif[]>;

export interface TAccountRelationship {
  id: string;
  following: boolean;
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

export interface TPeerTagTrend {
  name: string; // tag name without #
  url: string; // local instance ref (html site)
  history: TagTrendStat[];
}

interface TagTrendStat {
  day: string; // numeric timestamp
  uses: string; // number of uses
  accounts: string; // number of accounts mentioning
}

export interface TProfileResult {
  account: TAccount;
  timeline: TStatusMapped[];
}

export interface TSearchResults {
  accounts: TAccount[];
  statuses: TStatus[];
  hashtags: TPeerTagTrend[];
}
