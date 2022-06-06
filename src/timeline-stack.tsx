import React, {MutableRefObject, useCallback, useMemo, useRef} from 'react';
import {SavedTimeline, useSavedTimelines} from './storage/saved-timelines';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from './types';
import {Timeline} from './screens/timeline';
import {TagTimeline} from './screens/tag-timeline';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {
  DrawerActions,
  useFocusEffect,
  useScrollToTop,
} from '@react-navigation/native';
import {Explore} from './screens/explore';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {DrawerHeaderLeft} from './components/Drawer/DrawerHeaderLeft';
import {DrawerMenu} from './components/Drawer/DrawerMenu';
import {useKeyboardBanner} from './components/KeyboardBanner';

const componentForTimelineType = (
  tl: SavedTimeline,
  screenRefs: MutableRefObject<RefMap>,
) => {
  if (tl.type) {
    return (
      props: NativeStackScreenProps<RootStackParamList, 'Local' | 'Federated'>,
    ) => (
      <Timeline
        ref={(nodeRef: ScreenRefHandle) =>
          (screenRefs.current[tl.name] = nodeRef)
        }
        {...props}
      />
    );
  }

  if (tl.tag) {
    return (
      props: NativeStackScreenProps<RootStackParamList, 'TagTimeline'>,
    ) => (
      <TagTimeline
        ref={(nodeRef: ScreenRefHandle) =>
          (screenRefs.current[tl.name] = nodeRef)
        }
        {...props}
      />
    );
  }

  throw new Error(`Unsupported timeline saved: ${tl.name}`);
};

type ScreenRefHandle =
  | {scrollToTop: () => void; getIsAtTop: () => boolean}
  | undefined;
type RefMap = Record<string, ScreenRefHandle>;

const initialParamsForTimelineType = (tl: SavedTimeline) => {
  if (tl.type) {
    return {timeline: tl.type};
  }

  if (tl.tag) {
    return tl.tag;
  }

  return undefined;
};

const Drawer = createDrawerNavigator();

export const TimelineStack = ({
  navigation,
}: BottomTabScreenProps<RootStackParamList>) => {
  const {timelines} = useSavedTimelines();
  const keyboardBanner = useKeyboardBanner();
  const screenRefs = useRef<RefMap>({});

  useFocusEffect(
    useCallback(() => {
      keyboardBanner.hide();
    }, [keyboardBanner]),
  );

  useScrollToTop(
    useRef({
      scrollToTop: () => {
        const state = navigation.getState();
        const tlRoute = state.routes.find(r => r.name === 'Timelines');
        if (!tlRoute) {
          return;
        }

        const index = tlRoute.state?.index;
        if (typeof index !== 'number') {
          // assume we're on local
          const isTop = screenRefs.current?.Local?.getIsAtTop();
          if (isTop) {
            navigation.dispatch(DrawerActions.toggleDrawer());
            return;
          }
          screenRefs.current?.Local?.scrollToTop();
          return;
        }
        const childTab = tlRoute.state?.routeNames?.[index];
        if (!childTab) {
          return;
        }
        const screenRef = screenRefs.current[childTab];
        if (screenRef) {
          const isTop = screenRef.getIsAtTop();
          if (isTop) {
            navigation.dispatch(DrawerActions.toggleDrawer());
            return;
          }
          screenRef.scrollToTop();
        }
      },
    }),
  );

  const dynamicScreens = useMemo(
    () =>
      timelines.reduce(
        (acc, tl) => {
          const ScreenComponent = componentForTimelineType(tl, screenRefs);
          return {
            ...acc,
            [tl.name]: ScreenComponent,
          };
        },
        {
          Explore: (
            props: NativeStackScreenProps<RootStackParamList, 'Explore'>,
          ) => (
            <Explore
              ref={(nodeRef: ScreenRefHandle) =>
                (screenRefs.current.Explore = nodeRef)
              }
              {...props}
            />
          ),
        } as Record<string, React.ComponentType<any>>,
      ),
    [timelines, screenRefs],
  );

  return (
    <Drawer.Navigator
      drawerContent={DrawerMenu}
      screenOptions={{
        swipeEdgeWidth: 60,
        swipeEnabled: true,
        headerLeft: DrawerHeaderLeft,
      }}>
      {timelines.map(tl => (
        <Drawer.Screen
          name={tl.name}
          component={dynamicScreens[tl.name]}
          initialParams={initialParamsForTimelineType(tl)}
        />
      ))}
      <Drawer.Screen name="Explore" component={dynamicScreens.Explore} />
    </Drawer.Navigator>
  );
};
