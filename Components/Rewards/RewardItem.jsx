import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image } from 'react-native';
import { AuthContext } from '../../Context/AuthContext';

const RewardItem = ({ reward, inSavedRewards, isSaved, handleSaveForLater }) => {
    const { 
        user, 
        userRewards, 
        handleRedemption, 
        qrCodeUrl, 
        showMessage, 
        selectReward,
        selectedReward,
        fetchUserPoints
    } = useContext(AuthContext);

    const [errorMessage, setErrorMessage] = useState('');
    const [canRedeem, setCanRedeem] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Determine if the user has enough points to redeem the reward
    const hasEnoughPoints = user.points_earned >= (reward.points_required || 0);

    useEffect(() => {
        // Find the matching reward in userRewards by reward_id for proper identification
        const savedReward = userRewards.find((r) => r.reward_id === reward.id);

        // Log details for debugging
        console.log("Checking redeem status for reward ID:", reward.id);
        console.log("User points:", user.points_earned, "Points required:", reward.points_required);
        console.log("Has enough points:", hasEnoughPoints);
        console.log("Redemptions count:", savedReward ? savedReward.redemptions_count : "No savedReward found");

        // Set redemptionsCount to 0 if undefined
        const redemptionsCount = savedReward?.redemptions_count ?? 0;

        // Determine if the user can redeem based on points, redemptions count, and points_required
        const calculatedCanRedeem = hasEnoughPoints && redemptionsCount < 3;
        console.log("Calculated canRedeem:", calculatedCanRedeem);

        setCanRedeem(calculatedCanRedeem);
    }, [userRewards, reward.id, hasEnoughPoints, user.points_earned]);

    // Handle saving reward for later with logging
    const handleSaveForLaterClick = () => {
        console.log("Saving reward for later with ID:", reward.id);
        handleSaveForLater(reward);
    };

    // Handle redeeming reward with logging
    const handleRedeem = async () => {
        await fetchUserPoints(); // Ensure the latest points before checking
        if (user.points_earned >= reward.points_required) {
            selectReward({ ...reward, user_reward_id: reward.user_reward_id || reward.id });
        } else {
            setErrorMessage("Insufficient points to redeem this reward.");
        }
    };
    

    useEffect(() => {
        if (qrCodeUrl) {
            setIsModalVisible(true);
            console.log("QR Code URL available, displaying modal:", qrCodeUrl);
        }
    }, [qrCodeUrl]);
    
    useEffect(() => {
        if (selectedReward?.id === reward.id) {
            handleRedemption();
        }
    }, [selectedReward, reward.id, handleRedemption]);

    return (
        <View style={styles.rewardItem}>
            <Text style={styles.rewardTitle}>{reward.details || "No details available"}</Text>
            <Text style={styles.rewardDescription}>Expires: {reward.expiration_date ? new Date(reward.expiration_date).toLocaleDateString() : "No expiration date"}</Text>
            <Text style={styles.points}>Points Required: {reward.points_required || 0}</Text>

            {!inSavedRewards && (
                <TouchableOpacity
                    style={[styles.saveButton, isSaved ? styles.disabledSave : {}]}
                    onPress={handleSaveForLaterClick}
                    disabled={isSaved}
                >
                    <Text style={styles.saveButtonText}>{isSaved ? "Saved" : "Save Reward"}</Text>
                </TouchableOpacity>
            )}

            {inSavedRewards && (
                <TouchableOpacity
                    style={[styles.redeemButton, canRedeem ? styles.redeemable : styles.locked]}
                    onPress={handleRedeem}
                    disabled={!canRedeem}
                >
                    <Text style={styles.redeemButtonText}>Redeem Now</Text>
                </TouchableOpacity>
            )}

            {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}

            {isModalVisible && qrCodeUrl && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={isModalVisible}
                    onRequestClose={() => setIsModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.qrCodeContainer}>
                            <Text style={styles.modalTitle}>Scan this QR Code</Text>
                            <Image source={{ uri: qrCodeUrl }} style={styles.qrCodeImage} />
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setIsModalVisible(false)}
                            >
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}

            {showMessage && <Text style={styles.successMessage}>{showMessage}</Text>}
        </View>
    );
};

// Styles
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
    disabledSave: {
        backgroundColor: '#A9A9A9',
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
    errorMessage: {
        marginTop: 10,
        color: 'red',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    qrCodeContainer: {
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
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    successMessage: {
        color: 'green',
        textAlign: 'center',
        marginTop: 10,
    },
});

export default RewardItem;
