import React, {ForwardedRef} from 'react';
import {FlashList, FlashListProps} from '@shopify/flash-list';
import {reactive} from '@legendapp/state/react';

export function createReactiveFlashList<T>() {
  function FlashListFC(
    props: FlashListProps<T>,
    ref: ForwardedRef<FlashList<T>>,
  ) {
    return <FlashList {...{...props, ref}} />;
  }

  return reactive(React.forwardRef(FlashListFC));
}
