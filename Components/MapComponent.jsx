import React, { useEffect, useState, useRef } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, AnimatedRegion } from 'react-native-maps';
import { StyleSheet, Animated } from 'react-native';
import * as Location from 'expo-location';
import { GOOGLE_API_KEY, API_BASE_URL } from '@env';
import axios from 'axios';

const MapComponent = ({ route }) => {
  const { userId, token } = route.params;
  const [user, setUser] = useState({});
  const [currentLocation, setCurrentLocation] = useState(null);
  const [heading, setHeading] = useState(0);
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const mapViewRef = useRef(null);

  // AnimatedRegion for smooth location movement
  const animatedRegion = useRef(
    new AnimatedRegion({
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    })
  ).current;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/users/${userId}`);
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user location", err);
      }
    };

    // Watch the user's position and update the map view
    const watchUserLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      // Watch user's position and heading
      await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 1 },
        (location) => {
          const { latitude, longitude, heading } = location.coords;

          // Update the animated region (for smooth movement)
          animatedRegion.timing({
            latitude,
            longitude,
            duration: 500, // smooth animation for 500ms
          }).start();

          // Update the current location and heading
          setCurrentLocation({
            latitude,
            longitude,
          });
          setHeading(heading || 0);

          // Move map camera to follow user's movement
          if (mapViewRef.current) {
            mapViewRef.current.animateToRegion({
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }, 500); // smooth transition over 500ms
          }
        }
      );
    };

    // Start the pulse animation for the triangle marker
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

    fetchUser();
    watchUserLocation();
    startPulseAnimation();
  }, [userId]);

  return (
    <MapView
      ref={mapViewRef}
      // provider={PROVIDER_GOOGLE} // Use Google Maps
      style={styles.map}
      // mapId={"1c126259f1cbbaae"}
      initialRegion={{
        latitude: currentLocation ? currentLocation.latitude : 37.78825,
        longitude: currentLocation ? currentLocation.longitude : -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      followsUserLocation={true}
    >
      {/* Marker for the user's current location */}
      {currentLocation && (
        <Marker.Animated
          coordinate={animatedRegion}
        >
          <Animated.View style={[styles.triangle, {
            transform: [
              { scale: pulseAnimation },
              { rotate: `${heading}deg` }, // Rotate triangle based on heading
            ]
          }]} />
        </Marker.Animated>
      )}

      {/* Marker for the user fetched from the API */}
      {user.latitude && user.longitude && (
        <Marker
          coordinate={{
            latitude: user.latitude,
            longitude: user.longitude,
          }}
          title="User Location"
          description="This is the user's location"
        />
      )}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'blue', // Customize the triangle color
  },
});

export default MapComponent;
