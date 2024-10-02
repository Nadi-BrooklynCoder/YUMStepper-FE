import React, { useContext, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';


import MapComponent from '../Components/Map/MapComponent';
import SearchMap from '../Components/Map/SearchMap';
import MapSide from '../Components/Map/MapSide';
import { AuthContext } from '../Context/AuthContext';

const Map = ({ route }) => {
    const {
        selectedRestaurant,
        restaurants,
        setSelectedRestaurant,
        directions,
        setDirections,
        isNearRestaurant, 
    } = useContext(AuthContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);
    const [sideModalVisible, setSideModalVisible] = useState(false)
    const navigation = useNavigation();

    // Function to handle search
    const handleSearch = (query) => {
        setSearchQuery(query);

        // Filter the restaurants based on the search query
        if (query.trim() === '') {
            setFilteredRestaurants([]);
        } else {
            const filtered = restaurants.filter((restaurant) =>
                restaurant.name.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredRestaurants(filtered);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <SearchMap setSearchQuery={handleSearch} searchQuery={searchQuery} />
            <MapComponent route={route} searchQuery={searchQuery} setSideModalVisible={setSideModalVisible}/>

            {/* Check In button */}
            {selectedRestaurant && directions.length > 0 && (
                <View style={styles.checkInButtonContainer}>
                    <TouchableOpacity
                        style={[
                            styles.checkInButton,
                            { 
                                opacity: isNearRestaurant ? 1 : .5, 
                                backgroundColor: isNearRestaurant ? "#0BCF07" : 'rgba(0, 255, 0, 0.5)' 
                            },
                        ]}
                        disabled={!isNearRestaurant} 
                        onPress={() => {
                            if (isNearRestaurant) {
                                navigation.navigate('CheckIn')
                            }
                        }}
                    >
                        <Text style={styles.checkInButtonText}>Check In</Text>
                    </TouchableOpacity>
                </View>
            )}

            {sideModalVisible && <MapSide setSideModalVisible={setSideModalVisible}/>}

            {/* Display the filtered restaurants in a popup */}
            {filteredRestaurants.length > 0 && (
                <View style={styles.popup}>
                    <FlatList
                        data={filteredRestaurants}
                        keyExtractor={(item) => item.id.toString()}
                        keyboardShouldPersistTaps="handled"
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => {
                                    Keyboard.dismiss(); // Dismiss the keyboard
                                    setSelectedRestaurant(item);
                                    setSideModalVisible(true)
                                    setSearchQuery('');
                                    setFilteredRestaurants([]);
                                }}
                            >
                                <Text style={styles.itemText}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}

            {directions.length > 0 && (
                <View style={styles.stopButtonContainer}>
                    <TouchableOpacity style={styles.stopButton} onPress={() => {
                        setDirections([])
                        setSelectedRestaurant({})
                    }}>
                        <Text style={styles.stopButtonText}>Stop Directions</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    popup: {
        position: 'absolute',
        top: 60,
        left: 10,
        right: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
        maxHeight: 200,
        elevation: 5,
        zIndex: 1,
    },
    itemText: {
        padding: 10,
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
    },
    stopButtonContainer: {
        position: 'absolute',
        bottom: 20,
        right: 20,
    },
    stopButton: {
        backgroundColor: '#ff3333',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    stopButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    checkInButtonContainer: {
        position: 'absolute',
        top: 120,
        right: 150,
    },
    checkInButton: { 
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    checkInButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default Map;
