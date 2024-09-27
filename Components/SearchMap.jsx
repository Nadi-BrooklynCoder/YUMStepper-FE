import { View, TextInput, StyleSheet } from 'react-native'
import React from 'react'

const SearchMap = ({ setSearchQuery, searchQuery }) => {

    const handleSearch = (query) => {
        setSearchQuery(query);
        // You can add logic here to handle the search query
    };

    return (
        <TextInput
            style={styles.searchBar}
            placeholder="Search location"
            value={searchQuery}
            onChangeText={handleSearch}
        />
    )

    
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchBar: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        paddingHorizontal: 10,
        borderRadius: 5,
        margin: 10,
    },
});

export default SearchMap