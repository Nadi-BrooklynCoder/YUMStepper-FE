import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDistance } from 'geolib';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);
    const [userId, setUserId] = useState(null);
    const [userLocation, setUserLocation] = useState({});
    const [directions, setDirections] = useState([]);
    const [userSteps, setUserSteps] = useState(0)
    const [selectedRestaurant, setSelectedRestaurant] = useState({})

    const login = async (token, userId) => {
        setUserToken(token);
        setIsLoading(false);
        setUserId(userId)
        // Store the token in AsyncStorage
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userId', userId.toString());
    };

    const logout = async () => {
        setUserToken(null);
        setIsLoading(false);
        // Remove the token from AsyncStorage
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userId');
    };

    const checkLoginStatus = async () => {
        try {
            let token = await AsyncStorage.getItem('userToken');
            if (token) {
                setUserToken(token);
            }
        } catch (e) {
            console.error('Failed to fetch the token from storage');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const calculateSteps = async () => {
        if (!userLocation.latitude || !selectedRestaurant?.latitude) {
          return; 
        }
      
        // Calculate the distance between current location and destination in meters
        const totalDistance = getDistance(
          { latitude: userLocation.latitude, longitude: userLocation.longitude },
          { latitude: selectedRestaurant.latitude, longitude: selectedRestaurant.longitude }
        );
      
        // Assuming average step length is 0.7 meters
        const averageStepLength = 0.7; // in meters
      
        // Calculate the number of steps
        const numberOfSteps = Math.round(totalDistance / averageStepLength);
      
        return numberOfSteps
    };

    return (
        <AuthContext.Provider value={{ login, logout, isLoading, userToken, userId, userLocation, setUserLocation, directions, setDirections, setUserSteps, userSteps, calculateSteps, setSelectedRestaurant, selectedRestaurant }}>
            {children}
        </AuthContext.Provider>
    );
};
