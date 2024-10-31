// RewardCard.js

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useContext } from 'react';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import { AuthContext } from '../../Context/AuthContext';

const RewardCard = ({ reward, openRewardModal }) => {
    const { userPoints, isNearRestaurant } = useContext(AuthContext);
    const isRedeemable = userPoints >= reward.points_required && isNearRestaurant;

    const [fontsLoaded] = useFonts({
        Itim: require('../../assets/fonts/Itim-Regular.ttf'),
        'Open-Sans': require('../../assets/fonts/OpenSans-Regular.ttf'),
    });

    if (!fontsLoaded) {
        return <AppLoading />;
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.rewardButton, isRedeemable ? styles.redeemable : styles.locked]}
                disabled={!isRedeemable}
                onPress={openRewardModal}
            >
                <Text style={styles.rewardTitle}>{reward.details || 'No details available'}</Text>
                <Text style={styles.rewardDescription}>
                    Expires: {reward.expiration_date ? new Date(reward.expiration_date).toLocaleDateString() : 'N/A'}
                </Text>
                <Text style={styles.points}>Points Required: {reward.points_required || 'N/A'}</Text>
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
        backgroundColor: '#F85E00', // Orange for redeemable
    },
    locked: {
        backgroundColor: '#A9A9A9', // Gray for locked
    },
    rewardTitle: {
        color: '#fff',
        fontWeight: 'bold',
        fontFamily: 'Itim',
        fontSize: 18,
    },
    rewardDescription: {
        color: '#FFECD4',
        fontFamily: 'Open-Sans',
        marginTop: 5,
    },
    points: {
        color: '#FFECD4',
        fontFamily: 'Open-Sans',
        marginTop: 5,
    },
});

export default RewardCard;
