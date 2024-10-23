// SearchMap.js
import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

const SearchMap = ({ setSearchQuery, searchQuery }) => {
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search for restaurants..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.input}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // No absolute positioning; let the parent handle it
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
