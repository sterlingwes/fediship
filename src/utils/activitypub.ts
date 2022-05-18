import {APPerson, TAccount} from '../types';

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
