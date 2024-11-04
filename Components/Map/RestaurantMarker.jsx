// RestaurantMarker.js
import React, { useMemo, useRef, useContext } from "react";
import { StyleSheet, Image, View, Text } from "react-native";
import { Marker } from "react-native-maps";
import PropTypes from 'prop-types';
import { getDistance } from 'geolib';
import { AuthContext } from '../../Context/AuthContext';

// Import the custom marker icon
const foodIcon = require("../../assets/food-icon.png");

const RestaurantMarker = ({ restaurant, userLocation, setSideModalVisible, selectRestaurant }) => {
  const { calculateCheckInPoints } = useContext(AuthContext); // Get function from context
  
  const latitude = parseFloat(restaurant.latitude);
  const longitude = parseFloat(restaurant.longitude);
  const prevDistanceRef = useRef(null); // Track previous distance

  // Validate restaurant coordinates
  if (isNaN(latitude) || isNaN(longitude)) { 
    console.warn("Invalid restaurant coordinates", restaurant);
    return null;
  }

  // Use `useMemo` to calculate points only when `userLocation` changes
  const { checkInPoints, multiplierPoints, totalPoints } = useMemo(() => {
      if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
        console.warn("User location is invalid", userLocation);
        return { checkInPoints: 0, multiplierPoints: 0, totalPoints: 0 };
      }

      // Calculate distance from user to restaurant
      const distance = getDistance(
          { latitude: userLocation.latitude, longitude: userLocation.longitude },
          { latitude, longitude }
      );

      // Log distance change if it differs significantly
      if (prevDistanceRef.current === null || Math.abs(prevDistanceRef.current - distance) > 50) {
        prevDistanceRef.current = distance;
        console.log(`Distance to restaurant (${restaurant.name}): ${distance} meters`);
      }

      // Calculate points based on distance (display-only)
      const points = calculateCheckInPoints(distance);
      
      // Ensure points object has the necessary properties
      const { checkInPoints: ciPoints = 0, multiplierPoints: mPoints = 0, totalPoints: tPoints = ciPoints + mPoints } = points || {};

      if (!points) {
        console.warn("calculateCheckInPoints returned undefined or null");
      }

      return { checkInPoints: ciPoints, multiplierPoints: mPoints, totalPoints: tPoints };
  }, [userLocation.latitude, userLocation.longitude, restaurant.name, calculateCheckInPoints, latitude, longitude]);

  // Render `null` if coordinates are invalid, without early return
  const isValidLocation = userLocation && userLocation.latitude && userLocation.longitude;
  if (!isValidLocation || isNaN(latitude) || isNaN(longitude)) {
      console.warn("Location or restaurant coordinates are missing or invalid", { userLocation, restaurant });
  }

  return isValidLocation && !isNaN(latitude) && !isNaN(longitude) ? (
      <Marker
          coordinate={{ latitude, longitude }}
          title={restaurant.name || 'Unnamed Restaurant'}
          onPress={() => {
              selectRestaurant(restaurant);
              setSideModalVisible(true);
          }}
      >
          <View style={styles.pointsContainer}>
              <Text style={styles.pointsText}>{`${totalPoints} Points`}</Text>
              {multiplierPoints > 0 && (
                  <Text style={styles.subPointsText}>{`+${multiplierPoints} Bonus`}</Text>
              )}
          </View>
          <Image source={foodIcon} style={styles.markerImage} resizeMode="contain" />
      </Marker>
  ) : null;
};

// Define PropTypes for better type-checking
RestaurantMarker.propTypes = {
  restaurant: PropTypes.shape({
    latitude: PropTypes.number.isRequired,   // Changed to number
    longitude: PropTypes.number.isRequired,  // Changed to number
    name: PropTypes.string,
    // Add other restaurant properties if needed
  }).isRequired,
  userLocation: PropTypes.shape({
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
  }).isRequired,
  setSideModalVisible: PropTypes.func.isRequired,
  selectRestaurant: PropTypes.func.isRequired,
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
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 5,
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  pointsText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  subPointsText: {
    fontSize: 10,
    color: '#FF9500',
  }
});

export default RestaurantMarker;

