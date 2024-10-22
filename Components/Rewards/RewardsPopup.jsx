import React, { useContext, useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Modal, 
    ScrollView, 
    TouchableOpacity, 
    Dimensions 
} from 'react-native';
import { AuthContext } from '../../Context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import RewardItem from './RewardItem'; // Import the RewardItem component

const { height: screenHeight } = Dimensions.get('window');

const RewardsPopup = ({ showRewards, setShowRewards }) => {
    const { selectedRestaurant } = useContext(AuthContext);
    const [rewards, setRewards] = useState([]);
    const mockRewards = [
        {
          id: 1,
          date_generated: "2024-10-01T08:30:00Z",
          details: "Get 10% off on your next order.",
          expiration_date: "2024-12-31T23:59:59Z",
          user_id: 101,
          restaurant_id: 1,
          points_required: 100,
        },
        {
          id: 2,
          date_generated: "2024-09-15T14:20:00Z",
          details: "Free dessert with any main course.",
          expiration_date: "2024-11-30T23:59:59Z",
          user_id: 102,
          restaurant_id: 1,
          points_required: 50,
        },
        {
          id: 3,
          date_generated: "2024-10-10T10:45:00Z",
          details: "20% off on your next meal.",
          expiration_date: "2025-01-15T23:59:59Z",
          user_id: 103,
          restaurant_id: 2,
          points_required: 200,
        },
        {
          id: 4,
          date_generated: "2024-09-25T16:00:00Z",
          details: "Get a free coffee with every breakfast order.",
          expiration_date: "2024-11-01T23:59:59Z",
          user_id: 101,
          restaurant_id: 3,
          points_required: 30,
        },
        {
          id: 5,
          date_generated: "2024-08-20T09:15:00Z",
          details: "Double loyalty points on all purchases today!",
          expiration_date: "2024-10-31T23:59:59Z",
          user_id: 104,
          restaurant_id: 2,
          points_required: 0,
        },
    ];

    useEffect(() => {
        const fetchRewards = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/rewards`);
                const restaurantsRewards = response.data.filter(reward => reward.restaurant_id === selectedRestaurant.id);
                setRewards(restaurantsRewards); 
            } catch (error) {
                console.error('Failed to fetch rewards:', error);
            }
        };

        if (selectedRestaurant) {
            fetchRewards();
        } 
    }, [selectedRestaurant]);

    // Function to handle redeeming a reward
    

    return (
        <Modal
            transparent
            visible={showRewards}
            animationType="fade"
            onRequestClose={() => setShowRewards(false)}
        >
            <View style={styles.overlay}>
                <View style={styles.popupContainer}>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <Text style={styles.header}>
                            Rewards at {selectedRestaurant?.name}
                        </Text>

                        {mockRewards.length > 0 ? ( // REPLACE WITH ACTUAL REWARDS 
                            mockRewards.map((reward) => (
                                <RewardItem 
                                    key={reward.id} 
                                    reward={reward} 
                                />
                            ))
                        ) : (
                            <Text style={styles.noRewardsText}>No rewards available.</Text>
                        )}

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowRewards(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dark background with opacity
        justifyContent: 'center',
        alignItems: 'center',
    },
    popupContainer: {
        width: '85%',
        maxHeight: screenHeight * 0.7, // Popup height limited to 70% of the screen
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        elevation: 10, // Shadow for Android
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        color: '#02243D',
    },
    noRewardsText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#212529',
    },
    closeButton: {
        marginTop: 20,
        alignSelf: 'center',
        backgroundColor: '#02243D',
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 8,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default RewardsPopup;
