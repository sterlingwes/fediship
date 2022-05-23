import {TAccount} from '../types';

export const getHostAndHandle = (account: TAccount) => {
  const [accountHandle, host] = account.acct?.split('@') ?? [];
  if (accountHandle && host) {
    if (accountHandle[0] === '@') {
      return {accountHandle: accountHandle.substring(1), host};
    }

    return {accountHandle, host};
  }
};
