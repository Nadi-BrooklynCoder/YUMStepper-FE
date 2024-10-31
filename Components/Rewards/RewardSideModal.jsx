// RewardSideModal.js

import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Image } from 'react-native';
import { AuthContext } from '../../Context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '@env';

const RewardSideModal = ({ setModalVisible, handleDeleteReward }) => {
    const { userId, userToken, selectReward, selectedReward, fetchUserPoints } = useContext(AuthContext);
    const [qrCodeUrl, setQrCodeUrl] = useState(null);
    const [showMessage, setShowMessage] = useState(false);

    // Handle reward redemption
    const handleRedemption = async () => {
        const rewardId = selectedReward?.reward_id || selectedReward?.id;
        if (!rewardId || !userId) {
            console.warn("Selected reward or userId is missing");
            return;
        }
        try {
            const response = await axios.put(
                `${API_BASE_URL}/users/${userId}/userRewards/${rewardId}/redeem`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                    },
                }
            );

            const { qr_code_url } = response.data;
            
            if (qr_code_url) {
                setQrCodeUrl(qr_code_url);
                setShowMessage("QR code generated successfully!");
            } else {
                setShowMessage("Redemption successful but no QR code generated.");
            }

            // Refresh user points after redemption
            await fetchUserPoints();
        } catch (err) {
            console.error("Error redeeming reward:", err);
            setShowMessage("Error redeeming reward. Please try again.");
        }
    };

    useEffect(() => {
        console.log("SelectedReward state:", selectedReward); // Log entire object
        if (selectedReward?.id) {
            console.log("Confirmed selectedReward ID:", selectedReward.id);
        } else if (selectedReward && !selectedReward.id) {
            console.warn("Selected reward exists but has no ID:", selectedReward);
        } else {
            console.warn("No valid selectedReward set.");
        }
    }, [selectedReward]);

    return (
        <Modal animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    {selectedReward ? (
                        <>
                            <Text style={styles.rewardDetail}>{selectedReward.details || 'Reward Details'}</Text>
                            <Text style={styles.expiration}>
                                Expires on: {selectedReward.expiration_date ? new Date(selectedReward.expiration_date).toLocaleDateString() : 'N/A'}
                            </Text>
                            <TouchableOpacity style={styles.useButton} onPress={handleRedemption}>
                                <Text style={styles.useButtonText}>Redeem Now</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => {
                                    handleDeleteReward(selectedReward.id);
                                    selectReward(null); // Clear selection after deletion
                                }}
                            >
                                <Text style={styles.deleteButtonText}>Delete Reward</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <Text style={styles.noRewardText}>No reward selected</Text>
                    )}
                    {showMessage && <Text style={styles.message}>{showMessage}</Text>}
                    <TouchableOpacity 
                        style={styles.closeButton} 
                        onPress={() => {
                            setModalVisible(false);
                            selectReward(null); // Clear selectedReward when closing modal
                        }}
                    >
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                    {qrCodeUrl && (
                        <Image source={{ uri: qrCodeUrl }} style={styles.qrCode} />
                    )}
                </View>
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
    deleteButton: { backgroundColor: '#FF3B30', padding: 10, borderRadius: 5, marginBottom: 10 },
    deleteButtonText: { color: '#fff' },
    closeButton: { backgroundColor: '#A41623', padding: 10, borderRadius: 5, marginTop: 10 },
    closeButtonText: { color: '#fff' },
    qrCode: { width: 100, height: 100, marginTop: 20 },
    noRewardText: { fontSize: 16, color: '#A41623', textAlign: 'center', marginBottom: 20 },
    message: { fontSize: 14, color: '#4CAF50', marginTop: 10 },
});

export default RewardSideModal;
