import {useCallback, useState} from 'react';
import {useWorkerApi} from './hooks';

export const useErrorReporter = () => {
  const api = useWorkerApi({host: 'errors-api.fediship.app', pathBase: '/v1'});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const sendErrorReport = useCallback(
    async (e: Error | undefined, tags = {nonFatal: false}) => {
      if (!e) {
        return;
      }
      setLoading(true);
      // @ts-ignore
      const extra = {...tags, ...e.meta};
      const didSend = await api.sendError(e, extra);
      setLoading(false);
      setSent(didSend);
    },
    [api],
  );

  return {loading, sent, sendErrorReport};
};
