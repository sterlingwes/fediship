import {TStatus} from '../types';

export const getType = (props: TStatus) => {
  if (props.in_reply_to_id) {
    return 'replied';
  }
  if (props.reblog) {
    return 'boosted';
  }
  return '';
};

const br = '<br/>';

const splitLinebreaks = (text: string) => {
  if (!text || !text.trim()) {
    return [];
  }

  const value = text
    .replace(/(<br([\s/]+)?>)+/g, br)
    .replace(/\n+/g, br)
    .replace(/<p>/g, '')
    .replace(/<\/?p>/g, br);

  const parts = value.split(br).filter(s => !!s.trim());
  if (parts.length > 1) {
    return parts;
  }

  return [value];
};

export const fixLinebreaking = (text: string) => {
  const parts = splitLinebreaks(text);
  if (!parts || !parts.length) {
    return;
  }
  return `<p>${parts.join('</p><p>')}</p>`;
};

export const truncateHtmlText = (
  {text, disable} = {text: '', disable: true},
  limit = 240,
): [string, boolean] => {
  if (disable) {
    return [text, false];
  }

  const textChunks = splitLinebreaks(text);
  if (!textChunks.length) {
    return [text, false];
  }

  let count = 0;
  const tooLongIndex = textChunks.findIndex(chunk => {
    count += chunk.length;
    if (count > limit) {
      return true;
    }
    return false;
  });

  if (tooLongIndex !== -1) {
    return [
      `<p>${textChunks.slice(0, tooLongIndex + 1).join('</p><p>')}</p>`,
      tooLongIndex + 1 < textChunks.length,
    ];
  }

  return [text, false];
};
