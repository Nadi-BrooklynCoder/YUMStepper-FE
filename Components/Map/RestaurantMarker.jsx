// RestaurantMarker.js
import React, { useMemo, useRef, useContext } from "react";
import { StyleSheet, Image, View, Text } from "react-native";
import { Marker } from "react-native-maps";
import { getDistance } from 'geolib';
import { AuthContext } from '../../Context/AuthContext';

// Import the custom marker icon
const foodIcon = require("../../assets/food-icon.png");

const RestaurantMarker = ({ restaurant, userLocation, setSideModalVisible, selectRestaurant }) => {
  const { calculateCheckInPoints } = useContext(AuthContext); // Get function from context
  
  const latitude = parseFloat(restaurant.latitude);
  const longitude = parseFloat(restaurant.longitude);
  const prevDistanceRef = useRef(null); // Track previous distance

  if (!latitude || !longitude) { 
    console.warn("Invalid restaurant coordinates", restaurant);
    return null;
  }

  // Use `useMemo` to calculate `pointsForDistance` only when `userLocation` is valid
  const pointsForDistance = useMemo(() => {
      if (!userLocation || !userLocation.latitude || !userLocation.longitude) return 0;

      // Calculate distance from user to restaurant
      const distance = getDistance(
          { latitude: userLocation.latitude, longitude: userLocation.longitude },
          { latitude, longitude }
      );

      // Log distance change if it differs significantly
      if (prevDistanceRef.current === null || Math.abs(prevDistanceRef.current - distance) > 50) {
        prevDistanceRef.current = distance;
        console.log(`Distance to restaurant: ${distance} meters`);
      }

      // Calculate potential points based on distance (display-only)
      return calculateCheckInPoints(distance).totalPoints;
  }, [userLocation, restaurant, calculateCheckInPoints]);

  // Render `null` if coordinates are invalid, without early return
  const isValidLocation = userLocation && userLocation.latitude && userLocation.longitude;
  if (!isValidLocation || !restaurant.latitude || !restaurant.longitude) {
      console.warn("Location or restaurant coordinates are missing", { userLocation, restaurant });
  }

  return isValidLocation && restaurant.latitude && restaurant.longitude ? (
      <Marker
          coordinate={{ latitude, longitude }}
          title={restaurant.name || 'Unnamed Restaurant'}
          onPress={() => {
              selectRestaurant(restaurant);
              setSideModalVisible(true);
          }}
      >
          <View style={styles.pointsContainer}>
              <Text style={styles.pointsText}>{`${pointsForDistance} Points`}</Text>
          </View>
          <Image source={foodIcon} style={styles.markerImage} resizeMode="contain" />
      </Marker>
  ) : null;
};

const styles = StyleSheet.create({
  markerImage: {
    width: 40,
    height: 40,
  },
  pointsContainer: {
    alignItems: 'center',
    marginBottom: 5,
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 5,
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  pointsText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: 'bold',
  }
});

export default RestaurantMarker;
