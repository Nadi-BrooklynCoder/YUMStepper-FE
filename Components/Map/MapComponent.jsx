import React, { useContext, useRef, useEffect, useState, useCallback } from "react";
import { StyleSheet, Animated, Image, View, Text, ScrollView, TouchableOpacity } from "react-native";
import { AuthContext } from "../../Context/AuthContext";
import ForwardedMapView from './ForwardedMapView';
import RestaurantMarker from "./RestaurantMarker";
import { Marker, PROVIDER_GOOGLE, Polyline, AnimatedRegion } from 'react-native-maps';
// import * as Speech from 'expo-speech';
import { getDistance } from 'geolib';
import { debounce } from 'lodash';

const yumLogo = require("../../assets/yummm.png");
const foodIcon = require("../../assets/food-icon.png");
const locationIcon = require("../../assets/location-icon.png");

const MapComponent = ({ setSideModalVisible, selectRestaurant, restaurants = [] }) => {
    const { 
        user,
        userLocation, 
        directions, 
        nearbyPlaces, 
        selectedRestaurant,  
        heading, 
        directionsText,
        isVoiceEnabled,
        setIsVoiceEnabled,
        stopVoiceDirections,
        syncStepsToBackend,
        userSteps,
        calculateTotalPoints,
        filteredRestaurants
    } = useContext(AuthContext);

    const [directionsActive, setDirectionsActive] = useState(false);
    const [markerSize, setMarkerSize] = useState(50);
    const [pulseAnimation] = useState(new Animated.Value(1));
    const [isTextLarge, setIsTextLarge] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [steps, setSteps] = useState([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isLoadingLocation, setIsLoadingLocation] = useState(true);
    const mapViewRef = useRef(null);
    const animatedRegion = useRef(
        new AnimatedRegion({
            latitude: userLocation?.latitude || 40.743175215962026,
            longitude: userLocation?.longitude || -73.94192180308748,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        })
    ).current;

    const restaurantList = typeof filteredRestaurants !== 'undefined' && filteredRestaurants.length > 0 
    ? filteredRestaurants 
    : restaurants;

    const pointsEarned = Number(user.points_earned) || 0;

    useEffect(() => {
        if (userLocation?.latitude && userLocation?.longitude) {
            setIsLoadingLocation(false);
        } else {
            setIsLoadingLocation(true);
        }
    }, [userLocation]);

    const debouncedSyncSteps = useCallback(
        debounce(() => {
            if (userSteps?.step_count > 0 && userSteps?.points_earned >= 0) {
                setIsSyncing(true);
                syncStepsToBackend(userSteps.step_count, userSteps.points_earned)
                    .then(() => setIsSyncing(false))
                    .catch((err) => {
                        console.error("Error syncing steps:", err);
                        setIsSyncing(false);
                    });
                console.log("Syncing steps on location change");
            } else {
                console.warn("User steps data is incomplete or missing, sync skipped");
            }
        }, 5000),
        [userSteps]
    );

    const centerMapOnUserLocation = () => {
        if (mapViewRef.current && userLocation) {
            mapViewRef.current.animateToRegion({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 500);
        }
    };

    useEffect(() => {
        if (userLocation?.latitude !== undefined && userLocation?.longitude !== undefined && mapViewRef.current) {
            const distanceMoved = getDistance(
                { latitude: animatedRegion.latitude._value, longitude: animatedRegion.longitude._value },
                { latitude: userLocation.latitude, longitude: userLocation.longitude }
            );

            if (distanceMoved > 50) { // Only update if moved more than 50 meters
                mapViewRef.current.animateToRegion(
                    {
                        latitude: userLocation.latitude,
                        longitude: userLocation.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    },
                    500
                );

                animatedRegion
                    .timing({
                        latitude: userLocation.latitude,
                        longitude: userLocation.longitude,
                        duration: 500,
                        useNativeDriver: false,
                    })
                    .start();

                debouncedSyncSteps(); // Trigger debounced sync when the user location updates
            }
        }
    }, [userLocation]);

    useEffect(() => {
        setDirectionsActive(
            selectedRestaurant?.id &&
            selectedRestaurant?.latitude &&
            selectedRestaurant?.longitude &&
            Array.isArray(directions) &&
            directions.length > 0
        );
        if (directionsText) {
            setSteps(directionsText.split("\n").filter(Boolean)); // Split directions text into steps and filter out empty strings
        }
    }, [selectedRestaurant, directions, directionsText]);

    // useEffect(() => {
    //     if (isVoiceEnabled && directionsActive && steps.length > 0) {
    //         speakCurrentStep(); // Start speaking the first step
    //     }
    // }, [steps, isVoiceEnabled, directionsActive]);

    // const speakCurrentStep = () => {
    //     if (steps.length > 0 && steps[currentStepIndex]) {
    //         const currentStep = steps[currentStepIndex];
    //         if (currentStep) {
    //             Speech.stop(); // Stop any ongoing speech before starting a new one
    //             Speech.speak(currentStep.toString(), {
    //                 rate: 0.9,
    //                 pitch: 1.0,
    //                 onError: (error) => console.error('Speech Error: ', error),
    //             });
    //         }
    //     }
    // };

    useEffect(() => {
        if (userLocation && directions?.length > 0 && currentStepIndex < directions.length) {
            const currentStepCoords = directions[currentStepIndex];
            if (currentStepCoords) {
                const distanceToStepEnd = getDistance(
                    { latitude: userLocation.latitude, longitude: userLocation.longitude },
                    { latitude: currentStepCoords.latitude, longitude: currentStepCoords.longitude }
                );

                if (distanceToStepEnd < 20) {
                    setCurrentStepIndex((prevIndex) => prevIndex + 1);
                }
            }
        }
    }, [userLocation, currentStepIndex, directions]);

    // useEffect(() => {
    //     if (currentStepIndex < steps.length) {
    //         speakCurrentStep();
    //     }
    // }, [currentStepIndex]);

    useEffect(() => {
        const animatePulse = () => {
            Animated.sequence([
                Animated.timing(pulseAnimation, {
                    toValue: 1.2,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnimation, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]).start(() => animatePulse());
        };

        animatePulse();

        return () => {
            pulseAnimation.stopAnimation();
        };
    }, []);

    const handleRegionChange = (region) => {
        if (region?.longitudeDelta) {
            const zoomLevel = region.longitudeDelta;
            const newSize = 50 / zoomLevel;
            setMarkerSize(Math.max(30, Math.min(newSize, 100)));
        }
    };

    const enableVoice = () => {
        if (!isVoiceEnabled) {
            speakCurrentStep();
            setIsVoiceEnabled(true);
        }
    };

    const disableVoice = () => {
        if (isVoiceEnabled) {
            stopVoiceDirections();
            setIsVoiceEnabled(false);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <ForwardedMapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                onRegionChangeComplete={handleRegionChange}
                initialRegion={{
                    latitude: userLocation?.latitude || 40.743175215962026,
                    longitude: userLocation?.longitude || -73.94192180308748,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                ref={mapViewRef}
            >
                {userLocation && (
                    <Marker.Animated coordinate={animatedRegion}>
                        <Animated.Image
                            source={yumLogo}
                            style={[
                                styles.logo,
                                {
                                    width: markerSize,
                                    height: markerSize,
                                    transform: [
                                        { scale: pulseAnimation },
                                        { rotate: `${heading || 0}deg` },
                                    ],
                                },
                            ]}
                            resizeMode="contain"
                        />
                    </Marker.Animated>
                )}

                {!directionsActive && (
                    <>
                        {(filteredRestaurants?.length > 0 ? filteredRestaurants : restaurants).map((restaurant, idx) => {
                                console.log("Restaurant ID:", restaurant.id, "Cuisine:", restaurant.cuisine_type, "Total Points:", restaurant.totalPoints);


                            return (
                                <RestaurantMarker
                                    key={`restaurant-${idx}`}
                                    restaurant={restaurant} // Pass the restaurant object directly with its updated totalPoints
                                    setSideModalVisible={setSideModalVisible}
                                    selectRestaurant={selectRestaurant}
                                    zoomLevel={markerSize}
                                />
                            );
                        })}
                    </>
                )}

                {directionsActive && Array.isArray(directions) && directions.length > 0 && (
                    <>
                        <Polyline
                            coordinates={directions}
                            strokeColor="#007AFF"
                            strokeWidth={4}
                        />
                        {directions[directions.length - 1] && (
                            <Marker
                                coordinate={directions[directions.length - 1]}
                            >
                                <View style={{ alignItems: 'center' }}>
                                    <Image source={foodIcon} style={styles.markerImage} resizeMode="contain" />
                                    <Text style={styles.markerText}>Destination</Text>
                                </View>
                            </Marker>
                        )}
                    </>
                )}
            </ForwardedMapView>

            {directionsActive && steps.length > 0 && (
                <ScrollView style={styles.directionsTextContainer}>
                    {steps.map((line, index) => (
                        <View key={index} style={[
                            styles.directionsTextItem,
                            index === currentStepIndex && styles.activeStep
                        ]}>
                            <Text style={[
                                index === currentStepIndex ? styles.mainStepText : styles.minimizedStepText,
                                isTextLarge && styles.largeText
                            ]}>
                                {index + 1}. {line}
                            </Text>
                        </View>
                    ))}
                </ScrollView>
            )}

            {directionsActive && (
                <View style={styles.accessibilityControls}>
                    <TouchableOpacity 
                        style={styles.accessibilityButton} 
                        onPress={isVoiceEnabled ? disableVoice : enableVoice}
                    >
                        <Text style={styles.accessibilityButtonText}>
                            {isVoiceEnabled ? "Disable Voice" : "Enable Voice"}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.accessibilityButton} 
                        onPress={() => setIsTextLarge(!isTextLarge)}
                    >
                        <Text style={styles.accessibilityButtonText}>
                            {isTextLarge ? "Smaller Text" : "Larger Text"}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
              <TouchableOpacity style={styles.locationButton} onPress={centerMapOnUserLocation}>
                <Image source={locationIcon} style={styles.locationIcon} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    map: {
        width: "100%",
        height: "100%",
    },
    logo: {
        width: 50,
        height: 50,
    },
    markerImage: {
        width: 40,
        height: 40,
    },
    directionsTextContainer: {
        position: 'absolute',
        bottom: 80, 
        left: 10,
        right: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        padding: 10,
        maxHeight: '35%',
        zIndex: 20, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    directionsTextItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: 4,
    },
    mainStepText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    minimizedStepText: {
        fontSize: 12,
        color: '#666',
    },
    largeText: {
        fontSize: 22,
    },
    activeStep: {
        backgroundColor: '#d0f0fd',
        borderRadius: 5,
    },
    accessibilityControls: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        flexDirection: 'row',
    },
    accessibilityButton: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    accessibilityButtonText: {
        color: '#fff',
        fontSize: 14,
    },
    locationButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#ffffff',
        padding: 10,
        borderRadius: 25,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    locationIcon: {
        width: 30,
        height: 30,
    },
});

export default MapComponent;
