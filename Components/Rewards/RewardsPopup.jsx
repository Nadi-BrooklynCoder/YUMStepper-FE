import React, { useContext, useCallback, useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    Modal, 
    StyleSheet, 
    FlatList, 
    ActivityIndicator,
    Dimensions 
} from 'react-native';
import { AuthContext } from '../../Context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import RewardItem from './RewardItem';

const RewardsPopup = ({ showRewards, setShowRewards }) => {
    const { userId, userToken, selectedRestaurant, setUserRewards, fetchUserPoints } = useContext(AuthContext);
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Fetch Rewards for Selected Restaurant
    const fetchRewards = useCallback(async () => {
        if (!selectedRestaurant?.id) return;

        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/rewards`);
            const restaurantRewards = response.data.filter(reward => reward.restaurant_id === selectedRestaurant.id);
            setRewards(restaurantRewards);
        } catch (error) {
            console.error('Failed to fetch rewards:', error);
            setMessage({ text: "Failed to load rewards.", type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [selectedRestaurant]);

    useEffect(() => {
        if (selectedRestaurant) {
            fetchRewards();
        }
    }, [selectedRestaurant, fetchRewards]);

    // Handle Save for Later
    const handleSaveForLater = useCallback(async (reward) => {
        if (!reward || !userId) {
            setMessage({ text: "Invalid reward or user.", type: 'error' });
            return;
        }
        try {
            await axios.post(
                `${API_BASE_URL}/users/${userId}/userRewards`,
                { reward_id: reward.id },
                { headers: { Authorization: `Bearer ${userToken}` } }
            );

            const userRewardsResponse = await axios.get(`${API_BASE_URL}/users/${userId}/userRewards`, {
                headers: { Authorization: `Bearer ${userToken}` },
            });
            setUserRewards(userRewardsResponse.data);
            await fetchUserPoints();
            setMessage({ text: "Reward saved for later!", type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (err) {
            console.error('Error saving reward:', err);
            setMessage({ text: "Error saving reward. Please try again.", type: 'error' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        }
    }, [userId, userToken, setUserRewards, fetchUserPoints]);

    return (
        <Modal
            transparent
            visible={showRewards}
            animationType="fade"
            onRequestClose={() => setShowRewards(false)}
        >
            <View style={styles.overlay}>
                <View style={styles.popupContainer}>
                    <Text style={styles.header}>Rewards at {selectedRestaurant?.name || 'Selected Restaurant'}</Text>

                    {loading ? (
                        <ActivityIndicator size="large" color="#0000ff" />
                    ) : rewards.length > 0 ? (
                        <FlatList
                            data={rewards}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <RewardItem
                                    reward={item}
                                    handleSaveForLater={() => handleSaveForLater(item)}
                                    showSaveButton={true} // Show Save for Later button
                                />
                            )}
                            contentContainerStyle={styles.listContent}
                        />
                    ) : (
                        <Text style={styles.noRewardsText}>No rewards available.</Text>
                    )}

                    {message.text && (
                        <Text style={message.type === 'success' ? styles.successMessage : styles.errorMessage}>
                            {message.text}
                        </Text>
                    )}

                    <TouchableOpacity style={styles.closeButton} onPress={() => setShowRewards(false)}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};



const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popupContainer: {
        width: '85%',
        maxHeight: Dimensions.get('window').height * 0.7,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
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
    successMessage: {
        color: 'green',
        textAlign: 'center',
        marginVertical: 10,
    },
    errorMessage: {
        color: 'red',
        textAlign: 'center',
        marginVertical: 10,
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
    listContent: {
        paddingBottom: 20,
    },
});

export default RewardsPopup;
