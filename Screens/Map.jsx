import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import MapComponent from '../Components/MapComponent';
import SearchMap from '../Components/SearchMap';

import MapSide from '../Components/MapSide';

const Map = ({ route }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRestaurant, setSelectedRestaurant] = useState({})

    return (
        <View style={{flex: 1}}>
            <SearchMap setSearchQuery={setSearchQuery} searchQuery={searchQuery}/>
            <MapComponent route={route} searchQuery={searchQuery} selectedRestaurant={selectedRestaurant} setSelectedRestaurant={setSelectedRestaurant}/>
            
            {selectedRestaurant?.id && <MapSide restaurant={selectedRestaurant} setSelectedRestaurant={setSelectedRestaurant}/>}
        </View>
    );
};



export default Map;
