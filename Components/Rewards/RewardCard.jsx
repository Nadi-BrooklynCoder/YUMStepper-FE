import { View, Text, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native';
import React, { useState } from 'react';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';

const RewardCard = ({ reward }) => {
    const [modalVisible, setModalVisible] = useState(false);

    const [fontsLoaded] = useFonts({
        Itim: require('../../assets/fonts/Itim-Regular.ttf'),
        'Open-Sans': require('../../assets/fonts/OpenSans-Regular.ttf'),
    });

    if (!fontsLoaded) {
        return <AppLoading />;
    }

    const handleRedeem = () => {
        setModalVisible(true);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.rewardButton, reward.isRedeemable ? styles.redeemable : styles.locked]}
                disabled={!reward.isRedeemable}
                onPress={handleRedeem}
            >
                <Text style={styles.rewardText}>{reward.details}</Text>
                <Text style={styles.pointsText}>Cost: {reward.points} Points</Text>
            </TouchableOpacity>

            {reward.isRedeemable && (
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.rewardDetail}>{reward.details}</Text>
                            <Image source={{ uri: reward.qr_code }} style={styles.qrCode} />
                            <Text style={styles.expiration}>Expires on: {reward.expiration_date}</Text>

                            <TouchableOpacity
                                style={styles.useButton}
                                onPress={() => {
                                    setModalVisible(false);
                                }}
                            >
                                <Text style={styles.useButtonText}>Use Now</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.saveButtonText}>Save for Later</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 15,
    },
    rewardButton: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    redeemable: {
        backgroundColor: '#F85E00', 
    },
    locked: {
        backgroundColor: '#A9A9A9', 
    },
    rewardText: {
        color: '#fff',
        fontWeight: 'bold',
        fontFamily: 'Itim',
        fontSize: 18,
    },
    pointsText: {
        color: '#FFECD4',
        fontFamily: 'Open-Sans',
        marginTop: 5,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        alignItems: 'center',
    },
    rewardDetail: {
        fontSize: 18,
        fontFamily: 'Itim',
        marginBottom: 10,
    },
    qrCode: {
        width: 150,
        height: 150,
        marginBottom: 10,
    },
    expiration: {
        marginBottom: 20,
        fontFamily: 'Open-Sans',
    },
    useButton: {
        backgroundColor: '#A41623',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginBottom: 10,
    },
    useButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontFamily: 'Open-Sans',
    },
    saveButton: {
        backgroundColor: '#FFA500',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontFamily: 'Open-Sans',
    },
});

export default RewardCard;
