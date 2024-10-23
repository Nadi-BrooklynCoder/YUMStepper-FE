// MapComponent.js
import React, { useContext, useRef, useEffect, useState } from "react";
import { StyleSheet, Animated, Image, View, Text, Alert } from "react-native";
import { AuthContext } from "../../Context/AuthContext";
import ForwardedMapView from './ForwardedMapView';
import RestaurantMarker from "./RestaurantMarker";
import { Marker, AnimatedRegion, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';

// Importing images
const yumLogo = require("../../assets/yummm.png");
const foodIcon = require("../../assets/food-icon.png"); // Ensure this path is correct

const MapComponent = ({ setSideModalVisible }) => {
    const { 
        userLocation, 
        directions, 
        nearbyPlaces, 
        selectedRestaurant, 
        setSelectedRestaurant, 
        restaurants, 
        heading 
    } = useContext(AuthContext);

    // Define directionsActive state
    const [directionsActive, setDirectionsActive] = useState(false);

    // Pulse animation for user location marker
    const pulseAnimation = useRef(new Animated.Value(1)).current;

    // Reference to the MapView
    const mapViewRef = useRef(null);

    // AnimatedRegion for smooth marker movement
    const animatedRegion = useRef(
        new AnimatedRegion({
            latitude: userLocation?.latitude || 40.743175215962026,
            longitude: userLocation?.longitude || -73.94192180308748,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        })
    ).current;

    // Effect to animate the map when userLocation changes
    useEffect(() => {
        if (userLocation && mapViewRef.current) {
            mapViewRef.current.animateToRegion(
                {
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                },
                500
            );

            // Update animatedRegion for smooth marker movement
            animatedRegion.timing({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                duration: 500,
                useNativeDriver: false,
            }).start();
        }
    }, [userLocation]);

    // Effect to manage directionsActive state based on directions and selectedRestaurant
    useEffect(() => {
        if (selectedRestaurant?.id && directions.length > 0) {
            setDirectionsActive(true);
        } else {
            setDirectionsActive(false);
        }
    }, [selectedRestaurant, directions]);

    // Effect to handle pulse animation
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

    watchUserLocation();
    startPulseAnimation();

        // Cleanup on unmount
        return () => {
            pulseAnimation.stopAnimation();
        };
    }, []);

    return (
        <ForwardedMapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
                latitude: userLocation?.latitude || 40.743175215962026,
                longitude: userLocation?.longitude || -73.94192180308748,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            }}
            ref={mapViewRef}
            onPress={() => {
                console.log("Map pressed, resetting selected restaurant.");
                setSelectedRestaurant({});
            }}
        >
            {/* Marker for the user's current location */}
            {userLocation && (
                <Marker.Animated coordinate={animatedRegion}>
                    <Animated.Image
                        source={yumLogo}
                        style={[
                            styles.logo,
                            {
                                transform: [
                                    { scale: pulseAnimation },
                                    { rotate: `${heading}deg` },
                                ],
                            },
                        ]}
                        resizeMode="contain"
                    />
                </Marker.Animated>
            )}

            {/* Render Restaurant Markers only if directions are not active */}
            {!directionsActive && (
                <>
                    {nearbyPlaces?.map((restaurant, index) => (
                        <RestaurantMarker
                            restaurant={restaurant}
                            key={`nearby-${index}`}
                            setSideModalVisible={setSideModalVisible}
                        />
                    ))}
                    {restaurants?.map((restaurant, idx) => (
                        <RestaurantMarker
                            restaurant={restaurant}
                            key={`restaurant-${idx}`}
                            setSideModalVisible={setSideModalVisible}
                        />
                    ))}
                </>
            )}

            {/* Directions Polyline */}
            {/* Directions Polyline */}
{directions.length > 0 && directions[directions.length - 1] && (
    <>
        <Polyline
            coordinates={directions}
            strokeColor="#007AFF"
            strokeWidth={4}
        />
        <Marker
            coordinate={{
                latitude: directions[directions.length - 1].latitude,
                longitude: directions[directions.length - 1].longitude,
            }}
        >
            <Image source={foodIcon} style={styles.markerImage} resizeMode="contain" />
        </Marker>
    </>
)}

        </ForwardedMapView>
    );
};

const styles = StyleSheet.create({
    map: {
        width: "100%",
        height: "100%", // Ensure the map takes full height
    },
    logo: {
        width: 50,
        height: 50,
    },
    markerImage: {
        width: 40,
        height: 40,
    },
});

export default MapComponent;
