import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Animated, 
    Dimensions, 
    Linking, 
    Platform 
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { AuthContext } from '../../Context/AuthContext';
import RewardsPopup from '../Rewards/RewardsPopup';
import RewardSideModal from '../Rewards/RewardSideModal';

const { width: screenWidth } = Dimensions.get('window');

const MapSide = ({ setSideModalVisible }) => {
    const { 
        selectedRestaurant, 
        setSelectedRestaurant, 
        calculateSteps, 
        getDirectionsFromGoogleMaps, 
        directionSteps, 
        selectedReward, 
        setSelectedReward 
    } = useContext(AuthContext);
    
    const [restaurantDetails, setRestaurantDetails] = useState({});
    const [showRewards, setShowRewards] = useState(false);
    const [showRewards, setShowRewards] = useState(false);
    const slideAnim = useRef(new Animated.Value(screenWidth)).current;

    const closeModal = () => {
        Animated.timing(slideAnim, {
            toValue: screenWidth,
            duration: 300,
            useNativeDriver: Platform.OS !== 'web',
        }).start(() => {
            setSideModalVisible(false);
            setSelectedRestaurant({});
        });
    };

    const getNewDirections = async () => {
        if (Platform.OS !== 'web') {
            await getDirectionsFromGoogleMaps();
        } else {
            console.log('Directions feature is not available on the web');
        }
        closeModal();
    };
    
    useEffect(() => {
        const fetchRestaurantDetails = async () => {
            if (selectedRestaurant?.id && selectedRestaurant.id !== 'N/A') {
                try {
                    const response = await axios.get(`${API_BASE_URL}/restaurants/details/${selectedRestaurant.id}`);
                    if (response.data && response.data.data) {
                        const details = response.data.data;
                        setRestaurantDetails({
                            id: details.id,
                            name: details.name || 'Not Available',
                            address: details.address || 'Not Available',
                            latitude: details.latitude || selectedRestaurant.latitude,
                            longitude: details.longitude || selectedRestaurant.longitude,
                            open_now: details.open_now || 'No',
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
                    if (error.response?.status === 404) {
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
    }, [selectedRestaurant, calculateSteps]);

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
                        style={[styles.value, { color: restaurantDetails.menu_url !== 'Not available' ? 'blue' : 'grey', textDecorationLine: restaurantDetails.menu_url !== 'Not available' ? 'underline' : 'none' }]}
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

                <TouchableOpacity onPress={() => setShowRewards(!showRewards)} style={styles.showRewardsButton}>
                    <Text style={styles.showRewardsButtonText}>Show Rewards</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setShowRewards(!showRewards)} style={styles.getDirectionsButton}>
                    <Text style={styles.getDirectionsButtonText}>Go to this Restaurant</Text>
                </TouchableOpacity>

                {showRewards && <RewardsPopup showRewards={showRewards} setShowRewards={setShowRewards}/>}
            </View>

            {showRewards && (
                <RewardsPopup showRewards={showRewards} setShowRewards={setShowRewards} />
            )}

            {selectedReward?.id && (
                <RewardSideModal 
                    setModalVisible={() => setSelectedReward({})}
                />
            )}
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
        backgroundColor: '#fff',
        borderLeftWidth: 1,
        borderLeftColor: '#ccc',
        shadowColor: '#000',
        shadowOffset: {
            width: -2,
            height: 0,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 2,
    },
    modalContent: {
        flex: 1,
        padding: 20,
        justifyContent: 'flex-start',
    },
    restaurantName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#02243D',
        fontFamily: 'Itim',
    },
    infoContainer: {
        marginBottom: 10,
    },
    label: {
        fontWeight: '600',
        fontFamily: 'Open-Sans',
        color: '#212529',
    },
    value: {
        fontFamily: 'Open-Sans',
        color: '#212529',
    },
    restaurantAddress: {
        fontFamily: 'Open-Sans',
        color: '#212529',
    },
    getDirectionsButton: {
        backgroundColor: '#02243D',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 15,
        alignItems: 'center',
    },
    getDirectionsButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Open-Sans',
        fontWeight: 'bold',
    },
    showRewardsButton: {
        backgroundColor: '#FFA500',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center',
    },
    showRewardsButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Open-Sans',
        fontWeight: 'bold',
    },
    closeButton: {
        backgroundColor: '#A41623',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 20,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Open-Sans',
        fontWeight: 'bold',
    },
});

export default MapSide;
