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
import PropTypes from 'prop-types';
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
    } = useContext(AuthContext);

    // Determine if the user has enough points to redeem the selected reward
    const hasEnoughPoints = selectedReward 
        ? (Number(user.points_earned) >= (Number(selectedReward.points_required) || 0))
        : false;

    // Function to close the modal and reset relevant states
    const closeRewardModal = () => {
        setSelectedReward(null);
        setQrCodeUrl(null);
        setShowMessage("");
        setModalVisible(false);
    };

    // Log selectedReward for debugging purposes
    useEffect(() => {
        if (selectedReward && selectedReward.id) {
            console.log("Confirmed selectedReward in RewardSideModal:", selectedReward);
        }
    }, [selectedReward]);

    // Log qrCodeUrl for debugging purposes
    useEffect(() => {
        if (qrCodeUrl) {
            console.log("QR Code URL updated in RewardSideModal:", qrCodeUrl);
        }
    }, [qrCodeUrl]);

    // Handle redemption when a reward is selected
    useEffect(() => {
        if (selectedReward?.id && hasEnoughPoints) {
            handleRedemption();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedReward, hasEnoughPoints]);

    return (
        <Modal 
            animationType="slide" 
            transparent={true} 
            visible={selectedReward !== null}
            onRequestClose={closeRewardModal}
            accessible={true}
            accessibilityViewIsModal={true}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    {selectedReward ? (
                        <>
                            {/* Reward Details */}
                            <Text style={styles.rewardDetail}>
                                {selectedReward.details || 'Reward Details'}
                            </Text>

                            {/* Expiration Date */}
                            <Text style={styles.expiration}>
                                Expires on: {selectedReward.expiration_date 
                                    ? new Date(selectedReward.expiration_date).toLocaleDateString() 
                                    : 'N/A'}
                            </Text>

                            {/* Redeem Button */}
                            <TouchableOpacity 
                                style={[
                                    styles.useButton, 
                                    hasEnoughPoints ? styles.redeemable : styles.locked
                                ]}
                                onPress={() => {
                                    if (hasEnoughPoints) {
                                        handleRedemption();
                                    } else {
                                        Alert.alert(
                                            "Insufficient Points",
                                            "You do not have enough points to redeem this reward.",
                                        );
                                    }
                                }}
                                disabled={!hasEnoughPoints}
                                accessibilityLabel="Redeem Now"
                                accessibilityState={{ disabled: !hasEnoughPoints }}
                            >
                                <Text style={styles.useButtonText}>
                                    {hasEnoughPoints ? "Redeem Now" : "Not Enough Points"}
                                </Text>
                            </TouchableOpacity>

                            {/* Delete Button */}
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => {
                                    Alert.alert(
                                        "Delete Reward",
                                        "Are you sure you want to delete this reward?",
                                        [
                                            { text: "Cancel", style: "cancel" },
                                            { 
                                                text: "Delete", 
                                                onPress: () => {
                                                    handleDeleteReward(selectedReward.id);
                                                    setSelectedReward(null);
                                                    setModalVisible(false);
                                                }, 
                                                style: "destructive" 
                                            },
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

                    {/* Feedback Message */}
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

                    {/* Close Button */}
                    <TouchableOpacity 
                        style={styles.closeButton} 
                        onPress={closeRewardModal}
                        accessibilityLabel="Close Redemption Modal"
                    >
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>

                    {/* QR Code Display */}
                    {qrCodeUrl && (
                        <View style={styles.qrCodeContainer}>
                            <Text style={styles.qrCodeText}>Scan this QR Code:</Text>
                            <Image 
                                source={{ uri: qrCodeUrl }} 
                                style={styles.qrCode} 
                                accessibilityLabel="QR Code for Reward Redemption"
                            />
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

// Define PropTypes for type-checking and better maintainability
RewardSideModal.propTypes = {
    setModalVisible: PropTypes.func.isRequired,
    handleDeleteReward: PropTypes.func.isRequired,
};

// Define defaultProps if necessary (optional)
RewardSideModal.defaultProps = {
    // setModalVisible and handleDeleteReward are required, so no defaults are set
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
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
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

export default React.memo(RewardSideModal);
