import React, {useCallback, useMemo, useRef, useEffect} from 'react';
import RNBottomSheet, {
  useBottomSheetDynamicSnapPoints,
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetProps as RNBottomSheetProps,
} from '@gorhom/bottom-sheet';
import {StyleCreator} from '../theme/types';
import {useThemeStyle} from '../theme/utils';

interface RNBottomSheetBackdropProps {
  pressBehaviour?: 'none' | 'close' | 'collapse' | number;
}

type RNLibraryProps = RNBottomSheetBackdropProps &
  Omit<RNBottomSheetProps, 'snapPoints'>;

interface BottomSheetProps extends RNLibraryProps {
  children: JSX.Element;
  visible: boolean;
  onClose?: () => void;
}

export const BottomSheet = ({
  children,
  visible,
  pressBehaviour,
  onClose,
  ...rnBottomSheetProps
}: BottomSheetProps) => {
  const styles = useThemeStyle(styleCreator);
  const sheet = useRef<RNBottomSheet>(null);
  const initialSnapPoints = useMemo(() => ['CONTENT_HEIGHT'], []);

  const {
    animatedHandleHeight,
    animatedSnapPoints,
    animatedContentHeight,
    handleContentLayout,
  } = useBottomSheetDynamicSnapPoints(initialSnapPoints);

  const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior={pressBehaviour}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    [pressBehaviour],
  );

  useEffect(() => {
    if (!visible) {
      sheet.current?.close();
    } else {
      sheet.current?.expand();
    }
  }, [visible]);

  return (
    <RNBottomSheet
      {...rnBottomSheetProps}
      ref={sheet}
      index={-1}
      detached
      bottomInset={20}
      animateOnMount={false}
      style={styles.container}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      snapPoints={animatedSnapPoints}
      handleIndicatorStyle={styles.handle}
      handleHeight={animatedHandleHeight}
      contentHeight={animatedContentHeight}
      enablePanDownToClose={false}
      onClose={onClose}>
      <BottomSheetView onLayout={handleContentLayout}>
        {children}
      </BottomSheetView>
    </RNBottomSheet>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  container: {
    marginHorizontal: 16,
  },
  background: {
    backgroundColor: getColor('base'),
  },
  handle: {
    backgroundColor: getColor('baseAccent'),
  },
});
