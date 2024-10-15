import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDistance } from 'geolib';
import polyline from '@mapbox/polyline';
import { GOOGLE_API_KEY, API_BASE_URL } from '@env';
import axios from "axios";
import * as Location from 'expo-location';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);
    const [userId, setUserId] = useState(null);
    const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });
    const [directions, setDirections] = useState([]);
    const [userSteps, setUserSteps] = useState(0);
    const [directionSteps, setDirectionSteps] = useState(0);
    const [selectedRestaurant, setSelectedRestaurant] = useState({});
    const [restaurants, setRestaurants] = useState([]);
    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const [isNearRestaurant, setIsNearRestaurant] = useState(false);

    useEffect(() => {
        if (userId === null && userToken) {
            console.error("User ID is null. Logging out user.");
            logout();
        }
    }, [userId]);

    useEffect(() => {
        let locationSubscription = null;
    
        const watchUserLocation = async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    console.error('Permission to access location was denied');
                    return;
                }

                locationSubscription = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.Balanced,
                        timeInterval: 2000,
                        distanceInterval: 5,
                    },
                    (location) => {
                        const { latitude, longitude } = location.coords;

                        // Update userLocation in the context state
                        setUserLocation({ latitude, longitude });
                    }
                );
            } catch (error) {
                console.error('Error watching user location:', error);
            }
        };

        watchUserLocation();

        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        }; // Cleanup function
    }, []);

    const fetchNearByPlaces = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/googlePlaces/nearby`);
            if (res.data.length > 0) {
                setNearbyPlaces(res.data);
            } else {
                console.log("No restaurants found.");
            }
        } catch (err) {
            console.error("Error fetching restaurants:", err);
        }
    };

    const getDirectionsFromGoogleMaps = async () => {
        if (!userLocation.latitude || !userLocation.longitude) {
            console.error("User location is not available");
            return;
        }

        try {
            const response = await axios.get(
                `${API_BASE_URL}/googlePlaces/directions?originLat=${userLocation.latitude}&originLng=${userLocation.longitude}&destLat=${selectedRestaurant.latitude}&destLng=${selectedRestaurant.longitude}`
            );

            if (response?.data?.routes.length > 0) {
                const points = response.data.routes[0].overview_polyline.points;
                const decodedPoints = polyline.decode(points).map(([latitude, longitude]) => ({
                    latitude,
                    longitude,
                }));
                setDirections(decodedPoints);
            } else {
                console.error('No routes found');
            }
        } catch (error) {
            console.error('Error fetching directions', error);
        }
    };

    const login = async (token, userId, navigation) => {
        if (!userId) {
            console.error("Invalid userId during login");
            return;
        }

        try {
            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userId', userId.toString());
            setUserToken(token);
            setUserId(userId);
            if (navigation) {
                navigation.navigate('Profile');
            }
        } catch (e) {
            console.error('Failed to save userId to storage:', e);
        }
    };

    const logout = async (navigation) => {
        try {
            setUserToken(null);
            setUserId(null);
            setUserLocation({ latitude: null, longitude: null });
            setSelectedRestaurant({});
            setDirections([]);
            setIsLoading(false);
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userId');

            navigation.navigate('Home');
        } catch (e) {
            console.error('Failed to clear storage during logout:', e);
        }
    };

    const checkLoginStatus = async () => {
        try {
            let token = await AsyncStorage.getItem('userToken');
            let storedUserId = await AsyncStorage.getItem('userId');
    
            if (token && storedUserId) {
                setUserToken(token);
                setUserId(parseInt(storedUserId));
            }
        } catch (e) {
            console.error('Failed to fetch the token or userId from storage');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkLoginStatus();
        fetchNearByPlaces();
    }, []);

    useEffect(() => {
        if (userLocation.latitude && userLocation.longitude) {
            fetchNearByPlaces();
        }
    }, [userLocation]);

    const calculateSteps = async () => {
        if (!userLocation.latitude || !selectedRestaurant?.latitude) {
            return;
        }

        const totalDistance = getDistance(
            { latitude: userLocation.latitude, longitude: userLocation.longitude },
            { latitude: selectedRestaurant.latitude, longitude: selectedRestaurant.longitude }
        );

        const averageStepLength = 0.7; // in meters
        const numberOfSteps = Math.round(totalDistance / averageStepLength);
        setDirectionSteps(numberOfSteps);
    };

    const stepsToPoints = (steps) => {
        if (steps <= 1000) {
            return Math.floor(steps / 100);
        } else if (steps <= 5000) {
            return Math.floor(steps / 80);
        } else {
            return Math.floor(steps / 50);
        }
    };

    useEffect(() => {
        const checkProximity = () => {
            if (
                userLocation.latitude && userLocation.longitude &&
                selectedRestaurant.latitude && selectedRestaurant.longitude
            ) {
                const distance = getDistance(
                    { latitude: userLocation.latitude, longitude: userLocation.longitude },
                    { latitude: selectedRestaurant.latitude, longitude: selectedRestaurant.longitude }
                );

                const thresholdDistance = 50; // in meters

                setIsNearRestaurant(distance <= thresholdDistance);
            } else {
                setIsNearRestaurant(false);
            }
        };

        checkProximity();
    }, [userLocation, selectedRestaurant]);

    return (
        <AuthContext.Provider value={{
            login,
            logout,
            isLoading,
            userToken,
            userId,
            userLocation,
            setUserLocation,
            directions,
            setDirections,
            setUserSteps,
            userSteps,
            calculateSteps,
            setSelectedRestaurant,
            selectedRestaurant,
            getDirectionsFromGoogleMaps,
            directionSteps,
            restaurants,
            fetchNearByPlaces,
            isNearRestaurant,
            stepsToPoints,
            nearbyPlaces
        }}>
            {children}
        </AuthContext.Provider>
    );
};
