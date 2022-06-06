import React from 'react';
import {TextInput} from 'react-native';
import {StyleCreator} from '../theme';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {Box} from './Box';
import {SearchIcon} from './icons/SearchIcon';
import {XCircleIcon} from './icons/XCircleIcon';
import {LoadingSpinner} from './LoadingSpinner';

interface SearchbarProps {
  onChangeText: (txt: string) => void;
  onSearch?: () => void;
  onClear?: () => void;
  value: string;
  searching?: boolean;
  placeholder?: string;
}

export const Searchbar = ({
  value,
  searching,
  placeholder,
  onChangeText,
  onSearch,
  onClear,
}: SearchbarProps) => {
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();

  return (
    <Box style={styles.container}>
      <Box style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor={getColor('primary')}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          onChangeText={onChangeText}
          onSubmitEditing={onSearch}
          value={value}
        />
        <Box style={styles.searchClearBtn}>
          {!!value && (
            <XCircleIcon onPress={onClear} color={getColor('blueAccent')} />
          )}
        </Box>
      </Box>
      {onSearch && (
        <Box ml={12} style={styles.searchSubmit}>
          {searching ? (
            <LoadingSpinner />
          ) : (
            <SearchIcon onPress={onSearch} color={getColor('primary')} />
          )}
        </Box>
      )}
    </Box>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  container: {
    flexDirection: 'row',
    padding: 15,
    borderTopColor: getColor('base'),
    borderTopWidth: 2,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  searchClearBtn: {
    position: 'absolute',
    top: 0,
    right: 10,
    height: '100%',
    justifyContent: 'center',
  },
  searchSubmit: {
    flexShrink: 1,
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: getColor('base'),
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    color: getColor('baseTextColor'),
  },
});
