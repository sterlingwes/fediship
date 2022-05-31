import React from 'react';
import {View, ViewStyle} from 'react-native';
import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';

export const ReplyLine = ({
  stretch,
  height,
  visible,
  style,
}: {
  height?: number;
  stretch?: boolean;
  visible?: boolean;
  style?: ViewStyle;
}) => {
  const styles = useThemeStyle(styleCreator);

  return (
    <View
      style={[
        styles.replyLineContainer,
        stretch && styles.replyLineStretch,
        height && {height},
        style,
      ]}>
      {visible && <View style={styles.replyLine} />}
    </View>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  replyLineContainer: {
    alignItems: 'center',
  },
  replyLineStretch: {
    flex: 1,
  },
  replyLine: {
    width: 1,
    flex: 1,
    backgroundColor: getColor('baseAccent'),
  },
});
