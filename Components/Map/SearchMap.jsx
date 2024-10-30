import React, { useCallback } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { debounce } from 'lodash';

const SearchMap = ({ setSearchQuery, searchQuery }) => {
  // Debounced function to handle search input changes
  const handleSearchChange = useCallback(
    debounce((text) => {
      setSearchQuery(text);
    }, 300), // Adjust the debounce time as needed
    []
  );

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search for restaurants..."
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
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // For Android shadow
  },
  input: {
    height: 40,
    fontSize: 16,
  },
});

export default SearchMap;
