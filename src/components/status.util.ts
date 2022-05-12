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
