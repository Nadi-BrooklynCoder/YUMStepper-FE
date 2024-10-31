// AuthProvider.js

import React, { createContext, useState, useEffect, useCallback, useRef } from "react";
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { debounce } from 'lodash';
import { getDistance } from 'geolib';
import { API_BASE_URL } from '@env';
import * as Speech from 'expo-speech';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

// Modules that are not available on web
import AppleHealthKit from 'react-native-health';
import BackgroundFetch from 'react-native-background-fetch';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // **State Variables**
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState({
        points_earned: 0, // Initialize points_earned
    });
    const [userLocation, setUserLocation] = useState({
        latitude: 40.73061,  // Default coordinates (e.g., NYC)
        longitude: -73.935242
    });
    const [directions, setDirections] = useState([]);
    const [userSteps, setUserSteps] = useState({ step_count: 0, date: '' });
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const [isNearRestaurant, setIsNearRestaurant] = useState(false);
    const [selectedReward, setSelectedReward] = useState(null);
    const [lastNotifiedStepCount, setLastNotifiedStepCount] = useState(0);
    const [heading, setHeading] = useState(0); 
    const [directionsText, setDirectionsText] = useState("");
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
    const [userRewards, setUserRewards] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    
    // **Added State Variables for Redemption**
    const [qrCodeUrl, setQrCodeUrl] = useState(null);
    const [showMessage, setShowMessage] = useState("");

    const hasFetchedUser = useRef(false); // To prevent multiple fetches

    // **Utility Function for Error Handling**
    const handleApiError = (error, customMessage) => {
        const errorMessage = error.response?.data || error.message || "An error occurred";
        console.error(`${customMessage}. Details: ${JSON.stringify(errorMessage)}`);
    };

    // **Fetch User Data**
    const fetchUserData = useCallback(async (currentUserId, currentUserToken) => {
        if (!currentUserId || !currentUserToken) {
            console.error("Invalid userId or userToken. Cannot fetch user.");
            return;
        }
        try {
            console.log('Fetching user with ID:', currentUserId);
            const response = await axios.get(`${API_BASE_URL}/users/${currentUserId}`, {
                headers: {
                    Authorization: `Bearer ${currentUserToken}`,
                },
            });
            setUser(prevUser => ({
                ...response.data,
                points_earned: response.data.points_earned || 0, // Ensure points_earned is present
            }));
            console.log('User data fetched successfully:', response.data);
            hasFetchedUser.current = true;
        } catch (err) {
            handleApiError(err, "Error fetching user data");
        }
    }, []);

    // **Effect: Fetch User Data When userId and userToken Change**
    useEffect(() => {
        if (userId && userToken && !hasFetchedUser.current) {
            fetchUserData(userId, userToken);
        }
    }, [userId, userToken, fetchUserData]);

    // **Effect: Reset fetch status if userId or userToken Changes**
    useEffect(() => {
        if (!userId || !userToken) {
            hasFetchedUser.current = false;
        }
    }, [userId, userToken]);

    // **Login Function**
    const login = useCallback(async (token, userIdParam, navigation) => {
        if (!userIdParam || !token) {
            console.error("Invalid userId or token during login");
            return;
        }

        try {
            console.log(token);
            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userId', userIdParam.toString());
            setUserToken(token);
            setUserId(userIdParam);
            if (navigation) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Profile' }],
                });
            }
        } catch (e) {
            console.error('Error during login:', e);
        }
    }, []);

    // **Check Login Status**
    const checkLoginStatus = useCallback(async () => {
        try {
            let token, storedUserId;
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
            }
        } catch (e) {
            console.error('Failed to fetch the token or userId from storage');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // **Effect: On Mount**
    useEffect(() => {
        checkLoginStatus();
        fetchInitialLocation();
        fetchNearByPlaces(); // Initial fetch without debounce
    }, [checkLoginStatus]);

    // **Fetch Initial Location**
    const fetchInitialLocation = useCallback(async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status === "granted") {
                const location = await Location.getCurrentPositionAsync({});
                const { latitude, longitude } = location.coords;
                setUserLocation({ latitude, longitude });
                console.log("Initial location fetched: ", { latitude, longitude });
            } else {
                Alert.alert("Permission Denied", "Location permission is required to use this feature.");
            }
        } catch (error) {
            console.error("Error fetching initial location: ", error);
        }
    }, []);

    // **Fetch Nearby Places with Debouncing to Minimize API Calls**
    const fetchNearByPlaces = useCallback(async () => {
        if (!userLocation?.latitude || !userLocation?.longitude) {
            console.warn("User location is undefined, skipping fetch");
            return;
        }

        try {
            const res = await axios.get(`${API_BASE_URL}/googlePlaces/nearby`, {
                params: {
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    radius: 1500, // Example radius in meters
                    type: 'restaurant',
                },
            });
            if (res.data && res.data.length > 0) {
                setNearbyPlaces(res.data);
                console.log("Nearby Places fetched:", res.data);
            } else {
                console.log("No restaurants found.");
            }
        } catch (err) {
            handleApiError(err, "Error fetching restaurants");
        }
    }, [userLocation]);

    const debouncedFetchNearByPlaces = useCallback(debounce(fetchNearByPlaces, 10000), [fetchNearByPlaces]);

    // **Effect: Fetch Nearby Places When User Location Changes**
    useEffect(() => {
        if (userLocation.latitude && userLocation.longitude) {
            debouncedFetchNearByPlaces();
        }

        return () => {
            debouncedFetchNearByPlaces.cancel(); // Cleanup debounced function
        };
    }, [userLocation, debouncedFetchNearByPlaces]);

    // **Get Directions from Google Maps with Improved Error Handling**
    const getDirectionsFromGoogleMaps = useCallback(async () => {
        if (!userLocation.latitude || !userLocation.longitude) {
            console.error("User location is not available");
            return;
        }

        if (!selectedRestaurant?.latitude || !selectedRestaurant?.longitude) {
            console.error("Selected restaurant location is not available");
            return;
        }

        console.log("Fetching directions from:", userLocation, "to:", selectedRestaurant);

        try {
            const url = `${API_BASE_URL}/googlePlaces/directions`;
            const params = {
                originLat: userLocation.latitude,
                originLng: userLocation.longitude,
                destLat: selectedRestaurant.latitude,
                destLng: selectedRestaurant.longitude,
            };
            const response = await axios.get(url, { params });
            console.log("Directions API full response:", response.data);

            if (response.data?.overview_polyline && response.data?.steps) {
                // Set the directions for the polyline
                setDirections(response.data.overview_polyline);

                // Construct directions text
                const directionsText = response.data.steps.map(step => 
                    `${step.instructions.replace(/<[^>]*>?/gm, '')} (${step.distance})`
                ).join('\n');
                
                setDirectionsText(directionsText);
                console.log("Directions and text updated successfully.");
                console.log("Directions Text updated:", directionsText);
            } else {
                console.error("Polyline or steps format is not valid in response:", response.data);
            }

        } catch (error) {
            console.error("Error fetching directions:", error.response?.data || error.message);
            Alert.alert("Error", "Unable to fetch directions. Please try again later.");
        }
    }, [userLocation, selectedRestaurant]);

    // **Handle Reward Redemption**
    const handleRedemption = useCallback(async () => {
        if (!selectedReward || !selectedReward.id || !userId) {
            console.warn("Selected reward or userId is missing");
            return;
        }
        console.log("Attempting to redeem reward with ID:", selectedReward.id);
        try {
            const response = await axios.put(
                `${API_BASE_URL}/users/${userId}/rewards/${selectedReward.id}/redeem`,
                {},
                { headers: { Authorization: `Bearer ${userToken}` } }
            );
            if (response.data.qr_code_url) {
                setQrCodeUrl(response.data.qr_code_url);
                setShowMessage("QR code generated successfully!");
            } else {
                setShowMessage("Redemption successful but no QR code generated.");
            }

            // After redemption, refresh user points
            await fetchUserPoints();
        } catch (err) {
            handleApiError(err, "Error redeeming reward");
            setShowMessage("Error redeeming reward. Please try again.");
        }
    }, [selectedReward, userId, userToken, fetchUserPoints]);

    // **Watch User Location**
    useEffect(() => {
        let locationSubscription = null;

        const subscribeToLocation = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    Alert.alert("Location Permission Denied", "Please enable location access.");
                    return;
                }

                locationSubscription = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.Balanced,
                        timeInterval: 2000,
                        distanceInterval: 5,
                    },
                    (location) => {
                        const { latitude, longitude, heading: locationHeading } = location.coords;
                        setUserLocation({ latitude, longitude });
                        setHeading(locationHeading || 0);
                    }
                );
            } catch (error) {
                console.error("Error watching user location:", error);
            }
        };

        subscribeToLocation();

        // Cleanup subscription on unmount
        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    }, [userId]);

    // **HealthKit Initialization and Step Tracking Functions**
    const initializeHealthKit = useCallback(() => {
        if (!userId || !userToken || !AppleHealthKit || !BackgroundFetch) {
            console.error("User details or modules are not available for initializing HealthKit.");
            return;
        }

        const healthKitOptions = {
            permissions: {
                read: [AppleHealthKit.Constants.Permissions.StepCount],
                // Removed write permissions if not needed
            },
        };

        AppleHealthKit.initHealthKit(healthKitOptions, (err) => {
            if (err) {
                console.error("HealthKit initialization failed: ", err);
                return;
            }
            console.log("HealthKit successfully connected");
            fetchAndUpdateStepCount(); // Initial fetch
            configureBackgroundFetch();
        });
    }, [userId, userToken]);

    

    // **Fetch and Update Step Count**
    const fetchAndUpdateStepCount = useCallback(() => {
        // Ensure userId and userToken are available
        if (!userId || !userToken) {
            console.error("Cannot sync steps without valid user details");
            return;
        }

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

            // **Updated Calculation: Points Earned Based on Steps**
            const pointsEarned = Math.floor(stepsToday / 1000) * 10;

            setUserSteps({
                step_count: stepsToday,
                points_earned: pointsEarned,
                date: new Date().toLocaleDateString(),
            });

            triggerNotification(stepsToday); // Trigger notification if milestone reached
            syncStepsToBackend(stepsToday, pointsEarned); // Sync steps to backend
        });
    }, [syncStepsToBackend, triggerNotification, userId, userToken]);

    // **Polling Setup: Fetch Steps Every 5 Minutes**
    useEffect(() => {
        if (userId && userToken) {
            // Initialize HealthKit when user is authenticated
            initializeHealthKit();

            // Fetch immediately on mount
            fetchAndUpdateStepCount();

            // Set up interval to fetch every 5 minutes
            const intervalId = setInterval(fetchAndUpdateStepCount, 5 * 60 * 1000); // 5 minutes

            // Clean up interval on unmount
            return () => clearInterval(intervalId);
        }
    }, [fetchAndUpdateStepCount, initializeHealthKit, userId, userToken]);

    // **Configure Background Fetch**
    const configureBackgroundFetch = useCallback(() => {
        if (!BackgroundFetch) {
            console.error("BackgroundFetch module is not available");
            return;
        }

        BackgroundFetch.configure(
            { minimumFetchInterval: 15 }, // 15 minutes interval
            async (taskId) => {
                console.log("Background fetch task started");
                fetchAndUpdateStepCount(); // Fetch step count during background fetch
                BackgroundFetch.finish(taskId);
            },
            (err) => {
                console.error("Background fetch failed to start: ", err);
            }
        );

        // Start Background Fetch
        BackgroundFetch.start();
    }, [fetchAndUpdateStepCount]);

    // **Sync Steps to Backend with Improved Error Handling**
    const syncStepsToBackend = useCallback(async (steps, pointsEarned) => {
        if (!userId || !userToken) {
            console.error("Cannot sync steps without valid user details");
            return;
        }

        try {
            const response = await axios.post(
                `${API_BASE_URL}/users/${userId}/steps`,
                { step_count: steps, points_earned: pointsEarned },
                { headers: { Authorization: `Bearer ${userToken}` } }
            );
            console.log("Steps and points synced successfully:", response.data);

            await fetchUserPoints();
        } catch (error) {
            handleApiError(error, "Error syncing steps");
        }
    }, [userId, userToken, fetchUserPoints]);

    // **Trigger Notifications at Milestones**
    const triggerNotification = useCallback(async (steps) => {
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
    }, [lastNotifiedStepCount]);


const calculateCheckInPoints = useCallback((distance) => {
    // Define base points, check-in points, and multipliers for display purposes
    let checkInPoints = 10; // Base check-in points for short distances
    if (distance > 6436) { // Over 6.4 km
        checkInPoints = 50;
    } else if (distance > 3218) { // Over 3.2 km
        checkInPoints = 35;
    } else if (distance > 1609) { // Over 1.6 km
        checkInPoints = 25;
    } else if (distance > 805) { // Over 0.8 km
        checkInPoints = 15;
    }

    const basePoints = 10; // Default base points
    let multiplier = 1; // Multiplier for long distances

    if (distance > 4827) { // Over 4.8 km
        multiplier = 3;
    } else if (distance > 3218) { // Over 3.2 km
        multiplier = 2;
    } else if (distance > 1609) { // Over 1.6 km
        multiplier = 1.5;
    }

    const multiplierPoints = Math.floor(basePoints * multiplier);
    const totalPoints = checkInPoints + multiplierPoints;

    return { basePoints, checkInPoints, multiplierPoints, totalPoints };
}, []);


    // **Stop Voice Directions**
    const stopVoiceDirections = useCallback(() => {
        console.log("Attempting to stop voice directions...");
        Speech.stop();
        setIsVoiceEnabled(false);
    }, []);

    // **Check Nearby Restaurants and Notify**
    const checkNearbyRestaurants = useCallback(() => {
        if (!userLocation.latitude || !userLocation.longitude || !nearbyPlaces.length) return;
    
        const proximityRadius = 200; // Define proximity radius in meters
        let nearAnyRestaurant = false;
    
        nearbyPlaces.forEach((restaurant) => {
            const distance = getDistance(
                { latitude: userLocation.latitude, longitude: userLocation.longitude },
                { latitude: parseFloat(restaurant.latitude), longitude: parseFloat(restaurant.longitude) }
            );
    
            if (distance <= proximityRadius) {
                nearAnyRestaurant = true;
                Notifications.scheduleNotificationAsync({
                    content: {
                        title: `You're near ${restaurant.name}`,
                        body: 'Walk there now to earn extra points!',
                    },
                    trigger: { seconds: 1 },
                });
            }
        });
    
        setIsNearRestaurant(nearAnyRestaurant);
    }, [userLocation, nearbyPlaces]);

    // **Fetch User Points**
    const fetchUserPoints = useCallback(async () => {
        if (!userToken || !userId) return;

        try {
            const response = await axios.get(`${API_BASE_URL}/users/${userId}/points`, {
                headers: { Authorization: `Bearer ${userToken}` },
            });
            setUser(prevUser => ({
                ...prevUser,
                points_earned: response.data.points, 
            }));
        } catch (error) {
            console.error("Error fetching user points:", error);
        }
    }, [userToken, userId]);

    // **Update User Points Locally After Check-In**
    const updateUserPoints = useCallback((pointsEarned) => {
        setUser(prevUser => ({
            ...prevUser,
            points_earned: prevUser.points_earned + pointsEarned,
        }));
    }, []);

    // **Select Reward**
    const selectReward = useCallback((reward) => {
        if (reward === null) {
            setSelectedReward(null);
            console.log("Cleared selected reward");
        } else if (reward && reward.id) {
            setSelectedReward(reward);
            console.log("Selecting reward:", reward.id);
        } else {
            // Only warn if an unexpected invalid reward is passed
            console.warn("Attempted to select an invalid reward:", reward);
        }
    }, []);

    // **Fetch User Points on Mount and When Dependencies Change**
    useEffect(() => {
        fetchUserPoints();
    }, [fetchUserPoints]);

    // **Implementing a Better Random Ping Scheduler**
    const scheduleRandomPings = useCallback(() => {
        const intervals = [0, 3, 6, 9, 12].map(hours => hours * 60 * 60); // 0, 3, 6, 9, 12 hours in seconds
        intervals.forEach(interval => {
            setTimeout(() => sendRandomRestaurantPing(), interval * 1000);
        });
    }, []);

    const sendRandomRestaurantPing = useCallback(() => {
        if (!restaurants.length) return;

        const randomIndex = Math.floor(Math.random() * restaurants.length);
        const randomRestaurant = restaurants[randomIndex];

        Notifications.scheduleNotificationAsync({
            content: {
                title: `Check out ${randomRestaurant.name}!`,
                body: 'Visit here for even more points!'
            },
            trigger: { seconds: Math.floor(Math.random() * 60 * 60 * 5) }, // Random trigger within 5 hours
        });
    }, [restaurants]);

    // **Logout Function**
    const logoutUser = useCallback(async (navigation) => {
        try {
            if (Platform.OS !== 'web') {
                await AsyncStorage.removeItem('userToken');
                await AsyncStorage.removeItem('userId');
            } else {
                localStorage.removeItem('userToken');
                localStorage.removeItem('userId');
            }
            setUserToken(null);
            setUserId(null);
            setUser({
                points_earned: 0, // Reset points_earned
            });
            setUserLocation({ latitude: 40.73061, longitude: -73.935242 });
            setSelectedRestaurant(null);
            setDirections([]);
            setUserSteps({ step_count: 0, date: '' });
            setIsLoading(false);
            setQrCodeUrl(null); // Reset QR Code URL
            setShowMessage(""); // Reset message

            // **Stop BackgroundFetch to Prevent Sync After Logout**
            if (BackgroundFetch) {
                BackgroundFetch.stop().then(() => {
                    console.log("BackgroundFetch stopped successfully");
                }).catch((err) => {
                    console.error("Error stopping BackgroundFetch:", err);
                });
            }

            if (navigation) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home' }],
                });
            }
        } catch (e) {
            console.error('Error during logout:', e);
        }
    }, []);

    // **Check Nearby Restaurants When User Location Changes**
    useEffect(() => {
        if (userLocation.latitude && userLocation.longitude) {
            checkNearbyRestaurants();
        }
    }, [userLocation, checkNearbyRestaurants]);

    // **Schedule Random Pings on Mount**
    useEffect(() => {
        scheduleRandomPings();
    }, [scheduleRandomPings]);

    // **Log Updated User Location**
    useEffect(() => {
        console.log("Updated user location:", userLocation);
    }, [userLocation]);

    return (
        <AuthContext.Provider
            value={{
                login,
                logout: logoutUser, // Renamed to avoid conflict with function name
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
                restaurants,
                directionsText,
                fetchNearByPlaces,
                nearbyPlaces,
                user,
                setUser,
                selectedReward,
                selectReward,
                handleRedemption,
                setRestaurants,
                heading,
                isNearRestaurant,
                setIsNearRestaurant,
                triggerNotification,
                syncStepsToBackend,
                isVoiceEnabled,
                setIsVoiceEnabled,
                stopVoiceDirections,
                fetchUserPoints, // Exposed for components to trigger refresh
                updateUserPoints,
                calculateCheckInPoints,
                userRewards, 
                setUserRewards,
                qrCodeUrl, // Expose if needed
                showMessage, // Expose if needed
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
