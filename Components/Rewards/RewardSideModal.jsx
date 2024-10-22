// RewardSideModal.jsx
import { View, Text, TouchableOpacity, Modal, StyleSheet, Animated } from 'react-native';
import React, { useContext, useState, useRef } from 'react';
import { AuthContext } from '../../Context/AuthContext';
import { API_BASE_URL } from '@env';
import axios from 'axios';

const RewardSideModal = ({ setModalVisible }) => { // Removed 'reward' prop
    const { selectedReward, user, userId, isNearRestaurant, setSelectedReward } = useContext(AuthContext);
    const [showMessage, setShowMessage] = useState(false); // Track pop-up visibility
    const fadeAnim = useRef(new Animated.Value(0)).current; // Initial fade value

    const handleRedemption = async () => {
        if (!selectedReward || !user) {
            console.error("Missing reward or user information.");
            return;
        }
        try {
            // Update user's points
            const updatedUser = { ...user, points_earned: user.points_earned - selectedReward.points_required };
            await axios.put(`${API_BASE_URL}/users/${userId}`, updatedUser, {
                headers: {
                    Authorization: `Bearer ${userToken}`, // Ensure userToken is available
                },
            });
            setModalVisible(false);
            setSelectedReward({}); // Clear selected reward
            triggerSuccessMessage(); // Show success message after redemption
        } catch (err) {
            console.error('Error redeeming reward:', err);
            Alert.alert("Redemption Failed", "There was an error redeeming your reward. Please try again.");
        }
    };

    const triggerSuccessMessage = () => {
        setShowMessage(true);
        Animated.timing(fadeAnim, {
            toValue: 1, // Fade in
            duration: 500,
            useNativeDriver: true,
        }).start(() => {
            setTimeout(() => {
                Animated.timing(fadeAnim, {
                    toValue: 0, // Fade out
                    duration: 500,
                    useNativeDriver: true,
                }).start(() => setShowMessage(false));
            }, 5000); // Message disappears after 5 seconds
        });
    };

    if (!selectedReward) {
        return null; // Or render a fallback UI/message
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.rewardDetail}>{selectedReward.details || 'Reward Details'}</Text>
                    <Text style={styles.expiration}>Expires on: {selectedReward.expiration_date ? new Date(selectedReward.expiration_date).toLocaleDateString() : 'N/A'}</Text>

                    <TouchableOpacity
                        style={[styles.useButton, (!isNearRestaurant || selectedReward.points_required > user?.points_earned) && styles.disabledButton]}
                        disabled={!isNearRestaurant || selectedReward.points_required > user?.points_earned}
                        onPress={handleRedemption}
                    >
                        <Text style={styles.useButtonText}>Redeem Now</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={() => {
                            setModalVisible(false);
                            setSelectedReward({});
                        }}
                    >
                        <Text style={styles.saveButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>

                {showMessage && (
                    <Animated.View style={[styles.popupContainer, { opacity: fadeAnim }]}>
                        <Text style={styles.popupText}>Successfully redeemed reward!</Text>
                    </Animated.View>
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        alignItems: 'center',
    },
    rewardDetail: {
        fontSize: 18,
        fontFamily: 'Itim',
        marginBottom: 10,
        color: '#02243D',
    },
    expiration: {
        marginBottom: 20,
        fontFamily: 'Open-Sans',
        color: '#212529',
    },
    useButton: {
        backgroundColor: '#A41623',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginBottom: 10,
    },
    useButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontFamily: 'Open-Sans',
    },
    disabledButton: {
        backgroundColor: '#A9A9A9', // Greyed out color
    },
    saveButton: {
        backgroundColor: '#FFA500',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontFamily: 'Open-Sans',
    },
    popupContainer: {
        position: 'absolute',
        bottom: 50,
        backgroundColor: '#4BB543', // Green success color
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    popupText: {
        color: '#fff',
        fontWeight: 'bold',
        fontFamily: 'Open-Sans',
    },
});

export default RewardSideModal;
