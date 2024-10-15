import { View, Text, TouchableOpacity, Modal, StyleSheet, Animated } from 'react-native';
import React, { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../../Context/AuthContext';
import { API_BASE_URL } from '@env';
import axios from 'axios';

const RewardSideModal = ({ reward, setModalVisible }) => {
    const { user, userId, isNearRestaurant } = useContext(AuthContext);
    const [showMessage, setShowMessage] = useState(false); // Track pop-up visibility
    const fadeAnim = useRef(new Animated.Value(0)).current; // Initial fade value

    const handleRedemption = async () => {
        try {
            const updatedUser = { ...user, points_earned: user.points_earned - reward.points_required };
            await axios.put(`${API_BASE_URL}/users/${userId}`, updatedUser);
            setModalVisible(false);
            triggerSuccessMessage(); // Show success message after redemption
        } catch (err) {
            console.error('Error redeeming reward:', err);
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

    return (
        <Modal
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.rewardDetail}>{reward.details}</Text>
                    <Text style={styles.expiration}>Expires on: {reward.expiration_date}</Text>

                    <TouchableOpacity
                        style={styles.useButton}
                        disabled={!isNearRestaurant}
                        onPress={handleRedemption}
                    >
                        <Text style={styles.useButtonText}>Use Now</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={() => setModalVisible(false)}
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
    },
    expiration: {
        marginBottom: 20,
        fontFamily: 'Open-Sans',
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
