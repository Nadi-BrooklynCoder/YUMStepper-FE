import { TextInput, StyleSheet } from 'react-native';
import React, { useRef, useEffect } from 'react';

const SearchMap = ({ setSearchQuery, searchQuery }) => {

    return (
        <TextInput
            style={styles.searchBar}
            placeholder="Search for a restaurant"
            value={searchQuery}
            onChangeText={setSearchQuery}
        />
    );
};

const styles = StyleSheet.create({
    searchBar: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        paddingHorizontal: 10,
        borderRadius: 5,
        margin: 10,
    },
});

export default SearchMap;
