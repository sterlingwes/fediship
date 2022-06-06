import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {ReactNode, useCallback, useMemo} from 'react';
import {
  ListRenderItem,
  SectionList,
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import {Type} from '../../components/Type';
import {
  getPickedPeer,
  setPickedPeer,
  useSavedTimelines,
} from '../../storage/saved-timelines';
import {StyleCreator} from '../../theme';
import {useThemeStyle} from '../../theme/utils';
import {RootStackParamList} from '../../types';
import {useMount} from '../../utils/hooks';
import {flex} from '../../utils/styles';

interface MenuSection {
  title: string;
  data: MenuItem[];
}

interface MenuItem {
  label: string;
  danger?: boolean;
  onPress: () => any;
  rightSide?: ReactNode;
  disabled?: boolean;
}

const ListHeader = ({section: {title}}: {section: {title: string}}) => {
  const styles = useThemeStyle(styleCreator);
  return (
    <View style={styles.listHeader}>
      <Type scale="S" semiBold style={styles.listHeaderTitle}>
        {title}
      </Type>
    </View>
  );
};

export const TagTimelinePrefs = ({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'TagTimelinePrefs'>) => {
  const styles = useThemeStyle(styleCreator);

  const {changeTimelineHost, softDeleteSavedTimeline} = useSavedTimelines();

  useMount(() => {
    navigation.setOptions({
      headerTitle: `#${route.params.name}`,
    });
  });

  const removeTimeline = useCallback(() => {
    softDeleteSavedTimeline(route.params.name);
    navigation.navigate('Local', {timeline: 'home'});
  }, [softDeleteSavedTimeline, route, navigation]);

  useFocusEffect(
    useCallback(() => {
      const pickedPeer = getPickedPeer();
      if (pickedPeer) {
        setPickedPeer('');
        const {tag} = route.params;
        const name = `${tag} ${pickedPeer}`;
        changeTimelineHost(route.params.name, {
          name,
          tag: {host: pickedPeer, tag},
        });
        setTimeout(() => {
          navigation.navigate(name as keyof RootStackParamList);
        }, 10);
      }
    }, [changeTimelineHost, route.params, navigation]),
  );

  const menuItems = useMemo(
    (): MenuSection[] => [
      {
        title: '',
        data: [
          {
            label: 'Source Instance',
            rightSide: <Type scale="S">{route.params.host}</Type>,
            onPress: () => navigation.push('PeerPicker'),
          },
          {
            label: 'Delete Saved Timeline',
            danger: true,
            onPress: removeTimeline,
          },
        ],
      },
    ],
    [removeTimeline, navigation, route],
  );

  const renderItem: ListRenderItem<typeof menuItems[0]['data'][0]> = ({
    item,
  }) => (
    <TouchableOpacity
      disabled={item.disabled}
      style={[styles.listRow, item.danger && styles.dangerRow]}
      activeOpacity={0.5}
      onPress={item.onPress}>
      <Type
        scale="S"
        style={[styles.menuItemLabel, item.danger && styles.dangerLabel]}
        numberOfLines={1}>
        {item.label}
      </Type>
      <View style={styles.rightSide}>{item.rightSide}</View>
    </TouchableOpacity>
  );

  return (
    <View style={flex}>
      <SectionList
        sections={menuItems}
        renderItem={renderItem}
        renderSectionHeader={props =>
          props.section.title ? <ListHeader {...props} /> : null
        }
        keyExtractor={(item, index) => `${item.label}-${index}`}
      />
    </View>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  listHeader: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    paddingTop: 12,
    backgroundColor: getColor('baseHighlight'),
  },
  listHeaderTitle: {
    color: getColor('primary'),
  },
  listRow: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 50,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomColor: getColor('baseAccent'),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rightSide: {
    flexDirection: 'row',
  },
  rightSideLabel: {
    marginTop: 1,
    marginRight: 6,
    color: getColor('primary'),
  },
  menuItemLabel: {
    flex: 1,
  },
  dangerRow: {
    marginTop: 200,
    borderTopColor: getColor('baseAccent'),
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  dangerLabel: {
    color: getColor('error'),
    textAlign: 'center',
  },
});
