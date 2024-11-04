import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal } from 'react-native';
import RewardItem from '../Components/Rewards/RewardItem';
import RewardDetails from '../Components/Rewards/RewardDetails';
import { AuthContext } from '../Context/AuthContext';

const Rewards = () => {
    const { userRewards, resetMapState } = useContext(AuthContext);
    const [selectedReward, setSelectedReward] = useState(null);
    const [isRewardDetailsVisible, setRewardDetailsVisible] = useState(false);

    // Group rewards by restaurant name for display
    const groupedRewards = userRewards.reduce((acc, reward) => {
        const { restaurant_name: restaurantName } = reward;
        if (!acc[restaurantName]) {
            acc[restaurantName] = [];  // Initialize array for each restaurant
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
        resetMapState(); // Ensure map state is reset after closing reward details
    };

    useEffect(() => {
        if (selectedReward) {
            console.log("Selected reward in component updated:", selectedReward);
            // Execute any dependent logic here
        }
    }, [selectedReward]);
    

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
                                inSavedRewards={true}
                                openRewardDetails={openRewardDetails}
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
