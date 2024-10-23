import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { AuthContext } from '../../Context/AuthContext'; // Adjust the path as needed

const RewardItem = ({ reward }) => {
    const { userId } = useContext(AuthContext);
    const [successMessage, setSuccessMessage] = useState('');

    const handleRedeem = async () => {
        try {
            const response = await axios.put(`${API_BASE_URL}/users/${userId}/rewards/${reward.id}/redeem`);
            console.log('Redeemed Reward:', response.data);
            setSuccessMessage('Reward redeemed successfully!');

            // Optionally, clear the message after a few seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000); // Clear the message after 3 seconds
        } catch (error) {
            console.error('Error redeeming reward:', error);
            // Handle the error (e.g., show a notification to the user)
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
                style={styles.redeemButton} 
                onPress={handleRedeem}
            >
                <Text style={styles.redeemButtonText}>Redeem Now</Text>
            </TouchableOpacity>
            {successMessage.length ? (
                <Text style={styles.successMessage}>{successMessage}</Text>
            ) : null}
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
    successMessage: {
        marginTop: 10,
        color: 'green',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
});

export default RewardItem;
