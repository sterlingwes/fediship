import {
  APAttachment,
  APCreate,
  APNote,
  APOrderedCollectionPage,
  APPerson,
  TAccount,
  TMediaAttachment,
  TStatus,
} from '../types';

export const transformPerson = (
  profileHref: string,
  person: APPerson,
): TAccount => {
  const urlParts = (person.url ?? profileHref).split('/');
  let handle = urlParts.pop();
  const host = urlParts[2]; // after protocol and empty?

  if (typeof handle === 'string' && handle[0] === '@') {
    handle = handle.substring(1);
  }

  return {
    id: `${handle}@${host}`,
    acct: handle ?? person.preferredUsername,
    avatar: person.icon.url,
    avatar_static: person.icon.url,
    bot: false,
    created_at: '',
    discoverable: person.discoverable,
    display_name: person.name,
    emojis: [],
    fields: [],
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
  switch (mime) {
    case 'image/jpeg':
    default:
      return 'image';
  }
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

const transformActivity = (
  {id, published, content, url, sensitive, attachment}: APNote,
  account: TAccount,
): TStatus => ({
  id,
  created_at: published,
  content,
  account,
  favourited: false,
  reblog: null,
  reblogged: false,
  url,
  uri: url,
  in_reply_to_id: null,
  poll: null, // TODO: figure out
  sensitive,
  media_attachments: attachment
    ? attachment.map(doc => transformDocument(doc))
    : [],
});

export const transformActivityPage = (
  activities: APOrderedCollectionPage<APCreate>,
  account: TAccount,
) =>
  activities.orderedItems
    // filter out boosts & replies to simplify
    .filter(item => item.object.type === 'Note' && !item.object.inReplyTo)
    .map(activity => transformActivity(activity.object as APNote, account));

export const isPerson = (object: any): object is APPerson =>
  typeof object === 'object' && object.type === 'Person';

export const isOutboxCollection = (
  object: any,
): object is APOrderedCollectionPage<APCreate> =>
  typeof object === 'object' && object.type === 'OrderedCollectionPage';
