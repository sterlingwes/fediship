import {useState} from 'react';
import {mastoBearerToken} from './constants';
import {TAccount, TStatus, TThread} from './types';
import {useMount} from './utils';

const timelineUris = Object.freeze({
  personal: 'https://swj.io/api/v1/accounts/2/statuses',
  public: 'https://swj.io/api/v1/timelines/public',
  home: 'https://swj.io/api/v1/timelines/home',
});

type Timeline = keyof typeof timelineUris;

export const getTimeline = async (timeline: Timeline) => {
  const uri = timelineUris[timeline];
  const response = await fetch(uri, {
    headers: {Authorization: `Bearer ${mastoBearerToken}`},
  });
  const json = await response.json();
  return json.sort((a: TStatus, b: TStatus) =>
    b.id.localeCompare(a.id),
  ) as TStatus[];
};

export const useTimeline = (timeline: Timeline) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statuses, setStatuses] = useState<TStatus[]>([]);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const list = await getTimeline(timeline);
      setStatuses(list);
    } catch (e: unknown) {
      console.error(e);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useMount(() => {
    fetchTimeline();
  });

  return {statuses, fetchTimeline, error, loading};
};

const parseStatusUrl = (url: string) => {
  const uriParts = url.split('/');
  const statusId = uriParts.pop();
  const protocol = uriParts.shift();
  uriParts.shift(); // empty string
  const host = uriParts.shift();
  return {host, statusId, protocol};
};

const statusUrlToApiUrl = (url: string): string => {
  const {host, protocol, statusId} = parseStatusUrl(url);
  return `${protocol}//${host}/api/v1/statuses/${statusId}`;
};

const fetchStatus = async (statusApiUrl: string) => {
  const detailResponse = await fetch(statusApiUrl);
  const statusDetail = await detailResponse.json();
  console.log('detail:', statusDetail);
  return statusDetail as TStatus;
};

export const getProfile = async (url: string) => {
  const {host, protocol, statusId} = parseStatusUrl(url);
  const detailUrl = `${protocol}//${host}/api/v1/statuses/${statusId}`;
  const statusDetail = await fetchStatus(detailUrl);
  const accountId = statusDetail.account.id;
  const accountTimelineUrl = `${protocol}//${host}/api/v1/accounts/${accountId}/statuses`;
  const timelineResponse = await fetch(accountTimelineUrl);
  const timeline = await timelineResponse.json();
  const accountUrl = `${protocol}//${host}/api/v1/accounts/${accountId}`;
  const accountResponse = await fetch(accountUrl);
  const account = await accountResponse.json();
  return {account, timeline} as {account: TAccount; timeline: TStatus[]};
};

export const useProfile = (statusUrl: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<TAccount>();
  const [statuses, setStatuses] = useState<TStatus[]>([]);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const result = await getProfile(statusUrl);
      setStatuses(result.timeline);
      setProfile(result.account);
    } catch (e: unknown) {
      console.error(e);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useMount(() => {
    fetchTimeline();
  });

  return {profile, statuses, fetchTimeline, error, loading};
};

/**
 * returns post surrounding selected status by its GUI url
 * @param statusUrl ie: https://mstdn.social/@Skiinglles/108235334317391891
 */
export const getThread = async (statusUrl: string) => {
  const detailUri = statusUrlToApiUrl(statusUrl);
  const statusDetail = await fetchStatus(detailUri);

  const contextResponse = await fetch(`${detailUri}/context`);
  const statusContext = await contextResponse.json();
  console.log('context:', statusContext);

  return {
    status: statusDetail,
    ...statusContext,
  } as TThread;
};

export const useThread = (statusUrl: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [thread, setThread] = useState<TThread>();

  const fetchThread = async () => {
    setLoading(true);
    try {
      const result = await getThread(statusUrl);
      setThread(result);
    } catch (e: unknown) {
      console.error(e);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useMount(() => {
    fetchThread();
  });

  return {thread, fetchThread, error, loading};
};
