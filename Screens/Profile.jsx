import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Pressable, Dimensions, StyleSheet } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../Context/AuthContext';
<<<<<<< HEAD
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const Tab = createMaterialTopTabNavigator();

const ProfileComponent = () => {
    // This will be the first tab component
    return (
        <View>
            <Text>This is the first component content (e.g., Profile details)</Text>
        </View>
    );
};

const StepsComponent = ({ steps }) => {
    // This will be the second tab component that displays steps
    return (
        <View>
            <Text>Steps: </Text>
            {steps.map((step, index) => (
                <Text key={index}>{step.step_count}</Text>
            ))}
        </View>
    );
};
=======
import StepsContainer from '../Components/Profile/StepsContainer';
import CheckinContainer from '../Components/Profile/CheckinContainer';
import axios from 'axios';
>>>>>>> KhyBranch

const Profile = () => {
    const { userToken, userId, logout } = useContext(AuthContext);
    const [user, setUser] = useState({});
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'steps', title: 'Steps' },
        { key: 'points', title: 'Points' },
    ]);

    const navigation = useNavigation();

<<<<<<< HEAD
    // Fetch user profile data and steps
=======
>>>>>>> KhyBranch
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`https://demo-day-be.onrender.com/users/${userId}`, {
                headers: { Authorization: `${userToken}` },
                });
                setUser(response.data);
            } catch (err) {
<<<<<<< HEAD
                if (err.response) {
                    console.error('Error response:', err.response.data);
                    console.error('Status:', err.response.status);
                } else if (err.request) {
                    console.error('No response received:', err.request);
                } else {
                    console.error('Error', err.message);
                }
            }
        };

        const fetchSteps = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/users/${userId}/steps`, {
                    headers: { 'Authorization': `${userToken}` } 
                });
                setSteps(response.data);
            } catch (err) {
=======
>>>>>>> KhyBranch
                if (err.response) {
                    console.error("Error response:", err.response.data);
                    console.error("Status:", err.response.status);
                } else if (err.request) {
                    console.error("No response received:", err.request);
                } else {
                    console.error("Error", err.message);
                }
            }
        };

        fetchUser();
<<<<<<< HEAD
        fetchSteps();
=======
>>>>>>> KhyBranch
    }, [userId, userToken]);

    const handleLogout = () => {
        logout();
        navigation.navigate('Home');
    };

    if (!user) {
        return <Text>Loading...</Text>;
    }

    const renderScene = SceneMap({
        steps: () => <StepsContainer displayType="steps" />,
        points: () => <StepsContainer displayType="points" />,
    });

    const renderTabBar = (props) => (
        <TabBar
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

<<<<<<< HEAD
            {/* Tab Navigator for swipeable components */}
            <Tab.Navigator
                screenOptions={{
                    tabBarIndicatorStyle: { backgroundColor: 'blue' }, // Custom styling
                    tabBarLabelStyle: { color: 'black' },
                    tabBarStyle: { backgroundColor: 'white' },
                }}
            >
                <Tab.Screen name="ProfileComponent" component={ProfileComponent} />
                <Tab.Screen name="StepsComponent">
                    {() => <StepsComponent steps={steps} />}
                </Tab.Screen>
            </Tab.Navigator>

            <Pressable onPress={() => navigation.navigate('Map', { userId: userId, token: userToken })}>
                <Text style={{ color: 'white', fontWeight: 'bold', padding: 20, backgroundColor: 'blue'}}>Go to Map</Text>
=======
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                renderTabBar={renderTabBar}
                onIndexChange={setIndex}
                initialLayout={{ width: Dimensions.get('window').width }}
            />

            <CheckinContainer/>

            <Pressable onPress={() => navigation.navigate('Map', { userId, token: userToken })}>
                <Text style={{ color: 'white', fontWeight: 'bold', padding: 20, backgroundColor: 'blue' }}>
                Go to Map
                </Text>
>>>>>>> KhyBranch
            </Pressable>

            <Pressable onPress={handleLogout} style={{ marginTop: 20 }}>
                <Text style={{ color: 'red', fontWeight: 'bold' }}>Logout</Text>
            </Pressable>
        </View>
    );
};

export default Profile;
