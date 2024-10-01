import React, { useEffect, useState, useRef, useContext } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, AnimatedRegion } from 'react-native-maps';
import { Polyline } from 'react-native-maps';
import { StyleSheet, Animated } from 'react-native';
import * as Location from 'expo-location';
import { AuthContext } from '../Context/AuthContext';
import { GOOGLE_API_KEY, API_BASE_URL } from '@env';
import axios from 'axios';
import yumLogo from '../assets/yummm.png';

// COMPONENTS 
import RestaurantMarker from './RestaurantMarker';

const MapComponent = ({ route, searchQuery, selectedRestaurant, setSelectedRestaurant }) => {
  const { userId, token } = route.params;
  const { setUserLocation, userLocation, directions, setUserSteps, usetSteps, calculateSteps } = useContext(AuthContext); 

  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const mapViewRef = useRef(null);
  const [user, setUser] = useState({});
  const [heading, setHeading] = useState(0);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [restaurants, setRestaurants] = useState([]);

  const animatedRegion = useRef(
    new AnimatedRegion({
      latitude: 40.743175215962026, //Initial latitude
      longitude: -73.94192180308748, // Initial longitude
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
        async (location) => {
          const { latitude, longitude, heading } = location.coords;

          // Update the animated region (for smooth movement)
          animatedRegion.timing({
            latitude,
            longitude,
            duration: 500, 
          }).start();

          // Update the current location and heading
          setUserLocation({
            latitude,
            longitude,
          });

          setHeading(heading || 0);
        }
      );
    };

    // Fetch Restaurants
    const fetchRestaurants = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/restaurants`);
        setRestaurants(res.data);
      } catch (error) {
        console.error(error);
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

    fetchRestaurants();
    fetchUser();
    watchUserLocation();
    startPulseAnimation();
  }, [userId]);

  useEffect(() => {
    const fetchNearByPlaces = async () => {
      try {
        if (userLocation.latitude) {
          const res = await axios.get(`${API_BASE_URL}/googlePlaces/nearby?lat=${userLocation.latitude}&lng=${userLocation.longitude}`);
          setNearbyPlaces(res.data);
        }
      } catch (err) {
        if (err.response) {
          console.error('Error response:', err.response.data);
          console.error('Status:', err.response.status);
        } else if (err.request) {
          console.error('No response received:', err.request);
        } else {
          console.error('Error', err.message);
        }
      }
    };

    if (mapViewRef.current) {
      mapViewRef.current.animateToRegion({
        latitude: userLocation?.latitude || 40.775818,
        longitude: userLocation?.longitude || -73.972761,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }

    // fetchNearByPlaces();
  }, [userLocation]);

  return (
    <MapView
      ref={mapViewRef}
      // provider={PROVIDER_GOOGLE} 
      style={styles.map}
      mapId={"1c126259f1cbbaae"}
      initialRegion={{
        latitude: userLocation ? userLocation.latitude : 37.78825,
        longitude: userLocation ? userLocation.longitude : -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      followsUserLocation={true}
    >
      {/* Marker for the user's current location */}
      {userLocation && (
        <Marker.Animated
          coordinate={animatedRegion}
        >
          <Animated.Image
            source={yumLogo}
            style={[styles.logo, {
              transform: [
                { scale: pulseAnimation }, // Apply pulse animation to the logo
                { rotate: `${heading}deg` }, // Rotate based on the heading
              ]
            }]}
            resizeMode="contain"
          />
        </Marker.Animated>
      )}

      {/* Marker for each restaurant */}
      {restaurants.map((restaurant, index) => (
        <RestaurantMarker restaurant={restaurant} key={index}  setSelectedRestaurant={setSelectedRestaurant} />
      ))}

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
    width: '100%',
    height: '95%',
  },
  logo: {
    width: 50,
    height: 50,
  },
});

export default MapComponent;
