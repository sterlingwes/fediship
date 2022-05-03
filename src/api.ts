import {useState} from 'react';
import {mastoBearerToken} from './constants';
import {TStatus, TThread} from './types';
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

/**
 * returns post surrounding selected status by its GUI url
 * @param statusUrl ie: https://mstdn.social/@Skiinglles/108235334317391891
 */
export const getThread = async (statusUrl: string) => {
  const uriParts = statusUrl.split('/');
  const statusId = uriParts.pop();
  const protocol = uriParts.shift();
  uriParts.shift(); // empty string
  const host = uriParts.shift();

  const detailUri = `${protocol}//${host}/api/v1/statuses/${statusId}`;

  console.log({statusUrl, detailUri});

  const detailResponse = await fetch(detailUri);
  const statusDetail = await detailResponse.json();
  console.log('detail:', statusDetail);

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
