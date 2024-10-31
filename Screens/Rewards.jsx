// Rewards.js

import React, { useContext, useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal } from 'react-native';
import RewardCard from '../Components/Rewards/RewardCard';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import RewardSideModal from '../Components/Rewards/RewardSideModal';
import { AuthContext } from '../Context/AuthContext';

const Rewards = () => {
    const { userId, userToken, setUserRewards, userRewards, selectReward, selectedReward, fetchUserPoints, userPoints } = useContext(AuthContext);
    const [modalVisible, setModalVisible] = useState(false);
    const [allRewards, setAllRewards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [fontsLoaded] = useFonts({
        Itim: require('../assets/fonts/Itim-Regular.ttf'),
        'Open-Sans': require('../assets/fonts/OpenSans-Regular.ttf'),
    });

    useEffect(() => {
        if (!userId || !userToken) return;

        const fetchRewards = async () => {
            try {
                const [userResponse, allResponse] = await Promise.all([
                    axios.get(`${API_BASE_URL}/users/${userId}/userRewards`, {
                        headers: {
                            Authorization: `Bearer ${userToken}`,
                        },
                    }),
                    axios.get(`${API_BASE_URL}/rewards`),
                ]);

                setUserRewards(userResponse.data);
                setAllRewards(allResponse.data);
                setIsLoading(false);

                // **Fetch User Points After Fetching Rewards**
                await fetchUserPoints();
            } catch (err) {
                console.error("Error fetching rewards:", err);
                setIsLoading(false);
            }
        };
        fetchRewards();
    }, [userId, userToken, setUserRewards, fetchUserPoints]);

    const organizeRewardsByRestaurant = (userRewards) => {
        return userRewards.reduce((grouped, reward) => {
            const restaurantName = reward.restaurant_name || "Unknown Restaurant";
            if (!grouped[restaurantName]) {
                grouped[restaurantName] = [];
            }
            grouped[restaurantName].push(reward);
            return grouped;
        }, {});
    };

    const groupedRewards = useMemo(() => organizeRewardsByRestaurant(userRewards), [userRewards]);

    const handleDeleteReward = async (rewardId) => {
        try {
            await axios.delete(
                `${API_BASE_URL}/users/${userId}/userRewards/${rewardId}`,  // Updated path
                {
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                    },
                }
            );
            
            setUserRewards(userRewards.filter(reward => reward.id !== rewardId));

            // **Update User Points After Deletion**
            await fetchUserPoints();
        } catch (error) {
            console.error("Error deleting reward:", error);
        }
    };

    const openRewardModal = (reward) => {
        selectReward(reward);
        setModalVisible(true);
    };

    const closeModal = () => {
        selectReward(null);
        setModalVisible(false);
    };

    const renderGroupedRewards = () => {
        return Object.entries(groupedRewards).map(([restaurantName, rewards]) => (
            <View key={restaurantName} style={styles.restaurantSection}>
                <Text style={styles.restaurantTitle}>{restaurantName}</Text>
                {rewards.map((reward) => (
                    <RewardCard 
                        key={reward.id} 
                        reward={reward} 
                        openRewardModal={() => openRewardModal(reward)}
                    />
                ))}
            </View>
        ));
    };

    if (!fontsLoaded) {
        return <AppLoading />;
    }

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading rewards...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Saved Rewards</Text>
            {userRewards.length > 0 ? (
                <ScrollView>
                    {renderGroupedRewards()}
                </ScrollView>
            ) : (
                <Text style={styles.noRewardsText}>You have no saved rewards yet!</Text>
            )}

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={closeModal}
            >
                {selectedReward && selectedReward.id && (
                    <RewardSideModal setModalVisible={setModalVisible} handleDeleteReward={handleDeleteReward} />
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
    noRewardsText: {
        textAlign: 'center',
        color: '#A41623',
        marginBottom: 20,
    },
    restaurantSection: {
        marginBottom: 20,
    },
    restaurantTitle: {
        fontSize: 14,
        fontFamily: 'Open-Sans',
        color: '#A41623',
        fontWeight: 'bold',
        marginVertical: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 18,
        color: '#A41623',
    }
});

export default Rewards;
