import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { GOOGLE_API_KEY } from '@env';
import { AuthContext } from '../../Context/AuthContext';

const { width: screenWidth } = Dimensions.get('window');
 
const MapSide = ({ setSideModalVisible }) => {
    
    const { selectedRestaurant, setSelectedRestaurant, calculateSteps, handleGetDirections, directionSteps } = useContext(AuthContext);
    const [restaurantAddress, setRestaurantAddress] = useState('');
    const slideAnim = useRef(new Animated.Value(screenWidth)).current;
    const isAnimating = useRef(false);

    const closeModal = () => {
        Animated.timing(slideAnim, {
            toValue: screenWidth,
            duration: 300,
            useNativeDriver: false,
        }).start();
        setSideModalVisible(false);
    };

    const getNewDirections = async () => {
        await handleGetDirections()
        closeModal()
    };

    useEffect(() => {
        const getAddressFromLatLng = async () => {
            try {
                const response = await axios.get(
                    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${selectedRestaurant.latitude},${selectedRestaurant.longitude}&key=${GOOGLE_API_KEY}`
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

        if (selectedRestaurant?.id) {
            // If a restaurant is selected, open the modal
            isAnimating.current = true;
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            }).start(() => {
                isAnimating.current = false;
            });

            calculateSteps()
            getAddressFromLatLng();
        } else{
            Animated.timing(slideAnim, {
                toValue: screenWidth,
                duration: 300,
                useNativeDriver: false,
            }).start();
        }
        
    }, [selectedRestaurant]);

    return (
        <Animated.View style={[styles.sideModal, { transform: [{ translateX: slideAnim }] }]}>
            <View style={styles.modalContent}>
                <Text style={styles.restaurantName}>{selectedRestaurant.name}</Text>

                <View style={styles.infoContainer}>
                    <Text style={styles.label}>Address:</Text>
                    <Text style={styles.restaurantAddress}>{restaurantAddress}</Text>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.label}>Cuisine Type:</Text>
                    <Text style={styles.value}>{selectedRestaurant.cuisine_type || 'N/A'}</Text>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.label}>Approx Steps:</Text>
                    <Text style={styles.value}>{directionSteps || 'N/A'}</Text>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.label}>Description:</Text>
                    <Text style={styles.value}>{selectedRestaurant.description || 'N/A'}</Text>
                </View>

                <TouchableOpacity onPress={getNewDirections} style={styles.getDirectionsButton}>
                    <Text style={styles.getDirectionsButtonText}>Go to this Restaurant</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => {closeModal(), setSelectedRestaurant({})}} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
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
