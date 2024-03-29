import {
  APAttachment,
  APCreate,
  APNote,
  APOrderedCollection,
  APOrderedCollectionPage,
  APPerson,
  APPersonAttachment,
  TAccount,
  TField,
  TMediaAttachment,
  TStatusMapped,
  Visibility,
} from '../types';

const transformFields = (attachments: APPersonAttachment[]): TField[] => {
  return (attachments ?? [])
    .filter(attch => attch.type === 'PropertyValue')
    .map(({name, value}) => ({name, value}));
};

export const transformPerson = (
  profileHref: string,
  person: APPerson,
): TAccount => {
  const urlParts = (person.url || profileHref).split('/');
  let handle = urlParts.pop();
  const host = urlParts[2]; // after protocol and empty?

  if (typeof handle === 'string' && handle[0] === '@') {
    handle = handle.substring(1);
  }

  return {
    id: `${handle}@${host}`,
    acct: handle ?? person.preferredUsername,
    avatar: person.icon?.url ?? '',
    avatar_static: person.icon?.url ?? '',
    bot: person.type === 'Service',
    created_at: '',
    discoverable: person.discoverable,
    display_name: person.name,
    emojis: [],
    fields: transformFields(person.attachment),
    followers_count: 0,
    following_count: 0,
    group: false,
    header: person.image?.url ?? '',
    header_static: person.image?.url ?? '',
    last_status_at: '',
    locked: person.manuallyApprovesFollowers, // TODO check
    note: person.summary,
    statuses_count: 0,
    url: person.url ?? profileHref,
    username: handle ?? person.preferredUsername,
  };
};

const typeForMime = (mime: string) => {
  return mime.startsWith('video') ? 'video' : 'image';
};

const transformDocument = ({
  id,
  mediaType,
  url,
  blurhash,
  width,
  height,
  name,
}: APAttachment): TMediaAttachment => ({
  id,
  type: typeForMime(mediaType),
  url,
  preview_url: url,
  remote_url: url,
  text_url: null,
  meta: {
    original: {
      width,
      height,
      aspect: width / height,
      size: `${width}x${height}`,
    },
    small: {
      width,
      height,
      aspect: width / height,
      size: `${width}x${height}`,
    },
  },
  description: name,
  blurhash,
});

// see https://github.com/mastodon/mastodon/blob/1060666c583670bb3b89ed5154e61038331e30c3/app/lib/activitypub/parser/status_parser.rb#L75
const guessVisibility = ({to, cc}: {to?: string[]; cc?: string[]}) => {
  if (to && to.find(recip => recip.toLowerCase().endsWith('#public'))) {
    return Visibility.Public;
  }

  if (cc && cc.find(recip => recip.toLowerCase().endsWith('#public'))) {
    return Visibility.Unlisted;
  }

  if (cc && cc.find(recip => recip.toLowerCase().endsWith('followers'))) {
    return Visibility.Private;
  }

  return Visibility.Direct;
};

export const transformActivity = (
  {id, to, cc, published, content, url, sensitive, attachment}: APNote,
  {account, host, pinned}: {account: TAccount; host: string; pinned?: boolean},
): TStatusMapped => ({
  id,
  bookmarked: false,
  created_at: published,
  edited_at: undefined,
  content,
  account,
  pinned,
  favourited: false,
  favourites_count: undefined,
  reblog: null,
  reblogged: false,
  reblogs_count: undefined,
  url,
  uri: url,
  in_reply_to_id: null,
  replies_count: undefined,
  poll: null, // TODO: figure out
  sensitive,
  spoiler_text: undefined,
  sourceHost: host,
  emojis: undefined,
  visibility: guessVisibility({to, cc}),
  media_attachments: attachment
    ? attachment.map(doc => transformDocument(doc))
    : [],
});

export const transformActivityPage = (
  activities: APOrderedCollectionPage<APCreate>,
  account: TAccount,
  host: string,
) =>
  (activities.orderedItems ?? activities.items ?? [])
    // filter out boosts & replies to simplify
    .filter(item => item.object.type === 'Note' && !item.object.inReplyTo)
    .map(activity =>
      transformActivity(activity.object as APNote, {account, host}),
    );

export const isPerson = (object: any): object is APPerson =>
  typeof object === 'object' &&
  ['Person', 'Group', 'Service'].includes(object.type);

export const isOutboxCollection = (
  object: any,
): object is APOrderedCollectionPage<APCreate> =>
  typeof object === 'object' &&
  (object.type === 'OrderedCollectionPage' ||
    object.type === 'OrderedCollection');

export const isOrderedCollection = (
  object: any,
): object is APOrderedCollection<APNote> =>
  typeof object === 'object' && object.type === 'OrderedCollection';
