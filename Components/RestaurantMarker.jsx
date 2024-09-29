import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Image } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Marker } from 'react-native-maps';
import React from 'react';
import axios from 'axios';
import { GOOGLE_API_KEY } from '@env';

const { width: screenWidth } = Dimensions.get('window');

// Import the custom marker icon
const foodIcon = require('../assets/food-icon.png');

const RestaurantMarker = ({ restaurant }) => {
    const [visibleRestaurant, setVisibleRestaurant] = useState(null); // Track the currently open restaurant
    const [restaurantAddress, setRestaurantAddress] = useState('');
    const slideAnim = useRef(new Animated.Value(screenWidth)).current; // Start outside of screen (right)
    const isAnimating = useRef(false); // Ref to track animation state and prevent multiple triggers

    const onMarkerPress = () => {
        if (isAnimating.current || visibleRestaurant?.id === restaurant.id) return; // Prevent multiple animations or repeated clicks for the same restaurant
        
        isAnimating.current = true;
        setVisibleRestaurant(restaurant);

        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
        }).start(() => {
            isAnimating.current = false;
        });
    };

    const closeModal = () => {
        if (isAnimating.current) return;

        isAnimating.current = true;

        Animated.timing(slideAnim, {
            toValue: screenWidth,
            duration: 300,
            useNativeDriver: false,
        }).start(() => {
            setVisibleRestaurant(null);
            isAnimating.current = false;
        });
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

        getAddressFromLatLng();
    }, [restaurant.latitude, restaurant.longitude]);

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
            {visibleRestaurant?.id === restaurant.id && (
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
                        
                        <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            )}
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
