import { StyleSheet, Image } from 'react-native';
import { Marker} from 'react-native-maps';
import React, { useContext } from 'react';
import { AuthContext } from '../Context/AuthContext';

// Import the custom marker icon
const foodIcon = require('../assets/food-icon.png');

const RestaurantMarker = ({ restaurant }) => {

    const { setSelectedRestaurant } = useContext(AuthContext)
    
    const onMarkerPress = () => {
        setSelectedRestaurant(restaurant);
    };

    return (
        <>
            <Marker
                coordinate={{
                    latitude: restaurant.latitude,
                    longitude: restaurant.longitude,
                }}
                onPress={onMarkerPress}
            >
                {/* Custom Marker Image */}
                <Image
                    source={foodIcon}
                    style={styles.markerImage}
                    resizeMode="contain"
                />
            </Marker>
        </>
    );
};

const styles = StyleSheet.create({
    markerImage: {
        width: 40,
        height: 40,
    },
    sideModal: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        width: '80%',
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        zIndex: 10,
    },
    modalContent: {
        flex: 1,
        padding: 30,
        justifyContent: 'space-between',
        backgroundColor: 'white',
    },
    restaurantName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    restaurantAddress: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    infoContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    value: {
        fontSize: 16,
        color: '#555',
    },
    getDirectionsButton: {
        alignSelf: 'center',
        paddingVertical: 12,
        paddingHorizontal: 30,
        backgroundColor: '#34C759', // Green button for directions
        borderRadius: 8,
    },
    getDirectionsButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
        textAlign: 'center',
    },
    closeButton: {
        alignSelf: 'center',
        paddingVertical: 12,
        paddingHorizontal: 30,
        backgroundColor: '#007AFF',
        borderRadius: 8,
    },
    closeButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default RestaurantMarker;