import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { AuthContext } from '../../Context/AuthContext'; // Adjust the path as needed

const RewardItem = ({ reward }) => {
    const { userId, user, userToken } = useContext(AuthContext); // Extract user from AuthContext
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const hasEnoughPoints = user?.points_earned >= reward.points_required; // Check user's points

    const handleRedeem = async () => {
        if (!hasEnoughPoints) {
            setErrorMessage('Not enough points to redeem this reward');
            return;
        }
    
        try {
            const response = await axios.put(
                `${API_BASE_URL}/users/${userId}/rewards/${reward.id}/redeem`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                    },
                }
            );
    
            // Optionally update user points from response
            // setUser(response.data.updatedUser);
    
            setSuccessMessage('Reward redeemed successfully!');
            setErrorMessage('');
    
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (error) {
            console.error('Error redeeming reward:', error);
            setErrorMessage('Error redeeming reward. Please try again.');
        }
    };
    
    const handleSaveForLater = async () => {
        try {
            await axios.post(
                `${API_BASE_URL}/users/${userId}/rewards`,
                { reward_id: reward.id },
                {
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                    },
                }
            );
    
            setSuccessMessage('Reward saved for later!');
            setErrorMessage('');
    
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (err) {
            console.error('Error saving reward:', err);
            setErrorMessage('Error saving reward. Please try again.');
        }
    };
    

    return (
        <View style={styles.rewardItem}>
            <Text style={styles.rewardTitle}>{reward.details}</Text>
            <Text style={styles.rewardDescription}>
                Expires: {new Date(reward.expiration_date).toLocaleDateString()}
            </Text>
            <Text style={styles.points}>
                Points Required: {reward.points_required}
            </Text>
            <TouchableOpacity 
                style={[styles.redeemButton, !hasEnoughPoints && styles.disabledButton]} 
                onPress={handleRedeem}
                disabled={!hasEnoughPoints}
            >
                <Text style={styles.redeemButtonText}>Redeem Now</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveForLater}
            >
                <Text style={styles.saveButtonText}>Save for later</Text>
            </TouchableOpacity>

            {successMessage.length > 0 && (
                <Text style={styles.successMessage}>{successMessage}</Text>
            )}
            {errorMessage.length > 0 && (
                <Text style={styles.errorMessage}>{errorMessage}</Text>
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
});

export default RewardItem;
