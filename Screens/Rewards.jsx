import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, Alert } from 'react-native';
import RewardItem from '../Components/Rewards/RewardItem';
import RewardDetails from '../Components/Rewards/RewardDetails';
import { AuthContext } from '../Context/AuthContext';

const Rewards = () => {
    const { userRewards, resetMapState, redeemReward, deleteReward } = useContext(AuthContext);
    const [selectedReward, setSelectedReward] = useState(null);
    const [isRewardDetailsVisible, setRewardDetailsVisible] = useState(false);

    // Group rewards by restaurant name for display
    const groupedRewards = userRewards.reduce((acc, reward) => {
        const { restaurant_name: restaurantName } = reward;
        if (!acc[restaurantName]) {
            acc[restaurantName] = [];
        }
        acc[restaurantName].push(reward);
        return acc;
    }, {});

    const openRewardDetails = (reward) => {
        setSelectedReward(reward);
        setRewardDetailsVisible(true);
    };

    const closeRewardDetails = () => {
        setSelectedReward(null);
        setRewardDetailsVisible(false);
        resetMapState();
    };

    // Handle Reward Redemption
    const handleRedeemReward = (reward) => {
        Alert.alert(
            "Redeem Reward",
            "Are you sure you want to redeem this reward?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Redeem", onPress: () => redeemReward(reward.id) },
            ]
        );
    };

    // Handle Reward Deletion
    const handleDeleteReward = (rewardId) => {
        Alert.alert(
            "Delete Reward",
            "Are you sure you want to delete this reward?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", onPress: () => deleteReward(rewardId) },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Saved Rewards</Text>
            <ScrollView>
                {Object.keys(groupedRewards).map((restaurantName) => (
                    <View key={restaurantName} style={styles.restaurantSection}>
                        <Text style={styles.restaurantTitle}>{restaurantName}</Text>
                        {groupedRewards[restaurantName].map((reward) => (
                            <RewardItem
                                key={reward.id}
                                reward={reward}
                                showSaveButton={false}
                                handleRedeem={handleRedeemReward}
                                handleDelete={handleDeleteReward}
                            />
                        ))}
                    </View>
                ))}
            </ScrollView>

            <Modal
                visible={isRewardDetailsVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={closeRewardDetails}
            >
                {selectedReward && (
                    <RewardDetails
                        reward={selectedReward}
                        onClose={closeRewardDetails}
                    />
                )}
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFECD4',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontFamily: 'Itim',
        color: '#A41623',
        textAlign: 'center',
        marginBottom: 20,
    },
    restaurantSection: {
        marginBottom: 20,
    },
    restaurantTitle: {
        fontSize: 18,
        fontFamily: 'Open-Sans',
        color: '#A41623',
        fontWeight: 'bold',
        marginVertical: 10,
    }
});

export default Rewards;
