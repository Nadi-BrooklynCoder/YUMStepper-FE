// AuthContext.js

import React, { createContext, useState, useEffect, useMemo, useCallback, useRef } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDistance } from 'geolib';
import polyline from '@mapbox/polyline';
import { API_BASE_URL } from '@env';
import axios from "axios";
import { debounce } from 'lodash';
import { Platform, Alert } from 'react-native'; // Added Alert for user feedback

// modules that are not available on web
import AppleHealthKit from 'react-native-health';
import BackgroundFetch from 'react-native-background-fetch';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

//trying to figure out how to do web
// if (Platform.OS !== 'web') {
//     AppleHealthKit = require('react-native-health').default;
//     BackgroundFetch = require('react-native-background-fetch').default;
//     Location = require('expo-location'); // Correctly require without .default
//     Notifications = require('expo-notifications'); // Correctly require without .default

//     // Debugging Logs
//     console.log("Location module:", Location);
//     console.log("Notifications module:", Notifications);
// }

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // State Variables
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState({});
    const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });
    const [directions, setDirections] = useState([]);
    const [userSteps, setUserSteps] = useState({ step_count: 0, date: '' });
    const [directionSteps, setDirectionSteps] = useState(0);
    const [selectedRestaurant, setSelectedRestaurant] = useState({});
    const [restaurants, setRestaurants] = useState([]);
    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const [isNearRestaurant, setIsNearRestaurant] = useState(false);
    const [selectedReward, setSelectedReward] = useState({});
    const [lastNotifiedStepCount, setLastNotifiedStepCount] = useState(0);
    
    const [heading, setHeading] = useState(0); 

    const hasFetchedUser = useRef(false); // To prevent multiple fetches

    // Utility function for error handling
    const handleApiError = (error, customMessage) => {
        if (error.response) {
            console.error(`${customMessage}. Status code: ${error.response.status}. Data:`, error.response.data);
        } else if (error.request) {
            console.error(`${customMessage}. No response received. Request:`, error.request);
        } else {
            console.error(`${customMessage}. Error:`, error.message);
        }
    };

    // Function to fetch user data
    const fetchUserData = useCallback(async (currentUserId, currentUserToken) => {
        if (!currentUserId || !currentUserToken) {
            console.error("Invalid userId or userToken. Cannot fetch user.");
            return;
        }
        try {
            console.log('Fetching user with ID:', currentUserId);
            const response = await axios.get(`${API_BASE_URL}/users/${currentUserId}`, {
                headers: {
                    Authorization: `${currentUserToken}`, // Retained Authorization header
                },
            });
            setUser(response.data);
            console.log('User data fetched successfully:', response.data);
            hasFetchedUser.current = true; // Set the ref to true after fetching
        } catch (err) {
            handleApiError(err, "Error fetching user data");
        }
    }, []);

    // Effect to fetch user data when userId and userToken change
    useEffect(() => {
        console.log("useEffect triggered for userId:", userId, "userToken:", userToken);
        if (userId && userToken && !hasFetchedUser.current) {
            fetchUserData(userId, userToken);
        } else {
            if (!userId || !userToken) { // Corrected condition
                console.log("userId or userToken is not available, skipping fetchUser");
            }
        }
    }, [userId, userToken, fetchUserData]);

    // Reset the ref when user logs out
    useEffect(() => {
        if (!userId || !userToken) {
            hasFetchedUser.current = false;
        }
    }, [userId, userToken]);

    // Login Function
    const login = async (token, userId, navigation) => {
        if (!userId || !token) {
            console.error("Invalid userId or token during login");
            return;
        }

        try {
            if (Platform.OS !== 'web') {
                await AsyncStorage.setItem('userToken', token);
                await AsyncStorage.setItem('userId', userId.toString());
            } else {
                localStorage.setItem('userToken', token);
                localStorage.setItem('userId', userId.toString());
            }
            console.log('Saving User Token and ID:', { userId, token });
            
            setUserToken(token);
            setUserId(userId);

            if (navigation) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Profile' }],
                });
            }
        } catch (e) {
            console.error('Failed during login:', e);
        }
    };

    // Logout Function
    const logout = async (navigation) => {
        try {
            if (Platform.OS !== 'web'){
                await AsyncStorage.removeItem('userToken');
                await AsyncStorage.removeItem('userId');
            } else {
                localStorage.removeItem('userToken');
                localStorage.removeItem('userId');
            }

            // Clear state variables
            setUserToken(null);
            setUserId(null);
            setUserLocation({ latitude: null, longitude: null });
            setSelectedRestaurant({});
            setDirections([]);
            setIsLoading(false);
            setUser({});
            setUserSteps({ step_count: 0, date: '' }); // Reset userSteps

            console.log('Logout successful. Cleared storage and context state.');

            // Navigate to Home after everything is cleared
            if (navigation) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home' }],
                });
            }
        } catch (e) {
            console.error('Failed to clear storage during logout:', e);
        }
    };

    // Check Login Status
    const checkLoginStatus = async () => {
        try {
            let token;
            let storedUserId;

            if (Platform.OS !== 'web') {
                token = await AsyncStorage.getItem('userToken');
                storedUserId = await AsyncStorage.getItem('userId');
            } else {
                token = localStorage.getItem('userToken');
                storedUserId = localStorage.getItem('userId');
            }
            
            if (token && storedUserId) {
                setUserToken(token);
                setUserId(parseInt(storedUserId));
                console.log('User is logged in:', { userId: storedUserId, token });
            } else {
                console.log('No user is logged in');
            }
        } catch (e) {
            console.error('Failed to fetch the token or userId from storage');
        } finally {
            setIsLoading(false);
        }
    };

    // Effect: On Mount
    useEffect(() => {
        checkLoginStatus();
        if (Platform.OS !== 'web') {
            fetchNearByPlaces();
        }
        // Removed initializeHealthKit from here
    }, []);

    // Effect: Initialize HealthKit when userId and userToken are available
    useEffect(() => {
        if (userId && userToken && AppleHealthKit && BackgroundFetch) {
            initializeHealthKit();
        }
    }, [userId, userToken]);

    // Effect: Fetch Nearby Places when User Location Changes
    useEffect(() => {
        if (userLocation.latitude && userLocation.longitude) {
            debouncedFetchNearByPlaces();
        }
    }, [userLocation, debouncedFetchNearByPlaces]);

    // Fetch Nearby Places with debouncing to minimize API calls
    const fetchNearByPlaces = async () => {
        if (Platform.OS === 'web') return;

        try {
            if(userLocation?.latitude) {
                const res = await axios.get(`${API_BASE_URL}/googlePlaces/nearby`, {
                    params: {
                        latitude: userLocation.latitude,
                        longitude: userLocation.longitude,
                        radius: 1500, // Example radius in meters
                        type: 'restaurant',
                    },
                    // Removed 'Content-Type' and 'Accept' headers
                });
                if (res.data && res.data.length > 0) {
                    setNearbyPlaces(res.data);
                    console.log("Nearby Places fetched:", res.data);
                } else {
                    console.log("No restaurants found.");
                }
            }
        } catch (err) {
            handleApiError(err, "Error fetching restaurants");
        }
    };

    const debouncedFetchNearByPlaces = useCallback(debounce(fetchNearByPlaces, 10000), [userLocation]);

    // Get Directions from Google Maps with improved error handling
    const getDirectionsFromGoogleMaps = async () => {
        if (!userLocation.latitude || !userLocation.longitude) {
            console.error("User location is not available");
            return;
        }

        if (!selectedRestaurant.latitude || !selectedRestaurant.longitude) {
            console.error("Selected restaurant location is not available");
            return;
        }

        try {
            const response = await axios.get(
                `${API_BASE_URL}/googlePlaces/directions`,
                {
                    params: {
                        originLat: userLocation.latitude,
                        originLng: userLocation.longitude,
                        destLat: selectedRestaurant.latitude,
                        destLng: selectedRestaurant.longitude,
                    },
                    // Removed 'Content-Type' and 'Accept' headers
                }
            );

            if (response?.data?.directions?.legs?.length > 0) {
                const points = response.data.directions.overview_polyline.points;
                const decodedPoints = polyline.decode(points).map(([latitude, longitude]) => ({
                    latitude,
                    longitude,
                }));
                setDirections(decodedPoints);
                console.log("Directions fetched and decoded:", decodedPoints);
            } else {
                console.error('No routes found');
            }
        } catch (error) {
            handleApiError(error, 'Error fetching directions');
        }
    };

    // Effect: Watch User Location
    useEffect(() => {
        if (Platform.OS === 'web') {
            return;
        }

        let locationSubscription = null;

        const subscribeToLocation = async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                console.log("Foreground location permission status:", status);
                if (status !== "granted") {
                    console.error("Permission to access location was denied");
                    Alert.alert(
                        "Location Permission Denied",
                        "Please allow location access in settings to use this feature.",
                        [{ text: "OK" }]
                    );
                    return;
                }

                let { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
                console.log("Background location permission status:", backgroundStatus);
                if (backgroundStatus !== "granted") {
                    console.warn("Background permission denied.");
                }

                locationSubscription = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.Balanced,
                        timeInterval: 2000,
                        distanceInterval: 5,
                    },
                    (location) => {
                        const { latitude, longitude, heading: locationHeading } = location.coords;

                        setUserLocation({
                            latitude,
                            longitude,
                        });

                        setHeading(locationHeading || 0); // Updated here
                        console.log("User location updated:", { latitude, longitude, heading: locationHeading });
                    }
                );
            } catch (error) {
                console.error("Error watching user location:", error);
            }
        };

        subscribeToLocation();

        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    }, [userId]); // Removed userToken from dependencies as it might not be necessary

    // HealthKit Initialization and Step Tracking Functions
    const initializeHealthKit = () => {
        if (!userId || !userToken || !AppleHealthKit || !BackgroundFetch) {
            console.error("User details or modules are not available for initializing HealthKit.");
            return;
        }

        const healthKitOptions = {
            permissions: {
                read: [AppleHealthKit.Constants.Permissions.StepCount],
                write: [AppleHealthKit.Constants.Permissions.StepCount],
            },
        };

        AppleHealthKit.initHealthKit(healthKitOptions, (err) => {
            if (err) {
                console.error("HealthKit initialization failed: ", err);
                return;
            }
            console.log("HealthKit successfully connected");
            fetchStepCount();
            configureBackgroundFetch();
        });
    };

    const fetchStepCount = () => {
        const today = new Date();
        const options = {
            startDate: new Date(today.setHours(0, 0, 0, 0)).toISOString(), // Start of the day
            endDate: new Date().toISOString(), // Current time
        };
    
        AppleHealthKit.getDailyStepCountSamples(options, (err, results) => {
            if (err) {
                console.log("Error fetching step data", err);
                return;
            }
    
            console.log("HealthKit step results:", results);
    
            if (!results || results.length === 0) {
                console.log("No step data available for today.");
                return;
            }
    
            const stepsToday = results.reduce((total, step) => total + step.value, 0);
            console.log(`Total steps today: ${stepsToday}`);
            console.log("Setting userSteps with:", { step_count: stepsToday, date: new Date().toLocaleDateString() });

            setUserSteps({
                step_count: stepsToday,
                date: new Date().toLocaleDateString(), // Format the date as needed
            });
        });
    };
    

    // Sync steps with improved error handling
    const syncStepsToBackend = async (steps) => {
        if (!userId || !userToken) {
            console.error("Cannot sync steps without valid user details");
            return;
        }

        console.log('Syncing steps. User ID:', userId, 'User Token:', userToken);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/users/${userId}/steps`,
                {
                    step_count: steps,
                },
                {
                    headers: {
                        Authorization: `${userToken}`, // Retained Authorization header for step syncing
                    },
                }
            );
            console.log("Steps synced successfully: ", response.data);
        } catch (err) {
            handleApiError(err, "Error syncing steps");
        }
    };

    // Configure Background Fetch with adjusted interval
    const configureBackgroundFetch = () => {
        if (!BackgroundFetch) {
            console.error("BackgroundFetch module is not available");
            return;
        }

        BackgroundFetch.configure(
            { minimumFetchInterval: 15 }, // 15 minutes interval
            async (taskId) => {
                console.log("Background fetch successful");
                fetchStepCount();
                BackgroundFetch.finish(taskId);
            },
            (err) => {
                console.error("Background fetch failed: ", err);
            }
        );
    };

    // Trigger notifications at milestones
    const triggerNotification = async (steps) => {
        const milestones = [1000, 5000, 10000];
        const milestoneReached = milestones.find(
            milestone => steps >= milestone && lastNotifiedStepCount < milestone
        );

        if (milestoneReached) {
            try {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: "Milestone Reached!",
                        body: `Congratulations! You've reached ${milestoneReached} steps!`,
                    },
                    trigger: { seconds: 1 },
                });
                setLastNotifiedStepCount(milestoneReached);
                console.log(`Notification for ${milestoneReached} steps sent.`);
            } catch (error) {
                console.error("Error scheduling notification:", error);
            }
        }
    };

    // Calculate steps with useMemo for optimization
    const stepsNeeded = useMemo(() => {
        if (!userLocation.latitude || !selectedRestaurant?.latitude) {
            return 0;
        }
        const totalDistance = getDistance(
            { latitude: userLocation.latitude, longitude: userLocation.longitude },
            { latitude: selectedRestaurant.latitude, longitude: selectedRestaurant.longitude }
        );

        const averageStepLength = 0.7; // in meters
        return Math.round(totalDistance / averageStepLength);
    }, [userLocation, selectedRestaurant]);

    useEffect(() => {
        setDirectionSteps(stepsNeeded);
    }, [stepsNeeded]);

    // Steps to Points Conversion with useCallback
    const stepsToPoints = useCallback((steps) => {
        if (steps <= 1000) {
            return Math.floor(steps / 100);
        } else if (steps <= 5000) {
            return Math.floor(steps / 80);
        } else {
            return Math.floor(steps / 50);
        }
    }, []);

    // Check proximity with useMemo for optimization
    const distanceToRestaurant = useMemo(() => {
        if (
            userLocation.latitude && userLocation.longitude &&
            selectedRestaurant.latitude && selectedRestaurant.longitude
        ) {
            return getDistance(
                { latitude: userLocation.latitude, longitude: userLocation.longitude },
                { latitude: selectedRestaurant.latitude, longitude: selectedRestaurant.longitude }
            );
        } else {
            return null;
        }
    }, [userLocation, selectedRestaurant]);

    useEffect(() => {
        const thresholdDistance = 50; // in meters
        if (distanceToRestaurant !== null) {
            setIsNearRestaurant(distanceToRestaurant <= thresholdDistance);
        } else {
            setIsNearRestaurant(false);
        }
    }, [distanceToRestaurant]);

    const calculateSteps = useCallback(() => {
        if (!userLocation.latitude || !selectedRestaurant?.latitude) {
            return;
        }

        const totalDistance = getDistance(
            { latitude: userLocation.latitude, longitude: userLocation.longitude },
            { latitude: selectedRestaurant.latitude, longitude: selectedRestaurant.longitude }
        );

        const averageStepLength = 0.7; // in meters
        const stepsNeeded = Math.round(totalDistance / averageStepLength);
        setDirectionSteps(stepsNeeded);
    }, [userLocation, selectedRestaurant]);

    return (
        <AuthContext.Provider
            value={{
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
                setSelectedRestaurant,
                selectedRestaurant,
                getDirectionsFromGoogleMaps,
                directionSteps,
                restaurants,
                fetchNearByPlaces, // Now fetchNearByPlaces no longer includes Authorization headers
                isNearRestaurant,
                stepsToPoints,
                nearbyPlaces,
                user,
                setUser,
                selectedReward,
                setSelectedReward,
                calculateSteps,
                setRestaurants,
                heading, // Optional: Expose heading if needed
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
