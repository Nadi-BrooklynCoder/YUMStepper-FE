import { View, FlatList, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import React, { useContext, useEffect, useState, useMemo } from 'react';
import RewardCard from '../Components/Rewards/RewardCard';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import RewardSideModal from '../Components/Rewards/RewardSideModal';
import { AuthContext } from '../Context/AuthContext';

const Rewards = () => {
    const { userId, userToken } = useContext(AuthContext);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedReward, setSelectedReward] = useState(null);
    const [userRewards, setUserRewards] = useState([]);
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
                //combining both requests to minimize server hits
                const [userResponse, allResponse] = await Promise.all([
                    axios.get(`${API_BASE_URL}/users/${userId}/rewards`, {
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                    },
                }),
                axios.get(`${API_BASE_URL}/rewards`)
            ]);

            setUserRewards(userResponse.data);
            setAllRewards(allResponse.data);

            } catch (err) {
                console.error("Error fetching rewards:", err);
            }
        };
        fetchRewards();
    }, [userId, userToken]);

    if (isLoading) {
        return <Text style={styles.loadingText}>Loading rewards...</Text>;
    }

    //use useMemo to filter and sort rewards, preventing unnecessary computations
    const availableRewards = useMemo(() => {
        return allRewards.filter(reward => !userRewards.some(userReward => userReward.id === reward.id)).sort((a, b) => {
            const expirationA = new Date(a.expiration_date);
            const expirationB = new Date(b.expiration_date);
            const nameA = a.restaurant_name.toLowerCase()
            const nameB = b.restaurant_name.toLowerCase()

            return expirationA - expirationB || nameA.localeCompare(nameB);
        })
    }, [userRewards, allRewards])

    if (!fontsLoaded) {
        return <AppLoading />;
    }

    const handleRewardPress = (reward) => {
        setSelectedReward(reward);
        setModalVisible(true);
    };

    const closeModal = () => {
        setSelectedReward(null);
        setModalVisible(false);
    };

    const renderRewardCard = (item) => (
        <TouchableOpacity onPress={() => handleRewardPress(item)}>
            <RewardCard reward={item} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Rewards</Text>

            {userRewards.length > 0 ? (
                <FlatList
                    data={userRewards}
                    renderItem={({ item }) => renderRewardCard(item)}
                    keyExtractor={(item) => item.id.toString()}
                    style={styles.userRewardsList}
                />
            ) : (
                <Text style={styles.noRewardsText}>You have no rewards yet!</Text>
            )}

            <Text style={styles.divider}>Restaurant Rewards</Text>

            <FlatList
                data={userRewards}
                renderItem={({ item }) => renderRewardCard(item)}
                keyExtractor={(item) => item.id.toString()}
                initialNumToRender={5}
                maxToRenderPerBatch={10}
                style={styles.restaurantRewardsList}
            />

            <FlatList
                data={availableRewards}
                renderItem={({ item }) => renderRewardCard(item)}
                keyExtractor={(item) => item.id.toString()}
                initialNumToRender={5}
                maxToRenderPerBatch={10}
                style={styles.restaurantRewardsList}
            />

            

            {selectedReward && (
                <Modal
                    visible={modalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={closeModal}
                >
                    <RewardSideModal reward={selectedReward} setModalVisible={setModalVisible} />
                </Modal>
            )}
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
    divider: {
        fontSize: 20,
        fontFamily: 'Itim',
        color: '#A41623',
        textAlign: 'center',
        marginVertical: 20,
        fontWeight: 'bold',
    },
    userRewardsList: {
        marginBottom: 20,
    },
    restaurantRewardsList: {
        marginTop: 20,
    },
    loadingText: {
        textAlign: 'center',
        color: '#A41623',
        fontSize: 18,
        marginTop: 20,
    }
    
});

export default Rewards;
