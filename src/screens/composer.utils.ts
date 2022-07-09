export const parseStatus = (rawStatus: string) => {
  let cw: string | undefined;
  let status = rawStatus;

  if (rawStatus.trim().startsWith('CW:')) {
    const parts = rawStatus.split('\n');
    if (parts.length && parts[0].trim().length) {
      cw = parts[0].replace(/^CW:\s?/, '');
      parts.shift();
      status = parts.join('\n').trim();
    }
  }

  return {cw, status};
};
