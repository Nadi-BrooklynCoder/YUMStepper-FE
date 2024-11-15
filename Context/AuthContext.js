// AuthProvider.js

import React, { createContext, useState, useEffect, useCallback, useRef } from "react";
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { debounce } from 'lodash';
import { getDistance } from 'geolib';
import { API_BASE_URL } from '@env';
// import * as Speech from 'expo-speech';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

// Modules that are not available on web
import AppleHealthKit from 'react-native-health';
import BackgroundFetch from 'react-native-background-fetch';

// **Centralized Constants for Distance Thresholds and Multipliers**
const CHECK_IN_THRESHOLDS = [
    { distance: 6436, points: 50 },
    { distance: 3218, points: 35 },
    { distance: 1609, points: 25 },
    { distance: 805, points: 15 },
    { distance: 0, points: 10 },
];

const MULTIPLIER_THRESHOLDS = [
    { distance: 4827, multiplier: 3.0 },
    { distance: 3218, multiplier: 2.5 },
    { distance: 1609, multiplier: 2.0 },
    { distance: 805, multiplier: 1.5 },
    { distance: 0, multiplier: 1.0 },
];

// **Create Auth Context**
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // **State Variables**
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);
    const [checkInsToday, setCheckInsToday] = useState({});
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState({ points_earned: 0 });
    const [userLocation, setUserLocation] = useState({ latitude: 40.743175215962026, longitude: -73.94192180308748 });
    const [stepsHistory, setStepsHistory] = useState([]);
    const [directions, setDirections] = useState([]);
    const [userSteps, setUserSteps] = useState({ step_count: 0, date: '' });
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const [isNearRestaurant, setIsNearRestaurant] = useState(false);
    const [selectedReward, setSelectedReward] = useState(null);
    const [lastNotifiedStepCount, setLastNotifiedStepCount] = useState(0);
    const [heading, setHeading] = useState(0);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [directionsText, setDirectionsText] = useState("");
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
    const [userRewards, setUserRewards] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [currentCheckInPoints, setCurrentCheckInPoints] = useState(0);
    const [lastSyncedStepCount, setLastSyncedStepCount] = useState(0);
    const [checkInPoints, setCheckInPoints] = useState(0);
    const [multiplierPoints, setMultiplierPoints] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);
    const [qrCodeUrl, setQrCodeUrl] = useState(null);
    const [showMessage, setShowMessage] = useState("");
    const hasFetchedUser = useRef(false);
    const stepCountIntervalId = useRef(null);
    const locationSubscription = useRef(null);

    const handleApiError = (error, customMessage) => {
        const errorMessage = error.response?.data || error.message || "An error occurred";
        console.error(`${customMessage}. Details: ${JSON.stringify(errorMessage)}`);
    };

    const login = useCallback(async (token, userIdParam, navigation) => {
        if (!userIdParam || !token) {
            console.error("Invalid userId or token during login");
            return;
        }
    
        try {
            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userId', userIdParam.toString());
    
            setUserToken(token);
            setUserId(userIdParam);
    
            // Fetch user data, points, and step history
            await fetchUserData(userIdParam, token);
            await fetchUserPoints(token, userIdParam);
            await fetchStepHistory(token, userIdParam);
    
            if (navigation) {
                navigation.reset({ index: 0, routes: [{ name: 'Map' }] });
            }
        } catch (e) {
            console.error('Error during login:', e);
        }
    }, [fetchUserData, fetchUserPoints, fetchStepHistory]);
    
    const checkLoginStatus = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const storedUserId = await AsyncStorage.getItem('userId');
    
            if (token && storedUserId) {
                const userIdInt = parseInt(storedUserId, 10);
                setUserToken(token);
                setUserId(userIdInt);
    
                // Fetch user points and data without recalculating them
                await fetchUserPoints(token, userIdInt);
                await fetchUserData(userIdInt, token);
            } else {
                console.warn("Token or userId not found in AsyncStorage");
            }
        } catch (e) {
            console.error('Failed to fetch the token or userId from storage', e);
        } finally {
            setIsLoading(false);
        }
    }, [fetchUserPoints, fetchUserData]);
    

    const fetchUserRewards = useCallback(async (currentToken = userToken, currentUserId = userId) => {
        if (!currentUserId || !currentToken) {
            console.warn("Cannot fetch user rewards: userToken or userId is missing");
            return;
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/users/${currentUserId}/rewards`, {
                headers: { Authorization: `Bearer ${currentToken}` },
            });
            setUserRewards(response.data.rewards);
        } catch (error) {
            console.error("Error fetching user rewards:", error);
        }
    }, [userToken, userId]);

    const fetchUserData = useCallback(async (currentUserId, currentUserToken) => {
        if (!currentUserId || !currentUserToken) {
            console.error("Invalid userId or userToken. Cannot fetch user.");
            return;
        }
        try {
            const response = await axios.get(`${API_BASE_URL}/users/${currentUserId}`, {
                headers: { Authorization: `Bearer ${currentUserToken}` },
            });
            
            if (response.data && response.data.id === currentUserId) {
                setUser(prevUser => ({ ...response.data, points_earned: response.data.points_earned || 0 }));
                setCheckInPoints(response.data.check_in_points || 0);
                setMultiplierPoints(response.data.multiplier_points || 0);
                hasFetchedUser.current = true;
            } else {
                console.error("User ID in token does not match fetched data. Logging out for safety.");
                await logoutUser();
            }
        } catch (err) {
            handleApiError(err, "Error fetching user data");
        }
    }, [logoutUser]);

    useEffect(() => {
        if (userId && userToken && !hasFetchedUser.current) {
            fetchUserData(userId, userToken);
        }
    }, [userId, userToken, fetchUserData]);

    useEffect(() => {
        if (userId && userToken && userSteps.step_count > 0) {
            syncStepsToBackend(userSteps.step_count, userSteps.points_earned, userSteps.step_count);
        }
    }, [userId, userToken, userSteps.step_count, userSteps.points_earned, syncStepsToBackend]);

    useEffect(() => {
        if (!userId || !userToken) {
            hasFetchedUser.current = false;
        }
    }, [userId, userToken]);

    useEffect(() => {
        const initialize = async () => {
            await checkLoginStatus();
            await fetchInitialLocation();
            await fetchNearByPlaces();
        };
        initialize();
    }, [checkLoginStatus, fetchInitialLocation, fetchNearByPlaces]);

    useEffect(() => {
        if (userId && userToken) {
            processUnprocessedCheckins();
            fetchCheckInHistory();
            fetchUserPoints(); // Refresh points after processing
        }
    }, [userId, userToken, processUnprocessedCheckins, fetchCheckInHistory, fetchUserPoints]);

    const fetchInitialLocation = useCallback(async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === "granted") {
                const location = await Location.getCurrentPositionAsync({});
                const { latitude, longitude } = location.coords;
                setUserLocation({ latitude, longitude });
            } else {
                Alert.alert("Permission Denied", "Location permission is required to use this feature.");
            }
        } catch (error) {
            console.error("Error fetching initial location: ", error);
        }
    }, []);

    const fetchNearByPlaces = useCallback(async () => {
        if (!userLocation.latitude || !userLocation.longitude) return;
    
        try {
            const response = await axios.get(`${API_BASE_URL}/googlePlaces/nearby`, {
                params: {
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    radius: 1500,
                    type: 'restaurant',
                },
            });
    
            const restaurantsWithPoints = response.data.map((restaurant) => {
                const distance = getDistance(
                    { latitude: userLocation.latitude, longitude: userLocation.longitude },
                    { latitude: restaurant.latitude, longitude: restaurant.longitude }
                );
    
                const baseCheckInPoints = assignPointsBasedOnDistance(distance);
                const bonusMultiplierPoints = calculateBonusMultiplierPoints(distance, baseCheckInPoints);
                const totalPoints = baseCheckInPoints + bonusMultiplierPoints;
    
                const latitude = parseFloat(restaurant.latitude);
                const longitude = parseFloat(restaurant.longitude);
    
                if (isNaN(latitude) || isNaN(longitude)) {
                    console.warn("Invalid latitude or longitude for restaurant:", restaurant.name);
                    return null;
                }
    
                return {
                    ...restaurant,
                    latitude,
                    longitude,
                    baseCheckInPoints,
                    bonusMultiplierPoints,
                    totalPoints,
                    distance,
                };
            }).filter(Boolean);
    
            console.log("Processed restaurant data:", restaurantsWithPoints);
    
            setRestaurants(restaurantsWithPoints);
            setNearbyPlaces(restaurantsWithPoints);
        } catch (error) {
            console.error("Failed to fetch nearby places:", error);
        }
    }, [userLocation]);

    const assignPointsBasedOnDistance = (distanceMeters) => {
        for (let threshold of CHECK_IN_THRESHOLDS) {
            if (distanceMeters > threshold.distance) {
                return threshold.points;
            }
        }
        return 0;
    };
    
    const calculateBonusMultiplierPoints = (distanceMeters, basePoints) => {
        let multiplier = 1.0;
    
        for (let threshold of MULTIPLIER_THRESHOLDS) {
            if (distanceMeters > threshold.distance) {
                multiplier = threshold.multiplier;
                break;
            }
        }
    
        const bonusPoints = Math.floor(basePoints * (multiplier - 1));
        console.log(`Calculated bonus points: ${bonusPoints} with multiplier ${multiplier} for distance: ${distanceMeters}`);
        return bonusPoints;
    };

    const debouncedFetchNearByPlaces = useCallback(debounce(fetchNearByPlaces, 10000), [fetchNearByPlaces]);

    useEffect(() => {
        if (userLocation.latitude && userLocation.longitude) {
            debouncedFetchNearByPlaces();
        }

        return () => {
            debouncedFetchNearByPlaces.cancel();
        };
    }, [userLocation, debouncedFetchNearByPlaces]);

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
                setDirections(response.data.overview_polyline);

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

    const resetModalStates = useCallback(() => {
        setSelectedReward(null);
        setQrCodeUrl(null);
        setShowMessage("");
    }, []);


    const processUnprocessedCheckins = useCallback(async () => {
        if (!userId || !userToken) {
            console.warn("Cannot process unprocessed check-ins: userToken or userId is missing");
            return;
        }
    
        try {
            console.log("Processing unprocessed check-ins for user:", userId);
            const response = await axios.post(`${API_BASE_URL}/users/${userId}/checkins/process`, {}, {
                headers: { Authorization: `Bearer ${userToken}` },
            });
    
            console.log("Unprocessed check-ins processed successfully:", response.data);
    
            // Optionally update check-in history or user points after processing
            await fetchCheckInHistory();
            await fetchUserPoints();
        } catch (error) {
            console.error("Error processing unprocessed check-ins:", error);
        }
    }, [userId, userToken, fetchCheckInHistory, fetchUserPoints]);
    


    const handleRedemption = useCallback(async () => {
        if (!selectedReward || !selectedReward.id || !userId || !userToken) {
            console.warn("Selected reward, userId, or userToken is missing");
            setShowMessage("Invalid reward selection.");
            return;
        }
        console.log("Attempting to redeem reward with ID:", selectedReward.id);
        try {
            const response = await axios.put(
                `${API_BASE_URL}/users/${userId}/userRewards/${selectedReward.id}/redeem`,
                {},
                { headers: { Authorization: `Bearer ${userToken}` } }
            );
            if (response.data.qr_code_url) {
                setQrCodeUrl(response.data.qr_code_url);
                setShowMessage("QR code generated successfully!");
            } else {
                setShowMessage("Redemption successful but no QR code generated.");
            }
    
            await fetchUserPoints();
        } catch (err) {
            handleApiError(err, "Error redeeming reward");
            setShowMessage("Error redeeming reward. Please try again.");
        }
    }, [selectedReward, userId, userToken, fetchUserPoints]);
    

    const fetchCheckInHistory = useCallback(async () => {
        if (!userId || !userToken) return;
        
        try {
            const response = await axios.get(`${API_BASE_URL}/users/${userId}/checkins/history`, {
                headers: { Authorization: `Bearer ${userToken}` },
            });
            
            const checkInsData = response.data.map(checkIn => ({
                ...checkIn,
                isProcessed: checkIn.processed
            }));
            
            setCheckInsToday(checkInsData);
            // Removed setRefreshTrigger to avoid loop
        } catch (error) {
            console.error("Error fetching check-in history:", error);
        }
    }, [userId, userToken]);
    
    
    

    useEffect(() => {
        if (userId && userToken) {
            processUnprocessedCheckins();
        }
    }, [userId, userToken, processUnprocessedCheckins]);

  
    const handleCheckInComplete = useCallback(() => {
        setRefreshTrigger((prev) => {
          console.log("Refresh Trigger incremented:", prev + 1);
          return prev + 1;
        });
        // Only fetch history once
        fetchCheckInHistory();
      }, [fetchCheckInHistory]);
      

        
    useEffect(() => {
        if (userId && userToken) {
            fetchCheckInHistory();
        }
    }, [userId, userToken, fetchCheckInHistory]);

    const deleteReward = async (rewardId) => {
        try {
            console.log("Deleting reward with ID:", rewardId);
            
            await axios.delete(`${API_BASE_URL}/users/${userId}/rewards/${rewardId}`, {
                headers: { Authorization: `Bearer ${userToken}` },
            });

            console.log("Reward deleted successfully");
            
            setUserRewards((prevRewards) => 
                prevRewards.filter(reward => reward.id !== rewardId)
            );

        } catch (error) {
            console.error("Error deleting reward:", error);
        }
    };

    useEffect(() => {
        const subscribeToLocation = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") return;

                locationSubscription.current = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.Balanced,
                        timeInterval: 2000,
                        distanceInterval: 200,
                    },
                    (location) => {
                        const { latitude, longitude } = location.coords;
                        console.log("Updated User Location:", latitude, longitude);
                        setUserLocation({ latitude, longitude });
                    }
                );
            } catch (error) {
                console.error("Location watch error:", error);
            }
        };

        if (userId && userToken) subscribeToLocation();
        return () => locationSubscription.current?.remove();
    }, [userId, userToken]);

    const initializeHealthKit = useCallback(() => {
        if (!userId || !userToken || !AppleHealthKit || !BackgroundFetch) {
            console.error("User details or modules are not available for initializing HealthKit.");
            return;
        }

        const healthKitOptions = {
            permissions: {
                read: [AppleHealthKit.Constants.Permissions.StepCount],
            },
        };

        AppleHealthKit.initHealthKit(healthKitOptions, (err) => {
            if (err) {
                console.error("HealthKit initialization failed: ", err);
                return;
            }
            console.log("HealthKit successfully connected");
            fetchAndUpdateStepCount();
            configureBackgroundFetch();
        });
    }, [fetchAndUpdateStepCount, configureBackgroundFetch, userId, userToken]);

const fetchAndUpdateStepCount = useCallback(async () => {
    if (!userId || !userToken) {
        console.error("Cannot sync steps without valid user details");
        return;
    }

    const today = new Date();
    const options = {
        startDate: new Date(today.setHours(0, 0, 0, 0)).toISOString(),
        endDate: new Date().toISOString(),
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

        const newSteps = stepsToday - lastSyncedStepCount;
        if (newSteps <= 0) {
            console.log("No new steps to sync.");
            return;
        }

        const pointsEarned = Math.floor(newSteps / 1000) * 10;

        setUserSteps({
            step_count: stepsToday,
            points_earned: pointsEarned,
            date: new Date().toLocaleDateString(),
        });

        triggerNotification(stepsToday);
        syncStepsToBackend(newSteps, pointsEarned, stepsToday);
    });
}, [syncStepsToBackend, triggerNotification, userId, userToken, lastSyncedStepCount]);

    useEffect(() => {
        if (userId && userToken) {
            initializeHealthKit();
            fetchAndUpdateStepCount();
            stepCountIntervalId.current = setInterval(fetchAndUpdateStepCount, 5 * 60 * 1000);
            return () => {
                if (stepCountIntervalId.current) {
                    clearInterval(stepCountIntervalId.current);
                    stepCountIntervalId.current = null;
                    console.log("Cleared step count interval");
                }
            };
        } else {
            if (stepCountIntervalId.current) {
                clearInterval(stepCountIntervalId.current);
                stepCountIntervalId.current = null;
                console.log("Cleared step count interval due to logout");
            }
        }
    }, [fetchAndUpdateStepCount, initializeHealthKit, userId, userToken]);

    const configureBackgroundFetch = useCallback(() => {
        if (!BackgroundFetch) {
            console.error("BackgroundFetch module is not available");
            return;
        }

        BackgroundFetch.configure(
            { minimumFetchInterval: 15 },
            async (taskId) => {
                console.log("Background fetch task started");
                fetchAndUpdateStepCount();
                BackgroundFetch.finish(taskId);
            },
            (err) => {
                console.error("Background fetch failed to start: ", err);
            }
        );

        BackgroundFetch.start();
    }, [fetchAndUpdateStepCount]);

    const syncStepsToBackend = useCallback(async (steps, pointsEarned, stepsToday) => {
        if (!userId || !userToken) {
          console.error("Cannot sync steps without valid user details");
          return;
        }
      
        try {
          const response = await axios.post(
            `${API_BASE_URL}/users/${userId}/steps`,
            { step_count: steps, points_earned: pointsEarned || 0 },
            { headers: { Authorization: `Bearer ${userToken}` } }
          );
      
          console.log("Steps synced successfully:", response.data);
      
          setUser((prevUser) => ({
            ...prevUser,
            points_earned: (prevUser.points_earned || 0) + (pointsEarned || 0),
          }));
        } catch (error) {
          handleApiError(error, "Error syncing steps");
        }
      }, [userId, userToken]);
      
    
    

    const fetchStepHistory = useCallback(async (currentToken = userToken, currentUserId = userId) => {
        if (!currentUserId || !currentToken) {
            console.warn("Cannot fetch step history: userToken or userId is missing");
            return;
        }
    
        try {
            console.log("Fetching step history from backend...");
            const response = await axios.get(`${API_BASE_URL}/users/${currentUserId}/steps/history`, {
                headers: { Authorization: `Bearer ${currentToken}` },
            });
    
            const backendSteps = response.data || [];
            console.log("Fetched backend step history:", backendSteps);
    
            const formattedBackendSteps = backendSteps.map(step => {
                const parsedDate = new Date(`${step.date}T00:00:00Z`);
                return {
                    ...step,
                    date: parsedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                    step_count: parseInt(step.total_steps, 10),
                    points_earned: parseInt(step.total_points, 10),
                };
            });
    
            setStepsHistory(formattedBackendSteps);
        } catch (error) {
            console.error("Error fetching step history:", error);
        }
    }, [userToken, userId]);

    const redeemReward = useCallback(async (rewardId) => {
        if (!userId || !userToken) {
            console.warn("User ID or token is missing, cannot redeem reward.");
            return;
        }
    
        try {
            const response = await axios.put(
                `${API_BASE_URL}/users/${userId}/userRewards/${rewardId}/redeem`,
                {},
                { headers: { Authorization: `Bearer ${userToken}` } }
            );
    
            if (response.data.qr_code_url) {
                setQrCodeUrl(response.data.qr_code_url);
                setShowMessage("QR code generated successfully!");
            } else {
                setShowMessage("Redemption successful but no QR code generated.");
            }
    
            await fetchUserPoints();
            await fetchUserRewards();
            setUserRewards((prevRewards) => 
                prevRewards.filter(reward => reward.id !== rewardId)
            );
    
        } catch (err) {
            handleApiError(err, "Error redeeming reward");
            setShowMessage("Error redeeming reward. Please try again.");
        }
    }, [userId, userToken, fetchUserPoints, fetchUserRewards]);

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

    const handleCheckIn = useCallback(async () => {
        if (!selectedRestaurant || !userLocation || (checkInsToday[`${userId}-${selectedRestaurant.id}`] || 0) >= 2) {
            Alert.alert("Check-In Unavailable", "You have reached your check-in limit or no restaurant is selected.");
            return;
        }
    
        const distanceToRestaurant = getDistance(
            { latitude: userLocation.latitude, longitude: userLocation.longitude },
            { latitude: selectedRestaurant.latitude, longitude: selectedRestaurant.longitude }
        );
    
        // if (distanceToRestaurant > 60000) { // Ensure it's within 60 meters
        //     Alert.alert("Too Far to Check In", "You must be within 60 meters to check in.");
        //     return;
        // }
    
        try {
            const checkInData = {
                restaurant_id: selectedRestaurant.id,
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
            };
    
            const response = await axios.post(`${API_BASE_URL}/users/${userId}/checkins`, checkInData, {
                headers: { Authorization: `Bearer ${userToken}` },
            });
    
            console.log("Check-in API response:", response.data);
    
            if (response.data.canCheckIn) {
                // Calculate total points from check-in
                const baseCheckInPoints = assignPointsBasedOnDistance(distanceToRestaurant);
                const bonusMultiplierPoints = calculateBonusMultiplierPoints(distanceToRestaurant, baseCheckInPoints);
                const totalPointsEarned = baseCheckInPoints + bonusMultiplierPoints;
    
                // Log the points for debugging
                console.log(`Base Check-In Points: ${baseCheckInPoints}, Multiplier Points: ${bonusMultiplierPoints}, Total Points Earned: ${totalPointsEarned}`);
    
                // Update the user's points
                setUser((prevUser) => ({
                    ...prevUser,
                    points_earned: (prevUser.points_earned || 0) + totalPointsEarned,
                }));
    
                // Trigger the pop-up to display the points earned
                Alert.alert(
                    "Check-In Successful",
                    `You earned ${totalPointsEarned} points!\nCheck-in Points: ${baseCheckInPoints}\nMultiplier Points: ${bonusMultiplierPoints}`
                );
    
                // Immediately fetch updated check-ins and points data
                await fetchUserPoints(); // Update points from backend to ensure sync
                await fetchCheckInHistory();
                setRefreshTrigger((prev) => prev + 1); // Trigger update in CheckinContainer
            } else {
                console.warn("Check-in failed or already processed");
            }
        } catch (err) {
            if (err.response?.status === 409) {
                Alert.alert("Check-In Conflict", "It looks like you've already checked in here today.");
            } else {
                console.error("Error during check-in:", err);
                Alert.alert("Check-In Failed", "Please try again.");
            }
        }
    }, [selectedRestaurant, userLocation, checkInsToday, userId, userToken, fetchUserPoints, fetchCheckInHistory, assignPointsBasedOnDistance, calculateBonusMultiplierPoints]);
    
    
    
    
    
      
    
    
    

    const calculateTotalPoints = () => checkInPoints + multiplierPoints;

    const stopVoiceDirections = useCallback(() => {
        console.log("Attempting to stop voice directions...");
        setIsVoiceEnabled(false);
    }, []);

    const updateIsNearRestaurant = useCallback((restaurantLocation) => {
        const proximityThreshold = 20000;
        if (!restaurantLocation || !userLocation) return;

        const distanceToRestaurant = getDistance(
            { latitude: userLocation.latitude, longitude: userLocation.longitude },
            { latitude: restaurantLocation.latitude, longitude: restaurantLocation.longitude }
        );
        console.log(`Distance to restaurant: ${distanceToRestaurant}`);
        setIsNearRestaurant(distanceToRestaurant <= proximityThreshold);
    }, [userLocation]);

    const checkNearbyRestaurants = useCallback(() => {
        if (!userLocation.latitude || !userLocation.longitude || !nearbyPlaces.length) return;

        const proximityRadius = 10000;
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

    const selectRestaurant = useCallback((restaurant) => {
        if (!restaurant) {
            console.error("Restaurant object not found:", restaurant);
            return;
        }

        const selected = {
            ...restaurant,
            latitude: parseFloat(restaurant.latitude || restaurant?.location?.lat),
            longitude: parseFloat(restaurant.longitude || restaurant?.location?.lng),
        };

        if (isNaN(selected.latitude) || isNaN(selected.longitude)) {
            console.error("Selected restaurant has invalid coordinates:", selected);
            return;
        }

        setSelectedRestaurant(selected);
        updateIsNearRestaurant(selected);
    }, [updateIsNearRestaurant]);

    const fetchUserPoints = useCallback(async (currentToken = userToken, currentUserId = userId) => {
        if (!currentToken || !currentUserId) {
            console.warn("Cannot fetch user points: userToken or userId is missing");
            return;
        }
    
        try {
            console.log("Fetching points for user:", currentUserId);
            const response = await axios.get(`${API_BASE_URL}/users/${currentUserId}/points`, {
                headers: { Authorization: `Bearer ${currentToken}` },
            });
    
            const fetchedPoints = Number(response.data.points) || 0; // Ensure it's a number
            console.log("Fetched points:", fetchedPoints);
    
            setUser(prevUser => ({
                ...prevUser,
                points_earned: fetchedPoints,
            }));
        } catch (error) {
            console.error("Error fetching user points:", error);
        }
    }, [userToken, userId]);
    
    
    

    const  updateUserPoints = useCallback((pointsEarned) => {
        const parsedPoints = Number(pointsEarned) || 0;
        const previousPoints = Number(user.points_earned) || 0;
        const newPoints = previousPoints + parsedPoints;
        console.log(`Updating points: previous=${previousPoints}, added=${parsedPoints}, new=${newPoints}`);
        setUser(prevUser => ({
            ...prevUser,
            points_earned: newPoints,
        }));
        fetchUserPoints();
    }, [fetchUserPoints, user.points_earned]);
    

    const selectReward = useCallback((reward) => {
        if (reward === null) {
            setSelectedReward(null);
            console.log("Cleared selected reward");
        } else if (reward && reward.id) {
            setSelectedReward(reward);
            console.log("Selecting reward:", reward.id);
        } else {
            console.warn("Attempted to select an invalid reward:", reward);
        }
    }, []);

    useEffect(() => {
        if (userToken && userId) {
            console.log("Refreshing user data for user ID:", userId);
            fetchUserPoints();
            fetchStepHistory();
        } else {
            console.warn("Cannot fetch user points or step history: userToken or userId is missing");
        }
    }, [userToken, userId, fetchUserPoints, fetchStepHistory]);

    const scheduleRandomPings = useCallback(() => {
        const intervals = [0, 3, 6, 9, 12].map(hours => hours * 60 * 60);
        intervals.forEach(interval => {
            setTimeout(() => sendRandomRestaurantPing(), interval * 1000);
        });
    }, [sendRandomRestaurantPing]);

    const sendRandomRestaurantPing = useCallback(() => {
        if (!restaurants.length) return;

        const randomIndex = Math.floor(Math.random() * restaurants.length);
        const randomRestaurant = restaurants[randomIndex];

        Notifications.scheduleNotificationAsync({
            content: {
                title: `Check out ${randomRestaurant.name}!`,
                body: 'Visit here for even more points!'
            },
            trigger: { seconds: Math.floor(Math.random() * 60 * 60 * 5) },
        });
    }, [restaurants]);

    useEffect(() => {
        if (userLocation.latitude && userLocation.longitude) {
            checkNearbyRestaurants();
        }
    }, [userLocation, checkNearbyRestaurants]);

    useEffect(() => {
        scheduleRandomPings();
    }, [scheduleRandomPings]);

    useEffect(() => {
        console.log("Updated user location:", userLocation);
    }, [userLocation]);

    const logoutUser = useCallback(async (navigation) => {
        try {
            if (stepCountIntervalId.current) {
                clearInterval(stepCountIntervalId.current);
                stepCountIntervalId.current = null;
                console.log("Cleared step count interval on logout");
            }

            if (locationSubscription.current) {
                locationSubscription.current.remove();
                locationSubscription.current = null;
                console.log("Removed location subscription on logout");
            }

            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userId');

            setUserToken(null);
            setUserId(null);
            console.log('User logged out successfully');

            setUser({ points_earned: 0 });
            setUserLocation({ latitude: 40.743175215962026, longitude: -73.94192180308748 });
            setSelectedRestaurant(null);
            setDirections([]);
            setUserSteps({ step_count: 0, date: '' });
            setQrCodeUrl(null);
            setShowMessage("");
            setLastSyncedStepCount(0);

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

    return (
        <AuthContext.Provider
            value={{
                login,
                logout: logoutUser,
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
                fetchUserPoints,
                updateUserPoints,
                userRewards,
                setUserRewards,
                selectRestaurant,
                qrCodeUrl,
                showMessage,
                checkInsToday,
                setCheckInsToday,
                checkInPoints,
                multiplierPoints,
                fetchStepHistory,
                stepsHistory,
                fetchCheckInHistory,
                refreshTrigger,
                setRefreshTrigger,
                resetModalStates,
                redeemReward,
                deleteReward,
                handleCheckInComplete,
                handleCheckIn,
                setCheckInPoints,
                setMultiplierPoints,
                setTotalPoints,
                currentCheckInPoints,
                totalPoints,
                calculateTotalPoints,
                filteredRestaurants,
                processUnprocessedCheckins,
                setShowMessage,
               
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
