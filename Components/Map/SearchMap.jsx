import React, { useCallback, useEffect } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { debounce } from 'lodash';

const SearchMap = ({ setSearchQuery, searchQuery }) => {
  // Debounced function to handle search input changes
  const debouncedSearchChange = useCallback(
    debounce((text) => setSearchQuery(text), 300),
    [setSearchQuery]
  );

  // Ensure that debounced function is called on input change
  const handleSearchChange = (text) => {
    debouncedSearchChange(text);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedSearchChange.cancel();
    };
  }, [debouncedSearchChange]);

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="🔍 Search for restaurants..."
        value={searchQuery}
        onChangeText={handleSearchChange}
        style={styles.input}
        accessibilityLabel="Search for restaurants"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginTop: -50
  },
  input: {
    height: 45,
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
});

export default SearchMap;
