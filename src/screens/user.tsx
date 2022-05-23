import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useMemo} from 'react';
import {
  ListRenderItem,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {ChevronInverted} from '../components/icons/Chevron';
import {Type} from '../components/Type';
import {StyleCreator} from '../theme';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {RootStackParamList} from '../types';

const ListHeader = ({section: {title}}: {section: {title: string}}) => {
  const styles = useThemeStyle(styleCreator);
  return (
    <View style={styles.listHeader}>
      <Type scale="S" semiBold>
        {title}
      </Type>
    </View>
  );
};

export const User = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Explore'>) => {
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();

  const menuItems = useMemo(
    () => [
      {
        title: 'Profile',
        data: [
          {
            label: 'Following',
            onPress: () => navigation.push('FollowerList', {source: 'theirs'}),
          },
          {
            label: 'Followers',
            onPress: () => navigation.push('FollowerList', {source: 'mine'}),
          },
        ],
      },
    ],
    [navigation],
  );

  const renderItem: ListRenderItem<typeof menuItems[0]['data'][0]> = ({
    item,
  }) => (
    <TouchableOpacity
      style={styles.listRow}
      activeOpacity={0.5}
      onPress={item.onPress}>
      <Type scale="M" style={styles.menuItemLabel} numberOfLines={1}>
        {item.label}
      </Type>
      <ChevronInverted color={getColor('primary')} />
    </TouchableOpacity>
  );

  return (
    <View>
      <SectionList
        sections={menuItems}
        renderItem={renderItem}
        renderSectionHeader={props => <ListHeader {...props} />}
        keyExtractor={(item, index) => `${item.label}-${index}`}
      />
    </View>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  container: {
    flex: 1,
    padding: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingMessage: {
    marginTop: 20,
  },
  listHeader: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: getColor('baseAccent'),
  },
  listRow: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 65,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomColor: getColor('baseAccent'),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuItemLabel: {
    flex: 1,
  },
});
