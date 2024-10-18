import { View, FlatList, Text, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import RewardCard from '../Components/Rewards/RewardCard';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import axios from 'axios';
import { API_BASE_URL } from '@env';

import RewardSideModal from '../Components/Rewards/RewardSideModal';

const Rewards = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedReward, setSelectedReward] = useState(null);
    const [rewards, setRewards] = useState([]);

    const [fontsLoaded] = useFonts({
        Itim: require('../assets/fonts/Itim-Regular.ttf'),
        'Open-Sans': require('../assets/fonts/OpenSans-Regular.ttf'),
    });

    useEffect(() => {
        const fetchRewards = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/rewards`);
                setRewards(response.data);
            } catch (err) {
                console.error("Error fetching rewards:", err);
            }
        };
        fetchRewards();
    
        // Return undefined or nothing; if you return a cleanup function, make sure it is a proper function.
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

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Rewards</Text>
            <FlatList
                data={rewards}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleRewardPress(item)}>
                        <RewardCard reward={item} />
                    </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id.toString()}
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
});

export default Rewards;
