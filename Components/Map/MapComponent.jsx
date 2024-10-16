import React, { useEffect, useState, useRef, useContext } from "react";
import { Marker, PROVIDER_GOOGLE, AnimatedRegion, Polyline} from "react-native-maps";
import ForwardedMapView from "../Map/ForwardedMapView";
import { StyleSheet, Animated, Linking, Image } from "react-native";
import * as Location from "expo-location";
import { AuthContext } from "../../Context/AuthContext";
import foodIcon from "../../assets/food-icon.png"; // Import the same icon
import yumLogo from "../../assets/yummm.png";

// COMPONENTS
import RestaurantMarker from "./RestaurantMarker";

const MapComponent = ({ setSideModalVisible }) => {
  const { setUserLocation, userLocation, directions, nearbyPlaces, selectedRestaurant, setSelectedRestaurant, userId } = useContext(AuthContext);

  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const mapViewRef = useRef(null);
  const [heading, setHeading] = useState(0);
  const [directionsActive, setDirectionsActive] = useState(false);

  const animatedRegion = useRef(
    new AnimatedRegion({
      latitude: 40.743175215962026,
      longitude: -73.94192180308748,
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
          alert("Please allow location access in settings to use this feature.");
          Linking.openSettings();
          return;
        }

        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
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
            const { latitude, longitude, heading } = location.coords;

            animatedRegion
              .timing({
                latitude,
                longitude,
                duration: 500,
                useNativeDriver: false,
              })
              .start();

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

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [userId]);

  useEffect(() => {
    const updateMapAndDirections = async () => {
      if (mapViewRef.current) {
        mapViewRef.current.animateToRegion(
          {
            latitude: userLocation?.latitude,
            longitude: userLocation?.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          500
        );
      }

      if (selectedRestaurant.id && directions.length > 0) {
        setDirectionsActive(true);
      } else {
        setDirectionsActive(false);
      }
    };

    updateMapAndDirections();
  }, [userLocation, directions]);

  useEffect(() => {
    console.log("Nearby Places:", nearbyPlaces);
  }, [nearbyPlaces]);

  return (
    <ForwardedMapView
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={{
        latitude: userLocation?.latitude,
        longitude: userLocation?.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      onPress={() => setSelectedRestaurant({})}
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
      {!directionsActive &&
        nearbyPlaces?.map((restaurant, index) => (
          <RestaurantMarker
            restaurant={restaurant}
            key={index}
            setSideModalVisible={setSideModalVisible}
          />
        ))}

      {/* Directions Polyline */}
      {directions.length > 0 && (
        <>
          <Polyline
            coordinates={directions}
            strokeColor="#007AFF"
            strokeWidth={4}
          />
          {/* End Marker for directions */}
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
    height: "95%",
  },
  logo: {
    width: 50,
    height: 50,
  },
  markerImage: {
    width: 40,
    height: 40,
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
