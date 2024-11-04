import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useContext, useEffect } from 'react';
import { useFonts } from 'expo-font';
import { AuthContext } from '../../Context/AuthContext';

const RewardCard = ({ reward, openRewardModal, inSavedRewards }) => {
    const { userPoints, isNearRestaurant } = useContext(AuthContext);

   // Check if user has enough points or if points are not required
const hasEnoughPoints = reward.points_required === 0 || userPoints >= reward.points_required;

// Check if reward can be redeemed based on location or saved status
const locationOrSavedRequirement = inSavedRewards || isNearRestaurant;

// Final redeemable check
const isRedeemable = hasEnoughPoints && locationOrSavedRequirement;

    const [fontsLoaded] = useFonts({
        Itim: require('../../assets/fonts/Itim-Regular.ttf'),
        'Open-Sans': require('../../assets/fonts/OpenSans-Regular.ttf'),
    });

    useEffect(() => {
        // Debug logs to check the values
        console.log("User Points:", userPoints);
        console.log("Points Required:", reward.points_required);
        console.log("Is Near Restaurant:", isNearRestaurant);
        console.log("In Saved Rewards:", inSavedRewards);
        console.log("Is Redeemable:", isRedeemable);
    }, [userPoints, reward.points_required, isNearRestaurant, inSavedRewards, isRedeemable]);

    if (!fontsLoaded) {
        return <ActivityIndicator size="small" color="#0000ff" />;
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[
                    styles.rewardButton,
                    isRedeemable ? styles.redeemable : styles.locked,
                ]}
                disabled={!isRedeemable}
                onPress={openRewardModal}
            >
                <Text style={styles.rewardTitle}>{reward.details || 'No details available'}</Text>
                <Text style={styles.rewardDescription}>
                    Expires: {reward.expiration_date ? new Date(reward.expiration_date).toLocaleDateString() : 'N/A'}
                </Text>
                <Text style={styles.points}>Points Required: {reward.points_required !== undefined ? reward.points_required : 'N/A'}</Text>
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
