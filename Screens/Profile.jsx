import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Pressable, Dimensions, StyleSheet } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../Context/AuthContext';
import StepsContainer from '../Components/Profile/StepsContainer';
import CheckinContainer from '../Components/Profile/CheckinContainer';
import axios from 'axios';
import { API_BASE_URL } from '@env';

const Profile = () => {
    const { userToken, userId, logout, user } = useContext(AuthContext);
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'steps', title: 'Steps' },
        { key: 'points', title: 'Points' },
    ]);

    const navigation = useNavigation();

    const handleLogout = async () => {
        await logout(navigation);
    };

    if (!userId || !userToken) {
        return (
            <View style={styles.container}>
                <Text>You are not logged in.</Text>
            </View>
        );
    }

    if (!user) {
        return <Text>Loading...</Text>;
    }

    const renderScene = SceneMap({
        steps: () => <StepsContainer displayType="steps" />,
        points: () => <StepsContainer displayType="points" />,
    });

    const renderTabBar = (props) => (
        <TabBar
            key={props.navigationState.routes[props.navigationState.index].key}
            {...props}
            indicatorStyle={{ backgroundColor: 'blue' }}
            style={{ backgroundColor: 'white' }}
            labelStyle={{ color: 'black' }}
        />
    );

    return (
        <View style={{ flex: 1 }}>
            <Text>Profile of: {user.username}</Text>
            <Text>Email: {user.email}</Text>

            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                renderTabBar={renderTabBar}
                onIndexChange={setIndex}
                initialLayout={{ width: Dimensions.get('window').width }}
            />

            <CheckinContainer />

            <Pressable onPress={() => navigation.navigate('Map', { userId, token: userToken })}>
                <Text style={{ color: 'white', fontWeight: 'bold', padding: 20, backgroundColor: 'blue' }}>
                    Go to Map
                </Text>
            </Pressable>

            <Pressable onPress={handleLogout} style={{ marginTop: 20 }}>
                <Text style={{ color: 'red', fontWeight: 'bold' }}>Logout</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: 'antiquewhite',
        flex: 1,
        justifyContent: 'center',
    },
});

export default Profile;
