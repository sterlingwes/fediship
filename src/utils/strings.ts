export const startCase = (label: string) => {
  return `${label[0].toUpperCase()}${label.substring(1)}`;
};

export const parseAccountUrl = (url: string) => {
  const urlParts = url.split('/');
  const host = urlParts[2];
  let accountHandle = urlParts.pop();
  if (host && accountHandle) {
    if (accountHandle[0] === '@') {
      accountHandle = accountHandle.substr(1);
    }
    return {host, accountHandle};
  }
};
