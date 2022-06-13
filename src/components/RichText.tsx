import React, {useCallback, useMemo} from 'react';
import {useThemeGetters} from '../theme/utils';
import {Emoji} from '../types';
import {helperApi, HTMLNodeRenderer, HTMLViewV2} from './HTMLViewV2';
import {Type, TypeProps} from './Type';

interface RichTextProps {
  emojis: Emoji[];
  html: string;
  onMentionPress?: (_: {host: string; accountHandle: string}) => void;
  onTagPress?: (_: {host: string; tag: string}) => void;
}

const renderNode: HTMLNodeRenderer = (n, api) => {
  if (n.nodeName !== 'span') {
    return false;
  }

  const classes = api.getClasses(n);
  if (!classes) {
    return false;
  }

  // specific cases we're handling rendering for
  if (classes.includes('invisible')) {
    return null; // filter out invisible elements
  }

  if (classes.includes('ellipsis') && api.hasTextChild(n)) {
    n.childNodes[0].value = n.childNodes[0].value += '...';
    return false;
  }

  // fallback no-op to allow component to control rendering
  return false;
};

export const RichText = ({html, onMentionPress, onTagPress}: RichTextProps) => {
  const {getColor} = useThemeGetters();

  const onLinkPress = useCallback(
    ({htmlNode}) => {
      const href = helperApi.getAttribute(htmlNode, 'href');
      if (!href || !href.value) {
        console.warn('onLinkPress element has no href');
        return;
      }

      if (onTagPress) {
        const [origin, tag] = href.value.split('/tags/');
        if (tag) {
          const [, host] = origin.split('//');
          onTagPress({host, tag});
          return;
        }
      }

      const classes = helperApi.getClasses(htmlNode);
      if (
        onMentionPress &&
        classes &&
        (classes.includes('u-url') || classes.includes('mention'))
      ) {
        const urlParts = href.value.split('/');
        const host = urlParts[2];
        let accountHandle = urlParts.pop();
        if (host && accountHandle) {
          if (accountHandle[0] === '@') {
            accountHandle = accountHandle.substr(1);
          }
          onMentionPress({host, accountHandle});
          return;
        }
      }
    },
    [onMentionPress, onTagPress],
  );

  const elements = useMemo(
    () => ({
      text: {
        Component: Type,
        props: {scale: 'S', color: getColor('baseTextColor')} as TypeProps,
      },
      a: {
        Component: Type,
        props: {
          onPress: onLinkPress,
          color: getColor('primary'),
          semiBold: true,
        } as TypeProps,
      },
    }),
    [onLinkPress, getColor],
  );

  return <HTMLViewV2 {...{renderNode, html, elements}} />;
};
