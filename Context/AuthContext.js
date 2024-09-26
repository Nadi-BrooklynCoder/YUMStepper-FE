import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);
    const [userId, setUserId] = useState(null);

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

    return (
        <AuthContext.Provider value={{ login, logout, isLoading, userToken, userId }}>
            {children}
        </AuthContext.Provider>
    );
};
