import { View, FlatList, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import RewardCard from '../Components/Rewards/RewardCard';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import RewardSideModal from '../Components/Rewards/RewardSideModal';
import { AuthContext } from '../Context/AuthContext';

const Rewards = () => {
    const { userId } = useContext(AuthContext);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedReward, setSelectedReward] = useState(null);
    const [userRewards, setUserRewards] = useState([]);
    const [allRewards, setAllRewards] = useState([]);

    const [fontsLoaded] = useFonts({
        Itim: require('../assets/fonts/Itim-Regular.ttf'),
        'Open-Sans': require('../assets/fonts/OpenSans-Regular.ttf'),
    });

    useEffect(() => {
        const fetchRewards = async () => {
            try {
                // Fetch user rewards
                const userResponse = await axios.get(`${API_BASE_URL}/users/${userId}/rewards`);
                setUserRewards(userResponse.data);

                const allResponse = await axios.get(`${API_BASE_URL}/rewards`);

                const filteredRewards = allResponse.data.filter(reward => !userResponse.data.some(userReward => userReward.id === reward.id));

                setAllRewards(filteredRewards);
            } catch (err) {
                console.error("Error fetching rewards:", err);
            }
        };
        fetchRewards();
    }, []);

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

            {/* User Rewards Section */}
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

            {/* Divider for Restaurant Rewards */}
            <Text style={styles.divider}>Restaurant Rewards</Text>

            {/* Restaurant Rewards Section */}
            <FlatList
                data={allRewards}
                renderItem={({ item }) => renderRewardCard(item)}
                keyExtractor={(item) => item.id.toString()}
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
});

export default Rewards;
