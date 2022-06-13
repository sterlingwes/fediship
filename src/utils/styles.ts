import {ViewStyle} from 'react-native';
import {StyleCreatorApi} from '../theme';

export const flex: ViewStyle = {flex: 1};

export const centered: ViewStyle = {
  justifyContent: 'center',
  alignItems: 'center',
};

export const shadow = ({getColor}: StyleCreatorApi) => ({
  elevation: 4,
  shadowColor: getColor('shadowColor'),
  shadowOpacity: 0.2,
  shadowRadius: 18,
  shadowOffset: {
    width: 0,
    height: 10,
  },
});
