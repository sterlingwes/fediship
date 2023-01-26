import React, {useMemo} from 'react';
import {ColorValue, Image, ImageStyle} from 'react-native';
import {Emoji} from '../types';
import {Type} from './Type';

const emojiImgStyle = {width: 15, height: 15} as ImageStyle;

export const EmojiName = ({
  name,
  emojis,
  textColor,
}: {
  name: string;
  emojis: Emoji[] | undefined;
  textColor?: ColorValue;
}) => {
  const splitParts = useMemo(() => {
    const emojiLookup = (emojis ?? []).reduce((acc, emoji) => {
      return {
        ...acc,
        [emoji.shortcode]: emoji,
      };
    }, {} as Record<string, Emoji>);
    return name.split(':').map(part => {
      const emojiMatch = emojiLookup[part];
      if (emojiMatch) {
        return emojiMatch;
      }
      return part;
    });
  }, [name, emojis]);

  return (
    <>
      {splitParts.map((part, i) => {
        if (typeof part === 'string') {
          return (
            <Type key={i} color={textColor} scale="S" semiBold>
              {part}
            </Type>
          );
        } else {
          return (
            <Image
              key={i}
              source={{uri: part.static_url}}
              style={emojiImgStyle}
            />
          );
        }
      })}
    </>
  );
};
