import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React, { useContext, useState } from 'react';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import { AuthContext } from '../../Context/AuthContext';

const RewardCard = ({ reward, setModalVisible }) => {
    const { user, setSelectedReward, isNearRestaurant } = useContext(AuthContext);
    const isRedeemable = user?.points_earned >= reward.points_required && isNearRestaurant;

    const [fontsLoaded] = useFonts({
        Itim: require('../../assets/fonts/Itim-Regular.ttf'),
        'Open-Sans': require('../../assets/fonts/OpenSans-Regular.ttf'),
    });

    if (!fontsLoaded) {
        return <AppLoading />;
    }

    const handleRedeem = () => {
        setSelectedReward(reward);
        setModalVisible(true);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.rewardButton, isRedeemable ? styles.redeemable : styles.locked]}
                disabled={!isRedeemable}
                onPress={handleRedeem}
            >
                <Text style={styles.rewardText}>{reward.details}</Text>
                <Text style={styles.pointsText}>Cost: {reward.points_required} Points</Text>
                <Text style={styles.expirationText}>Expires on: {new Date(reward.expiration_date).toLocaleDateString()}</Text>
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
    expirationText: {
        color: '#FFECD4',
        fontFamily: 'Open-Sans',
        marginTop: 5,
    },
});

export default RewardCard;
