import React, { useEffect, useState, useRef } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { StyleSheet, Animated, View } from 'react-native';
import * as Location from 'expo-location';
import { GOOGLE_API_KEY, API_BASE_URL } from '@env';
import axios from 'axios';

const MapComponent = ({ route }) => {
  const { userId, token } = route.params;
  const [user, setUser] = useState({});
  const [currentLocation, setCurrentLocation] = useState(null);
  const [heading, setHeading] = useState(0);
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/users/${userId}`);
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user location", err);
      }
    };

    // Get the current geolocation of the user and their heading
    const getCurrentLocation = async () => {
      // Request permission to access location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      // Watch the user's position and heading
      await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 1 },
        (location) => {
          setCurrentLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          setHeading(location.coords.heading || 0);
        }
      );
    };

    // Pulse animation for the triangle
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
    getCurrentLocation();
    startPulseAnimation();
  }, [userId]);

  return (
    <MapView
      // provider={PROVIDER_GOOGLE} // Use Google Maps
      style={styles.map}
      initialRegion={{
        latitude: currentLocation ? currentLocation.latitude : 37.78825,
        longitude: currentLocation ? currentLocation.longitude : -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    >
      {/* Show a marker for the user's current location */}
      {currentLocation && (
        <Marker
          coordinate={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
          }}
        >
          {/* Custom pulsing triangle for the marker */}
          <Animated.View style={[styles.triangle, {
            transform: [
              { scale: pulseAnimation },
              { rotate: `${heading}deg` } // Rotate triangle based on heading
            ]
          }]} />
        </Marker>
      )}

      {/* Show marker for the user from the API */}
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
