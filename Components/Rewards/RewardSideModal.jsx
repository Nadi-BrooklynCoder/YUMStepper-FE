import React, { useContext, useEffect } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    Modal, 
    StyleSheet, 
    Image, 
    Alert 
} from 'react-native';
import { AuthContext } from '../../Context/AuthContext';

const RewardSideModal = ({ setModalVisible, handleDeleteReward }) => {
    const { 
        user, 
        selectedReward, 
        qrCodeUrl, 
        showMessage, 
        handleRedemption, 
        setSelectedReward, 
        setQrCodeUrl,
        setShowMessage,
        resetModalStates,
    } = useContext(AuthContext);

    const hasEnoughPoints = selectedReward 
        ? (user.points_earned >= (selectedReward.points_required || 0))
        : false;

        const closeRewardModal = () => {
            resetModalStates(); 
            setModalVisible(false);
    
        };
        

    useEffect(() => {
        if (selectedReward && selectedReward.id) {
            console.log("Confirmed selectedReward in RewardItem:", selectedReward);
        }
    }, [selectedReward]);

    useEffect(() => {
        console.log("QR Code URL updated in RewardSideModal:", qrCodeUrl);
    }, [qrCodeUrl]);

    useEffect(() => {
        if (selectedReward?.id) {
            handleRedemption();
        }
    }, [selectedReward, handleRedemption]);

    return (
        <Modal 
            animationType="slide" 
            transparent={true} 
            visible={selectedReward !== null}
            onRequestClose={closeRewardModal}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    {selectedReward ? (
                        <>
                            <Text style={styles.rewardDetail}>
                                {selectedReward.details || 'Reward Details'}
                            </Text>
                            <Text style={styles.expiration}>
                                Expires on: {selectedReward.expiration_date 
                                    ? new Date(selectedReward.expiration_date).toLocaleDateString() 
                                    : 'N/A'}
                            </Text>

                            {/* Redeem Now Button - Styled Based on User's Points */}
                            <TouchableOpacity 
                                style={[
                                    styles.useButton, 
                                    hasEnoughPoints ? styles.redeemable : styles.locked
                                ]}
                                onPress={handleRedemption}
                                disabled={!hasEnoughPoints}
                                accessibilityLabel="Redeem Now"
                            >
                                <Text style={styles.useButtonText}>
                                    Redeem Now
                                </Text>
                            </TouchableOpacity>

                            {/* Delete Reward Button */}
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => {
                                    Alert.alert(
                                        "Delete Reward",
                                        "Are you sure you want to delete this reward?",
                                        [
                                            { text: "Cancel", style: "cancel" },
                                            { text: "Delete", onPress: () => {
                                                handleDeleteReward(selectedReward.id);
                                                setSelectedReward(null);
                                                setModalVisible(false);
                                            }, style: "destructive" },
                                        ],
                                        { cancelable: true }
                                    );
                                }}
                                accessibilityLabel="Delete Reward"
                            >
                                <Text style={styles.deleteButtonText}>
                                    Delete Reward
                                </Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <Text style={styles.noRewardText}>No reward selected</Text>
                    )}

                    {showMessage !== '' && (
                        <Text 
                            style={[
                                styles.message, 
                                showMessage.startsWith("Error") ? styles.errorMessage : styles.successMessage
                            ]}
                            accessibilityLiveRegion="polite"
                        >
                            {showMessage}
                        </Text>
                    )}

                    <TouchableOpacity 
                        style={styles.closeButton} 
                        onPress={closeRewardModal}
                        accessibilityLabel="Close Redemption Modal"
                    >
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>

                    {qrCodeUrl && (
                        <View style={styles.qrCodeContainer}>
                            <Text style={styles.qrCodeText}>Scan this QR Code:</Text>
                            <Image source={{ uri: qrCodeUrl }} style={styles.qrCode} />
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: 'rgba(0, 0, 0, 0.5)' 
    },
    modalContent: { 
        width: '85%', 
        padding: 20, 
        backgroundColor: '#fff', 
        borderRadius: 10, 
        alignItems: 'center' 
    },
    rewardDetail: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        marginBottom: 10, 
        color: '#02243D', 
        textAlign: 'center' 
    },
    expiration: { 
        fontSize: 16, 
        color: '#212529', 
        marginBottom: 20, 
        textAlign: 'center' 
    },
    useButton: { 
        paddingVertical: 12, 
        paddingHorizontal: 25, 
        borderRadius: 8, 
        marginBottom: 10,
        width: '80%',
        alignItems: 'center',
    },
    redeemable: { 
        backgroundColor: '#0BCF07' 
    },
    locked: { 
        backgroundColor: '#A9A9A9' 
    },
    useButtonText: { 
        color: '#fff', 
        fontSize: 16, 
        fontWeight: 'bold' 
    },
    deleteButton: { 
        backgroundColor: '#FF3B30', 
        paddingVertical: 10, 
        paddingHorizontal: 20, 
        borderRadius: 8, 
        marginBottom: 10,
        width: '80%',
        alignItems: 'center',
    },
    deleteButtonText: { 
        color: '#fff', 
        fontSize: 16, 
        fontWeight: 'bold' 
    },
    closeButton: { 
        backgroundColor: '#02243D', 
        paddingVertical: 10, 
        paddingHorizontal: 20, 
        borderRadius: 8, 
        marginTop: 10,
        width: '80%',
        alignItems: 'center',
    },
    closeButtonText: { 
        color: '#fff', 
        fontSize: 16, 
        fontWeight: 'bold' 
    },
    qrCodeContainer: { 
        alignItems: 'center', 
        marginTop: 20 
    },
    qrCodeText: { 
        fontSize: 16, 
        color: '#02243D', 
        marginBottom: 10 
    },
    qrCode: { 
        width: 150, 
        height: 150, 
        resizeMode: 'contain' 
    },
    noRewardText: { 
        fontSize: 16, 
        color: '#A41623', 
        textAlign: 'center', 
        marginBottom: 20 
    },
    message: { 
        fontSize: 14, 
        marginTop: 10, 
        textAlign: 'center' 
    },
    successMessage: { 
        color: 'green' 
    },
    errorMessage: { 
        color: 'red' 
    },
});

export default RewardSideModal;
