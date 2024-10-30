// Updated RestaurantMarker.js

import React, { useMemo, useRef } from "react";
import { StyleSheet, Image, View, Text } from "react-native";
import { Marker } from "react-native-maps";
import { getDistance } from 'geolib';

// Import the custom marker icon
const foodIcon = require("../../assets/food-icon.png");

const RestaurantMarker = ({ restaurant, userLocation, setSideModalVisible, selectRestaurant }) => {
  const latitude = parseFloat(restaurant.latitude);
  const longitude = parseFloat(restaurant.longitude);
  const prevDistanceRef = useRef(null); // add to track prev distance

  if(!latitude || !longitude) { 
    console.warn("Invalid restaurant coordinates", restaurant);
    return null;
  }

  // Use `useMemo` to calculate `pointsForDistance` only when `userLocation` is valid
  const pointsForDistance = useMemo(() => {
      if (!userLocation || !userLocation.latitude || !userLocation.longitude) return 0;

      const distance = getDistance(
          { latitude: userLocation.latitude, longitude: userLocation.longitude },
          { latitude, longitude }
      );

      if(prevDistanceRef.current === null || Math.abs(prevDistanceRef.current - distance) > 50) {
        prevDistanceRef.current = distance;
        console.log(`Distance to restaurant: ${distance}`);
      }

      if (distance > 6436) return 50; // > 4 miles
      if (distance > 3218) return 35; // 2-4 miles
      if (distance > 1609) return 25; // 1-2 miles
      if (distance > 805) return 15; // 0.5-1 mile
      if (distance <= 805) return 10; // < 0.5 mil
      return 0;
  }, [userLocation, restaurant]);

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
