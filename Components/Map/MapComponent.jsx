import React, { useEffect, useState, useRef, useContext } from "react";
import MapView, { Marker, PROVIDER_GOOGLE, AnimatedRegion, Polyline } from "react-native-maps";
import { StyleSheet, Animated } from "react-native";
import * as Location from "expo-location";
import { AuthContext } from "../../Context/AuthContext";
import yumLogo from "../../assets/yummm.png";

// COMPONENTS
import RestaurantMarker from "./RestaurantMarker";

const MapComponent = ({ setSideModalVisible }) => {
  const { setUserLocation, userLocation, directions, restaurants, handleGetDirections, selectedRestaurant } = useContext(AuthContext);

  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const mapViewRef = useRef(null);
  const [heading, setHeading] = useState(0);

  const animatedRegion = useRef( // USER LOCATION
    new AnimatedRegion({
      latitude: 40.743175215962026, //Initial latitude
      longitude: -73.94192180308748, // Initial longitude
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    })
  ).current;

  useEffect(() => {
    let locationSubscription = null;

    const watchUserLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.error("Permission to access location was denied");
          return;
        }

        // Watch user's position and heading
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced, // Optimized accuracy for better battery usage
            timeInterval: 2000, // Adjusted to 2 seconds to save battery
            distanceInterval: 5, // Update every 5 meters
          },
          (location) => {
            const { latitude, longitude, heading } = location.coords;

            // Update the animated region (for smooth movement)
            animatedRegion
              .timing({
                latitude,
                longitude,
                duration: 500,
                useNativeDriver: false,
              })
              .start();

            // Update the current location and heading
            setUserLocation({
              latitude,
              longitude,
            });

            setHeading(heading || 0);
          }
        );
      } catch (error) {
        console.error("Error watching user location:", error);
      }
    };

    // Start the pulse animation for the logo marker
    const startPulseAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.5,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    watchUserLocation();
    startPulseAnimation();

    // Cleanup function to remove the location watcher
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  useEffect(async () => {
    if (mapViewRef.current) {
      mapViewRef.current.animateToRegion(
        {
          latitude: userLocation?.latitude || 40.775818,
          longitude: userLocation?.longitude || -73.972761,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
    }

    // Update Polyline as the user moves. Selected Restaurant will be an object with the current restaurant selected for travel. 
    if(selectedRestaurant.id){
      await handleGetDirections()
    }

    // Optionally fetch nearby places
    // fetchNearByPlaces();
  }, [userLocation]);

  return (
    <MapView
      ref={mapViewRef}
      // provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={{
        latitude: userLocation?.latitude || 37.78825,
        longitude: userLocation?.longitude || -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
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
                  { scale: pulseAnimation }, // Apply pulse animation to the logo
                  { rotate: `${heading}deg` }, // Rotate based on the heading
                ],
              },
            ]}
            resizeMode="contain"
          />
        </Marker.Animated>
      )}

      {/* Marker for each restaurant */}
      {restaurants.map((restaurant, index) => (
        <RestaurantMarker restaurant={restaurant} key={index} setSideModalVisible={setSideModalVisible}/>
      ))}

      {/* Directions Polyline */}
      {directions.length > 0 && (
        <Polyline
          coordinates={directions}
          strokeColor="#007AFF"
          strokeWidth={4}
        />
      )}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "95%",
  },
  logo: {
    width: 50,
    height: 50,
  },
  closeButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#ff5252",
    padding: 10,
    borderRadius: 10,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default MapComponent;
