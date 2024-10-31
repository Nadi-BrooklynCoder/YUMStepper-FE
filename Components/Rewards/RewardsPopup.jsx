// RewardsPopup.js

import React, { useContext, useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Image, Dimensions } from 'react-native';
import { AuthContext } from '../../Context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import RewardItem from './RewardItem';

const { height: screenHeight } = Dimensions.get('window'); // Added line

const RewardsPopup = ({ showRewards, setShowRewards }) => {
    const { userId, userToken, selectedRestaurant, setUserRewards, fetchUserPoints, user } = useContext(AuthContext);
    const [rewards, setRewards] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchRewards = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/rewards`);
                const restaurantRewards = response.data.filter(
                    reward => reward.restaurant_id === selectedRestaurant.id
                );
                setRewards(restaurantRewards);
            } catch (error) {
                console.error('Failed to fetch rewards:', error);
            }
        };

        if (selectedRestaurant) {
            fetchRewards();
        }
    }, [selectedRestaurant]);

    const handleSaveForLater = useCallback(async (reward) => {
        if (!reward || !userId) return;
        console.log("Attempting to save reward:", reward);

        try {
            console.log("User Token:", userToken);

            // Make the API call to save the specific reward
            await axios.post(
                `${API_BASE_URL}/users/${userId}/userRewards`,
                { reward_id: reward.id },
                {
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                    },
                }
            );

            // Update only the saved reward in the rewards list, setting `saved: true`
            setRewards((prevRewards) =>
                prevRewards.map((r) =>
                    r.id === reward.id ? { ...r, saved: true } : r
                )
            );

            console.log("User Token:", userToken);

            // Update user rewards list
            const userRewardsResponse = await axios.get(`${API_BASE_URL}/users/${userId}/userRewards`, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            });
            setUserRewards(userRewardsResponse.data);
            await fetchUserPoints(); // Fetch updated points immediately
            setSuccessMessage("Reward saved for later!");
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error saving reward:', err);
            setErrorMessage("Error saving reward. Please try again.");
            setTimeout(() => setErrorMessage(''), 3000);
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
                    <Text style={styles.header}>
                        Rewards at {selectedRestaurant?.name}
                    </Text>

                    {rewards.length > 0 ? (
                        rewards.map((reward) => (
                            <RewardItem
                                key={reward.id}
                                reward={reward}
                                handleSaveForLater={() => handleSaveForLater(reward)}
                            />
                        ))
                    ) : (
                        <Text style={styles.noRewardsText}>No rewards available.</Text>
                    )}

                    {successMessage ? <Text style={styles.successMessage}>{successMessage}</Text> : null}
                    {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setShowRewards(false)}
                    >
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
        maxHeight: screenHeight * 0.7, // Now defined
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        elevation: 10,
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
});

export default RewardsPopup;
