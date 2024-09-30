import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import React, { useState, useRef, useEffect, useContext } from 'react';
import polyline from '@mapbox/polyline';
import axios from 'axios';
import { GOOGLE_API_KEY, API_BASE_URL } from '@env';
import { AuthContext } from '../Context/AuthContext';

const { width: screenWidth } = Dimensions.get('window');
 
const MapSide = ({ restaurant, setSelectedRestaurant }) => {
    const { userLocation, setDirections } = useContext(AuthContext);
    const [restaurantAddress, setRestaurantAddress] = useState('');
    const slideAnim = useRef(new Animated.Value(screenWidth)).current;
    const isAnimating = useRef(false);

    const closeModal = () => {
        if (isAnimating.current) return;

        isAnimating.current = true;

        Animated.timing(slideAnim, {
            toValue: screenWidth,
            duration: 300,
            useNativeDriver: false,
        }).start(() => {
            isAnimating.current = false;
        });
        setSelectedRestaurant({});
    };

    const handleGetDirections = async () => {
        if (!userLocation.latitude || !userLocation.longitude) {
            console.error("User location is not available");
            return;
        }

        try {
            const response = await axios.get(
                `${API_BASE_URL}/googlePlaces/direction?originLat=${userLocation.latitude}&originLng=${userLocation.longitude}&destLat=${restaurant.latitude}&destLng=${restaurant.longitude}`
            );

            if (response.data && response.data.routes && response.data.routes.length > 0) {
                const points = response.data.routes[0].overview_polyline.points;

                // Decode the polyline using @mapbox/polyline
                const decodedPoints = polyline.decode(points).map(([latitude, longitude]) => ({
                    latitude,
                    longitude,
                }));

                setDirections(decodedPoints);
                closeModal(); // Close the modal after getting directions
            } else {
                console.error('No routes found');
            }
        } catch (error) {
            console.error('Error fetching directions', error);
        }
    };

    useEffect(() => {
        const getAddressFromLatLng = async () => {
            try {
                const response = await axios.get(
                    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${restaurant.latitude},${restaurant.longitude}&key=${GOOGLE_API_KEY}`
                );

                if (response.data.results && response.data.results.length > 0) {
                    const address = response.data.results[0].formatted_address;
                    setRestaurantAddress(address);
                } else {
                    console.error("No address found for the provided coordinates");
                }
            } catch (error) {
                console.error("Error fetching reverse geocoding data", error);
            }
        };

        if (restaurant?.id) {
            // If a restaurant is selected, open the modal
            isAnimating.current = true;
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            }).start(() => {
                isAnimating.current = false;
            });

            getAddressFromLatLng();
        } else {
            // If no restaurant is selected, close the modal
            Animated.timing(slideAnim, {
                toValue: screenWidth,
                duration: 300,
                useNativeDriver: false,
            }).start();
        }
    }, [restaurant]);

    return (
        <>
            <Animated.View style={[styles.sideModal, { transform: [{ translateX: slideAnim }] }]}>
                <View style={styles.modalContent}>
                    <Text style={styles.restaurantName}>{restaurant.name}</Text>

                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Address:</Text>
                        <Text style={styles.restaurantAddress}>{restaurantAddress}</Text>
                    </View>

                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Cuisine Type:</Text>
                        <Text style={styles.value}>{restaurant.cuisine_type || 'N/A'}</Text>
                    </View>

                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Description:</Text>
                        <Text style={styles.value}>{restaurant.description || 'N/A'}</Text>
                    </View>

                    <TouchableOpacity onPress={handleGetDirections} style={styles.getDirectionsButton}>
                        <Text style={styles.getDirectionsButtonText}>Go to this Restaurant</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </>
    );
};

const styles = StyleSheet.create({
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

export default MapSide;
