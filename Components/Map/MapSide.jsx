import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Linking, Platform } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { AuthContext } from '../../Context/AuthContext';

import RewardsPopup from '../Rewards/RewardsPopup';

const { width: screenWidth } = Dimensions.get('window');

// const formatTime = (time) => {
//     if (!time) return 'Unknown';
//     const hour = parseInt(time.substring(0, 2), 10);
//     const minute = time.substring(2);
//     const ampm = hour >= 12 ? 'PM' : 'AM';
//     const formattedHour = hour % 12 || 12;
//     return `${formattedHour}:${minute} ${ampm}`;
// };

const MapSide = ({ setSideModalVisible }) => {
    const { selectedRestaurant, setSelectedRestaurant, calculateSteps, getDirectionsFromGoogleMaps, directionSteps } = useContext(AuthContext);
    const [restaurantDetails, setRestaurantDetails] = useState({});
    const [showRewards, setShowRewards] = useState(false);
    const slideAnim = useRef(new Animated.Value(screenWidth)).current;

    const closeModal = () => {
        Animated.timing(slideAnim, {
            toValue: screenWidth,
            duration: 300,
            useNativeDriver: Platform.OS !== 'web',
        }).start();
        setSideModalVisible(false);
    };

    const getNewDirections = async () => {

        if(Platform.OS !== 'web') {
            await getDirectionsFromGoogleMaps();
        } else {
            console.log('Directions feature is not available on the web')
        }
        closeModal();
    };
    
    
       // In MapSide Component
    useEffect(() => {
        const fetchRestaurantDetails = async () => {
            if (selectedRestaurant?.id && selectedRestaurant.id !== 'N/A') {
                try {
                    const response = await axios.get(`${API_BASE_URL}/restaurants/details/${selectedRestaurant.id}`);
                    if (response.data && response.data.data) {
                        const details = response.data.data;
                        // Format and set state
                        setRestaurantDetails({
                            id: details.id, // Ensure ID is always set properly without fallback
                            name: details.name || 'Not Available',
                            address: details.address || 'Not Available',
                            latitude: details.latitude || selectedRestaurant.latitude,
                            longitude: details.longitude || selectedRestaurant.longitude,
                            open_now: details.open_now || 'No', // 'Yes' or 'No'
                            opening_hours: details.opening_hours?.length > 0
                                ? details.opening_hours
                                : ['Unknown'],
                            rating: details.rating || 'Not Available',
                            cuisine_type: details.cuisine_type || 'Not specified',
                            menu_url: details.menu_url || 'Not available',
                        });
                        
                        calculateSteps();
                    } else {
                        console.error("[MapSide:fetchRestaurantDetails] Unexpected response structure:", response.data);
                    }
                } catch (error) {
                    if (error.response && error.response.status === 404) {
                        console.error(`[MapSide:fetchRestaurantDetails] Restaurant ID ${selectedRestaurant.id} not found.`, error);
                    } else {
                        console.error("[MapSide:fetchRestaurantDetails] Error fetching restaurant details:", error);
                    }
                }
            } else {
                console.warn('[MapSide:fetchRestaurantDetails] Invalid selectedRestaurant ID:', selectedRestaurant?.id);
            }
        };

        if (selectedRestaurant?.id && selectedRestaurant.id !== 'N/A') {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: Platform.OS !== 'web',
            }).start();
            fetchRestaurantDetails();
        } else {
            Animated.timing(slideAnim, {
                toValue: screenWidth,
                duration: 300,
                useNativeDriver: Platform.OS !== 'web',
            }).start();
        }
    }, [selectedRestaurant]);

    
    


    return (
        <Animated.View style={[styles.sideModal, { transform: [{ translateX: slideAnim }] }]}>
            <View style={styles.modalContent}>
                <Text style={styles.restaurantName}>{restaurantDetails.name}</Text>

                <View style={styles.infoContainer}>
                    <Text style={styles.label}>Address:</Text>
                    <Text style={styles.restaurantAddress}>{restaurantDetails.address}</Text>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.label}>Cuisine Type:</Text>
                    <Text style={styles.value}>{restaurantDetails.cuisine_type}</Text>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.label}>Open Now:</Text>
                    <Text style={styles.value}>{restaurantDetails.open_now}</Text>
                </View>

                {restaurantDetails.opening_hours && restaurantDetails.opening_hours.length > 0 && (
                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Opening Hours:</Text>
                        {restaurantDetails.opening_hours.map((hours, index) => (
                            <Text key={index} style={styles.value}>
                                {hours}
                            </Text>
                        ))}
                    </View>
                )}              

                <View style={styles.infoContainer}>
                    <Text style={styles.label}>Rating:</Text>
                    <Text style={styles.value}>{restaurantDetails.rating}</Text>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.label}>Menu URL:</Text>
                    <Text
                        style={[styles.value, { color: 'blue', textDecorationLine: 'underline' }]}
                        onPress={() =>
                            restaurantDetails.menu_url !== 'Not available' ? Linking.openURL(restaurantDetails.menu_url) : null
                        }
                    >
                        {restaurantDetails.menu_url}
                    </Text>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.label}>Approx Steps:</Text>
                    <Text style={styles.value}>{directionSteps || 'N/A'}</Text>
                </View>

                <TouchableOpacity onPress={getNewDirections} style={styles.getDirectionsButton}>
                    <Text style={styles.getDirectionsButtonText}>Go to this Restaurant</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { closeModal(); setSelectedRestaurant({}); }} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setShowRewards(!showRewards)} style={styles.getDirectionsButton}>
                    <Text style={styles.getDirectionsButtonText}>Go to this Restaurant</Text>
                </TouchableOpacity>

                {showRewards && <RewardsPopup showRewards={showRewards} setShowRewards={setShowRewards}/>}
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
        backgroundColor: '#34C759',
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
