import {useNavigation} from '@react-navigation/native';
import React, {ComponentProps} from 'react';
import {TouchableOpacity} from 'react-native';
import {StyleCreator} from '../theme/types';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {PlusCircleIcon} from './icons/PlusCircleIcon';

interface Props {
  back?: boolean;
  onPress?: () => void;
  IconComponent: (props: ComponentProps<typeof PlusCircleIcon>) => JSX.Element;
}

export const HeaderRightButton = (props: Props) => {
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();
  const navigation = useNavigation();

  const onBack = () => {
    if (props.back) {
      navigation.goBack();
    }
  };

  return (
    <TouchableOpacity
      onPress={props.onPress ?? onBack}
      style={styles.touchable}>
      <props.IconComponent color={getColor('primary')} />
    </TouchableOpacity>
  );
};

const styleCreator: StyleCreator = () => ({
  touchable: {paddingRight: 12},
});
