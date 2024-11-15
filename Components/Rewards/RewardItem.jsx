import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AuthContext } from '../../Context/AuthContext';

const RewardItem = ({ reward, showSaveButton, handleSaveForLater, handleRedeem, handleDelete }) => {
    const { user, fetchUserPoints } = useContext(AuthContext);
    const [canRedeem, setCanRedeem] = useState(false);

    useEffect(() => {
        // Fetch points once when the component mounts to ensure up-to-date points data
        fetchUserPoints();
    }, [fetchUserPoints]);

    useEffect(() => {
        const rewardPointsRequired = Number(reward.points_required) || 0;
        const userPoints = Number(user.points_earned) || 0;
        const hasEnoughPoints = userPoints >= rewardPointsRequired;
        setCanRedeem(hasEnoughPoints);
    }, [user, reward]);

    return (
        <View style={styles.rewardItem}>
            <Text style={styles.rewardTitle}>{reward.details || "No details available"}</Text>
            <Text style={styles.rewardDescription}>
                Expires: {reward.expiration_date ? new Date(reward.expiration_date).toLocaleDateString() : "N/A"}
            </Text>
            <Text style={styles.points}>Points Required: {Number(reward.points_required) || 0}</Text>

            {showSaveButton ? (
                <TouchableOpacity style={styles.saveButton} onPress={() => handleSaveForLater(reward)}>
                    <Text style={styles.saveButtonText}>Save for Later</Text>
                </TouchableOpacity>
            ) : (
                <>
                    <TouchableOpacity 
                        style={[styles.redeemButton, canRedeem ? styles.redeemable : styles.locked]}
                        onPress={() => handleRedeem(reward)}
                        disabled={!canRedeem}
                    >
                        <Text style={styles.redeemButtonText}>Redeem Now</Text>
                    </TouchableOpacity>
                    {/* Uncomment the delete button if delete functionality is needed */}
                    {/* <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(reward.id)}>
                        <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity> */}
                </>
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
    saveButton: {
        marginTop: 10,
        alignSelf: 'center',
        backgroundColor: '#FFA500',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        width: '80%',
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    redeemButton: {
        marginTop: 10,
        alignSelf: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        width: '80%',
        alignItems: 'center',
    },
    redeemable: {
        backgroundColor: '#0BCF07',
    },
    locked: {
        backgroundColor: '#A9A9A9',
    },
    redeemButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 10,
        alignSelf: 'center',
        width: '80%',
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default RewardItem;
