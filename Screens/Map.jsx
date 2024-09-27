import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import MapComponent from '../Components/MapComponent';
import SearchMap from '../Components/SearchMap';

const Map = ({ route }) => {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <View style={{flex: 1}}>
            <SearchMap setSearchQuery={setSearchQuery} searchQuery={searchQuery}/>
            <MapComponent route={route} searchQuery={searchQuery} />
        </View>
    );
};



export default Map;
