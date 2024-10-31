// RewardItem.js

import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { AuthContext } from '../../Context/AuthContext';

const RewardItem = ({ reward, handleSaveForLater }) => {
    const { userId, userToken, fetchUserPoints, user } = useContext(AuthContext);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState(null);

    const hasEnoughPoints = user.points_earned >= (reward.points_required || 0);  // Access points from user object

    const handleRedeem = async () => {
        if (!hasEnoughPoints) {
            setErrorMessage('Not enough points to redeem this reward');
            return;
        }

        const redeemId = reward.reward_id || reward.id;
        if (!redeemId) {
            setErrorMessage('Reward ID is missing');
            return;
        }

        try {
            const response = await axios.put(
                `${API_BASE_URL}/users/${userId}/userRewards/${redeemId}/redeem`, // Corrected path
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
                setSuccessMessage('QR code generated successfully!');
            } else {
                setSuccessMessage('Redemption successful, but no QR code provided.');
            }

            // Refresh user points after redemption
            await fetchUserPoints();

            setErrorMessage('');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error redeeming reward:', error);
            setErrorMessage('Error redeeming reward. Please try again.');
        }
    };

    // Fallback values for missing details
    const rewardDetails = reward.details || "No details available";
    const pointsRequired = reward.points_required || 0;
    const expirationDate = reward.expiration_date ? 
        new Date(reward.expiration_date).toLocaleDateString() : "No expiration date";

    return (
        <View style={styles.rewardItem}>
            <Text style={styles.rewardTitle}>{rewardDetails}</Text>
            <Text style={styles.rewardDescription}>Expires: {expirationDate}</Text>
            <Text style={styles.points}>Points Required: {pointsRequired}</Text>
            
            <TouchableOpacity 
                style={[styles.redeemButton, !hasEnoughPoints && styles.disabledButton]} 
                onPress={handleRedeem}
                disabled={!hasEnoughPoints}
            >
                <Text style={styles.redeemButtonText}>Redeem Now</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.saveButton}
                onPress={() => handleSaveForLater(reward)}
            >
                <Text style={styles.saveButtonText}>Save for later</Text>
            </TouchableOpacity>

            {successMessage && (
                <Text style={styles.successMessage}>{successMessage}</Text>
            )}
            {errorMessage && (
                <Text style={styles.errorMessage}>{errorMessage}</Text>
            )}

            {/* Display the QR Code if available */}
            {qrCodeUrl && (
                <View style={styles.qrCodeContainer}>
                    <Text style={styles.qrCodeText}>Scan this QR Code:</Text>
                    <Image source={{ uri: qrCodeUrl }} style={styles.qrCode} />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    rewardItem: {
        marginBottom: 15,
        padding: 10,
        borderWidth: 1,
        borderColor: '#dee2e6',
        borderRadius: 8,
        backgroundColor: '#C0E8F9',
    },
    rewardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#02243D',
    },
    rewardDescription: {
        fontSize: 14,
        color: '#212529',
        marginTop: 5,
    },
    points: {
        fontSize: 14,
        color: '#212529',
        marginTop: 5,
        fontStyle: 'italic',
    },
    redeemButton: {
        marginTop: 10,
        alignSelf: 'center',
        backgroundColor: '#02243D',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    redeemButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    saveButton: {
        marginTop: 10,
        alignSelf: 'center',
        backgroundColor: '#FFA500',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    disabledButton: {
        backgroundColor: '#A9A9A9',
    },
    successMessage: {
        marginTop: 10,
        color: 'green',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    errorMessage: {
        marginTop: 10,
        color: 'red',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    qrCodeContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    qrCodeText: {
        fontSize: 16,
        color: '#02243D',
        marginBottom: 10,
    },
    qrCode: {
        width: 150,
        height: 150,
    },
});

export default RewardItem;
