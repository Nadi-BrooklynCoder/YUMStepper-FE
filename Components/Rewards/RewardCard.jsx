import { View, Text, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native';
import React, { useContext, useState } from 'react';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import { API_BASE_URL } from '@env';
import axios from 'axios';
import { AuthContext } from '../../Context/AuthContext';

const RewardCard = ({ reward, setModalVisible }) => {
    const isRedeemable = user?.points_earned >= reward.points_required
    const { isNearRestaurant, user, setSelectedReward } = useContext(AuthContext)
    const [fontsLoaded] = useFonts({
        Itim: require('../../assets/fonts/Itim-Regular.ttf'),
        'Open-Sans': require('../../assets/fonts/OpenSans-Regular.ttf'),
    });

    if (!fontsLoaded) {
        return <AppLoading />;
    }

    const handleRedeem = () => {
        setSelectedReward(reward)
        setModalVisible(true);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.rewardButton, isRedeemable ? styles.redeemable : styles.locked]}
                disabled={!isRedeemable && !isNearRestaurant}
                onPress={handleRedeem}
            >
                <Text style={styles.rewardText}>{reward.details}</Text>
                <Text style={styles.pointsText}>Cost: {reward.points} Points</Text>
            </TouchableOpacity>
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
