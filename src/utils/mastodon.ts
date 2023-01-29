import {TAccount} from '../types';

export const getUserFQNFromAccount = (account: TAccount) => {
  if (account.id?.includes('@')) {
    return account.id;
  }

  if (account.acct?.includes('@')) {
    return account.acct;
  }

  const urlParts = account.url.replace(/^https?:\/\//, '').split('/');
  const urlHost = urlParts.shift();
  return `${account.acct ?? account.username}@${urlHost}`;
};

export const getHostAndHandle = (account: TAccount) => {
  const [accountHandle, host] = account.acct?.split('@') ?? [];
  if (accountHandle && host) {
    if (accountHandle[0] === '@') {
      return {accountHandle: accountHandle.substring(1), host};
    }

    return {accountHandle, host};
  } else {
    const urlParts = account.url.replace(/^https?:\/\//, '').split('/');
    const urlHost = urlParts.shift();
    let handle = urlParts.pop();
    if (typeof handle === 'string' && handle[0] === '@') {
      handle = handle.substring(1);
    }

    return {accountHandle: handle, host: urlHost};
  }
};
