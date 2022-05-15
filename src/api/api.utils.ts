export const parseStatusUrl = (url: string) => {
  const uriParts = url.split('/');
  const statusId = uriParts.pop();
  const protocol = uriParts.shift();
  uriParts.shift(); // empty string
  const host = uriParts.shift();
  return {host, statusId, protocol};
};
