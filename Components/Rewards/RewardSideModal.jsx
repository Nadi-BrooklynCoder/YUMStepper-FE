import { View, Text, TouchableOpacity, Modal, StyleSheet, Animated } from 'react-native';
import React, { useContext, useState, useRef } from 'react';
import { AuthContext } from '../../Context/AuthContext';
import { API_BASE_URL } from '@env';
import axios from 'axios';

const RewardSideModal = ({ setModalVisible }) => {
    const { selectedReward, user, userId, userToken,setSelectedReward } = useContext(AuthContext);
    const [showMessage, setShowMessage] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const handleRedemption = async () => {
        if (!selectedReward || !user) return;
        try {
            const response = await axios.put(
                `${API_BASE_URL}/users/${userId}/rewards/${selectedReward.id}/redeem`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                    },
                }
            );
            // Optionally update user points from response
            // setUser(response.data.updatedUser);
            setModalVisible(false);
            setSelectedReward({});
            triggerSuccessMessage();
        } catch (err) {
            console.error('Error redeeming reward:', err);
        }
    };
    
    

    const handleSaveForLater = async () => {
        if (!selectedReward || !user) return;
        try {
            await axios.post(
                `${API_BASE_URL}/users/${userId}/rewards`,
                { reward_id: selectedReward.id },
                {
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                    },
                }
            );
            setModalVisible(false);
            setSelectedReward({});
            triggerSuccessMessage("Reward saved for later!");
        } catch (err) {
            console.error('Error saving reward:', err);
        }
    };
    

    const triggerSuccessMessage = (message = 'Successfully redeemed reward!') => {
        setShowMessage(true);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start(() => {
            setTimeout(() => {
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }).start(() => setShowMessage(false));
            }, 5000);
        });
    };

    if (!selectedReward) return null;

    return (
        <Modal animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.rewardDetail}>{selectedReward.details || 'Reward Details'}</Text>
                    <Text style={styles.expiration}>
                        Expires on: {selectedReward.expiration_date ? new Date(selectedReward.expiration_date).toLocaleDateString() : 'N/A'}
                    </Text>
                    <TouchableOpacity style={styles.useButton} onPress={handleRedemption}>
                        <Text style={styles.useButtonText}>Redeem Now</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveForLater}>
                        <Text style={styles.saveButtonText}>Save for Later</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
                {showMessage && (
                    <Animated.View style={[styles.popupContainer, { opacity: fadeAnim }]}>
                        <Text style={styles.popupText}>Successfully saved reward for later!</Text>
                    </Animated.View>
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    modalContent: { width: '80%', padding: 20, backgroundColor: '#fff', borderRadius: 10, alignItems: 'center' },
    rewardDetail: { fontSize: 18, marginBottom: 10 },
    expiration: { marginBottom: 20 },
    useButton: { backgroundColor: '#A41623', padding: 10, borderRadius: 5, marginBottom: 10 },
    useButtonText: { color: '#fff' },
    saveButton: { backgroundColor: '#FFA500', padding: 10, borderRadius: 5 },
    saveButtonText: { color: '#fff' },
    closeButton: { backgroundColor: '#A41623', padding: 10, borderRadius: 5, marginTop: 10 },
    closeButtonText: { color: '#fff' },
    popupContainer: { position: 'absolute', bottom: 50, backgroundColor: '#4BB543', padding: 10, borderRadius: 5 },
    popupText: { color: '#fff' },
});

export default RewardSideModal;
