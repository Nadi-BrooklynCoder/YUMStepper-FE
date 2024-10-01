import React, { useContext, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import MapComponent from '../Components/MapComponent';
import SearchMap from '../Components/SearchMap';

import MapSide from '../Components/MapSide';
import { AuthContext } from '../Context/AuthContext';

const Map = ({ route }) => {
    const { selectedRestaurant } = useContext(AuthContext)
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <View style={{flex: 1}}>
            <SearchMap setSearchQuery={setSearchQuery} searchQuery={searchQuery}/>
            <MapComponent route={route} searchQuery={searchQuery} />

            {selectedRestaurant?.id && <MapSide />}
        </View>
    );
};



export default Map;
