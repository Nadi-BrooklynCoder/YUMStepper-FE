import { View, FlatList, Text, StyleSheet } from 'react-native'; // Ensure 'View' is imported
import React, { useState } from 'react';
import RewardCard from '../Components/Rewards/RewardCard';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';

const Rewards = () => {
    // Dummy reward data
    const [rewards] = useState([
        {
            id: 1,
            details: '10% off at Joe\'s Pizza',
            qr_code: 'https://via.placeholder.com/150',
            expiration_date: '2024-12-31',
            isRedeemable: true,  
        },
        {
            id: 2,
            details: 'Free dessert at Cake Shop',
            qr_code: 'https://via.placeholder.com/150',
            expiration_date: '2024-11-15',
            isRedeemable: false,  
        },
    ]);

    
    const [fontsLoaded] = useFonts({
        Itim: require('../assets/fonts/Itim-Regular.ttf'),
        'Open-Sans': require('../assets/fonts/OpenSans-Regular.ttf'),
    });

    
    if (!fontsLoaded) {
        return <AppLoading />;
    }

   
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Rewards</Text>
            <FlatList
                data={rewards}
                renderItem={({ item }) => <RewardCard reward={item} />}
                keyExtractor={(item) => item.id.toString()}
            />
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
