import { View, FlatList, Text, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native'; // Ensure 'View' is imported
import React, { useEffect, useState } from 'react';
import RewardCard from '../Components/Rewards/RewardCard';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import axios from 'axios';
import { API_BASE_URL } from '@env';

import RewardSideModal from '../Components/Rewards/RewardSideModal';


const Rewards = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [rewards, setRewards] = useState([]);
    
    const [fontsLoaded] = useFonts({
        Itim: require('../assets/fonts/Itim-Regular.ttf'),
        'Open-Sans': require('../assets/fonts/OpenSans-Regular.ttf'),
    });

    useEffect(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/rewards`)
            setRewards(response.data);  
        } catch (err) {
            console.error(err);
        }
    },[])
    
    if (!fontsLoaded) {
        return <AppLoading />;
    }
   
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Rewards</Text>
            <FlatList
                data={rewards}
                renderItem={({ item }) => <RewardCard reward={item} setModalVisible={setModalVisible} modalVisible={modalVisible}/>}
                keyExtractor={(item) => item.id.toString()}
            />

            {modalVisible && ( 
               <RewardSideModal setModalVisible={setModalVisible}/>
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

export default Rewards;
