import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image, Alert, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../Context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '@env';

const RewardDetails = ({ reward, onClose }) => {
    const { userId, userToken, fetchUserPoints, fetchUserRewards } = useContext(AuthContext);
    const [qrCodeUrl, setQrCodeUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    // Finalize the redemption process and fetch the QR code
    const finalizeRedemption = async () => {
        setLoading(true);
        try {
            const response = await axios.put(
                `${API_BASE_URL}/redemptions/verify/${userId}/${reward.id}`,
                {},
                { headers: { Authorization: `Bearer ${userToken}` } }
            );

            console.log("Redemption API Response:", response.data);

            if (response.data && response.data.verifiedRedemption) {
                const { qr_code_url } = response.data;
                setQrCodeUrl(qr_code_url);
                Alert.alert("Success", "Reward redeemed successfully!");

                // Update user's points and rewards
                await fetchUserPoints();
                await fetchUserRewards();
            } else {
                Alert.alert("Error", "Redemption verification failed.");
            }
        } catch (error) {
            console.error("Error finalizing redemption:", error.response?.data || error.message);
            Alert.alert("Error", "Error finalizing redemption. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (qrCodeUrl) {
            console.log("QR Code URL:", qrCodeUrl);
        }
    }, [qrCodeUrl]);

    return (
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Scan this QR Code to redeem your reward!</Text>
                
                {loading ? (
                    <ActivityIndicator size="large" color="#A41623" />
                ) : qrCodeUrl ? (
                    <Image source={{ uri: qrCodeUrl }} style={styles.qrCodeImage} />
                ) : (
                    <Text>No QR code available.</Text>
                )}

                <TouchableOpacity
                    onPress={finalizeRedemption}
                    style={[styles.closeButton, (loading || qrCodeUrl) && styles.disabledButton]}
                    disabled={loading || qrCodeUrl}
                >
                    <Text style={styles.closeButtonText}>{qrCodeUrl ? "Redeemed" : "I Have Scanned"}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                    <Text style={styles.cancelButtonText}>Close</Text>
                </TouchableOpacity>
            </View>
        </View>
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
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    qrCodeImage: {
        width: 200,
        height: 200,
        marginBottom: 20,
    },
    closeButton: {
        backgroundColor: '#A41623',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 10,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    cancelButton: {
        backgroundColor: '#A9A9A9',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 10,
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
});

export default RewardDetails;
