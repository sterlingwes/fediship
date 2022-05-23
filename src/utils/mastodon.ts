import {TAccount} from '../types';

export const getHostAndHandle = (account: TAccount) => {
  const [accountHandle, host] = account.acct?.split('@') ?? [];
  if (accountHandle && host) {
    return {accountHandle, host};
  }
};
