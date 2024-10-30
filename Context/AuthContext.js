import React, { createContext, useState, useEffect, useMemo, useCallback, useRef } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDistance } from 'geolib';
import { API_BASE_URL } from '@env';
import axios from "axios";
import { debounce } from 'lodash';
import { Platform, Alert } from 'react-native';
import * as Speech from 'expo-speech';


// Modules that are not available on web
import AppleHealthKit from 'react-native-health';
import BackgroundFetch from 'react-native-background-fetch';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // State Variables
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState({});
    // const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });
    const [userLocation, setUserLocation] = useState({
        latitude: 40.73061,  // Default coordinates (e.g., NYC)
        longitude: -73.935242
    });
    const [directions, setDirections] = useState([]);
    const [userSteps, setUserSteps] = useState({ step_count: 0, date: '' });
    const [directionSteps, setDirectionSteps] = useState(0);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [restaurants, setRestaurants] = useState([]);
    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const [isNearRestaurant, setIsNearRestaurant] = useState(false);
    const [selectedReward, setSelectedReward] = useState({});
    const [lastNotifiedStepCount, setLastNotifiedStepCount] = useState(0);
    const [heading, setHeading] = useState(0); 
    const [directionsText, setDirectionsText] = useState("");
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
    const [userPoints, setUserPoints] = useState(0);

    const hasFetchedUser = useRef(false); // To prevent multiple fetches


    // Utility function for error handling
    const handleApiError = (error, customMessage) => {
        const errorMessage = error.response?.data || error.message || "An error occurred";
        console.error(`${customMessage}. Details: ${JSON.stringify(errorMessage)}`);
    };

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
            setUser(response.data);
            console.log('User data fetched successfully:', response.data);
            hasFetchedUser.current = true;
        } catch (err) {
            handleApiError(err, "Error fetching user data");
        }
    }, []);

      
  

    // Effect to fetch user data when userId and userToken change
    useEffect(() => {
        if (userId && userToken && !hasFetchedUser.current) {
            fetchUserData(userId, userToken);
        }
    }, [userId, userToken, fetchUserData]);

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
            setUserToken(token);
            setUserId(userId);
            if (navigation) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Profile' }],
                });
            }
        } catch (e) {
            console.error('Error during login:', e);
        }
    };

      

    // Check Login Status
    const checkLoginStatus = async () => {
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
    };

    // Effect: On Mount
   

    const fetchInitialLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status === "granted") {
                const location = await Location.getCurrentPositionAsync({});
                const { latitude, longitude } = location.coords;
                setUserLocation({ latitude, longitude });
                console.log("Inital location fetched: ", { latitude, longitude });
            }
        } catch (error) {
            console.error("Error fetching initial location: ". error)
        }
    }

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

        return () => {
            debouncedFetchNearByPlaces.cancel(); // Cleanup debounced function
        };
    }, [userLocation, debouncedFetchNearByPlaces]);

    // Fetch Nearby Places with debouncing to minimize API calls
    const fetchNearByPlaces = async () => {

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
    };

    const debouncedFetchNearByPlaces = useCallback(debounce(fetchNearByPlaces, 10000), [userLocation]);

    // Get Directions from Google Maps with improved error handling
   // Inside AuthContext.js
   const getDirectionsFromGoogleMaps = async () => {
    if (!userLocation.latitude || !userLocation.longitude) {
        console.error("User location is not available");
        return;
    }

    if (!selectedRestaurant?.latitude || !selectedRestaurant?.longitude) {
        console.error("Selected restaurant location is not available");
        return;
    }

    console.log("Fetching directions from:", userLocation, "to:", selectedRestaurant)

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
};






   


   

// Watch User Location
useEffect(() => {
    let locationSubscription = null;

    const subscribeToLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Location Permission Denied", "Please enable location access.");
                return; // Exit if permission is not granted
            }

            // Set up the location watcher if permission is granted
            locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.Balanced,
                    timeInterval: 2000,
                    distanceInterval: 5,
                },
                (location) => {
                    const { latitude, longitude, heading: locationHeading } = location.coords;
                    setUserLocation({ latitude, longitude });
                    console.log("Updated user location:", { latitude, longitude });
                    setHeading(locationHeading || 0);
                    console.log("User location updated:", { latitude, longitude, heading: locationHeading });
                }
            );
        } catch (error) {
            console.error("Error watching user location:", error);
        }
    };

    subscribeToLocation();

    return () => {
        if (locationSubscription && typeof locationSubscription.remove === 'function') {
            console.log("Removing location subscription");
            locationSubscription.remove();
        } else {
            console.warn("No valid location subscription to remove");
        }
    };
}, [userId]);

    const updateLocationManually = (newLatitude, newLongitude) => {
        setUserLocation({ latitude: newLatitude, longitude: newLongitude });
    }



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
    
            const stepsToday = results.reduce((total, step) => total + step.value, 0) || 0;
            console.log(`Total steps today: ${stepsToday}`);

            //Calculate points earned
            const pointsEarned = Math.floor(stepsToday / 1000) * 10 || 0;

            setUserSteps({
                step_count: stepsToday,
                points_earned: pointsEarned,
                date: new Date().toLocaleDateString(),
            });

            triggerNotification(stepsToday); // Trigger notification if milestone reached
            syncStepsToBackend(stepsToday, pointsEarned); // Sync steps to backend
        });
    };
    

    // Sync steps with improved error handling
    const syncStepsToBackend = async (steps, pointsEarned) => {
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
                    points_earned: pointsEarned,
                },
                {
                    headers: {
                        Authorization: `Bearer ${userToken}`, // Retained Authorization header for step syncing
                    },
                }
            );
            console.log("Steps and points synced successfully: ", response.data);
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

    const applyRestaurantBonus = (steps, distance) => {
        let multiplier = 1;
        let bonusPoints = 0;

        if (distance > 1609) { //1 mi
            multiplier = 1.5;
        }
        if (distance > 3218) { //2 mi
            multiplier = 2;
        } 
        if (distance > 4827) { //3mi
            multiplier = 3;
        }

        const basePoints = Math.floor(steps / 1000) * 10;
        const totalPoints = basePoints * multiplier;
        bonusPoints = 25; // 30-point completion bonus

        return {
            totalPoints: Math.floor(totalPoints),
            bonusPoints
        };
    };



    const distanceToRestaurant = useMemo(() => {
        if (
          userLocation.latitude != null &&
          userLocation.longitude != null &&
          selectedRestaurant &&
          selectedRestaurant.latitude != null &&
          selectedRestaurant.longitude != null
        ) {
          return getDistance(
            {
              latitude: parseFloat(userLocation.latitude),
              longitude: parseFloat(userLocation.longitude),
            },
            {
              latitude: parseFloat(selectedRestaurant.latitude),
              longitude: parseFloat(selectedRestaurant.longitude),
            }
          );
        } else {
          return null;
        }
      }, [userLocation, selectedRestaurant]);
      

  useEffect(() => {
    console.log('User Location:', userLocation);
    console.log('Selected Restaurant:', selectedRestaurant);
    console.log('Distance to Restaurant:', distanceToRestaurant);

    if (distanceToRestaurant !== null && distanceToRestaurant <= 150) { // change back to
      setIsNearRestaurant(true);
      console.log('User is near the restaurant.');
    } else {
      setIsNearRestaurant(false);
      console.log('User is not near the restaurant.');
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

    const stopVoiceDirections = () => {
        console.log("Attempting to stop voice directions...")
        Speech.stop();
        setIsVoiceEnabled(false)
    }

    const checkNearbyRestaurants = useCallback(() => {
        if (!userLocation.latitude || !userLocation.longitude || !restaurants.length) return;
    
        const proximityRadius = 200; // Define proximity radius as needed
    
        restaurants.forEach((restaurant) => {
            const distance = getDistance(
                { latitude: userLocation.latitude, longitude: userLocation.longitude },
                { latitude: parseFloat(restaurant.latitude), longitude: parseFloat(restaurant.longitude) }
            );
    
            if (distance <= proximityRadius) {
                Notifications.scheduleNotificationAsync({
                    content: {
                        title: `You're near ${restaurant.name}`,
                        body: 'Walk there now to earn extra points!',
                    },
                    trigger: { seconds: 1 },
                });
            }
        });
    }, [userLocation, restaurants]);

    //fetch points
    const fetchUserPoints = useCallback(async () => {
        if (!userToken || !userId) return;

        try {
            const response = await axios.get(`${API_BASE_URL}/users/${userId}/points`, {
                headers: { Authorization: `Bearer ${userToken}` },
            });
            setUserPoints(response.data.points);
        } catch (error) {
            console.error("Error fetching user points:", error);
        }
    }, [userToken, userId]);

    //update points locally after check-in
    const updateUserPoints = useCallback((pointsEarned) => {
        setUserPoints(prevPoints => prevPoints + pointsEarned);
}, []);
    

    useEffect(() => {
        fetchUserPoints();
    }, [fetchUserPoints]);
    
    // Implementing a better random ping scheduler
    const scheduleRandomPings = useCallback(() => {
        const intervals = [0, 3, 6, 9, 12].map(hours => hours * 60 * 60); // 3 hours interval
        intervals.forEach(interval => {
            setTimeout(() => sendRandomRestaurantPing(), interval * 1000);
        })
    },[]);

    const sendRandomRestaurantPing = () => {
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
    }

    // Logout Function
    const logout = async (navigation) => {
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
            setUserLocation({ latitude: 40.73061, 
                longitude: -73.935242 });
            setSelectedRestaurant(null);
            setDirections([]);
            setUser({});
            setUserSteps({ step_count: 0, date: '' });
            setIsLoading(false);
            if (navigation) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home' }],
                });
            }
        } catch (e) {
            console.error('Error during logout:', e);
        }
    }; 

    useEffect(() => {
        if (userLocation.latitude && userLocation.longitude) {
            checkNearbyRestaurants();
        }
    }, [userLocation, checkNearbyRestaurants]);

    useEffect(() => {
        scheduleRandomPings();
    }, [])



useEffect(() => {
    console.log("Updated user location:", userLocation);
}, [userLocation]);

useEffect(() => {
    checkLoginStatus();
    fetchInitialLocation();
        fetchNearByPlaces();
}, []);


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
                directionsText,
                fetchNearByPlaces,
                stepsToPoints,
                nearbyPlaces,
                user,
                setUser,
                selectedReward,
                setSelectedReward,
                calculateSteps,
                setRestaurants,
                heading,
                isNearRestaurant,
                setIsNearRestaurant,
                applyRestaurantBonus,
                triggerNotification,
                syncStepsToBackend,
                isVoiceEnabled,
                setIsVoiceEnabled,
                stopVoiceDirections,
                updateLocationManually,
                userPoints,
                fetchUserPoints,
                updateUserPoints
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
