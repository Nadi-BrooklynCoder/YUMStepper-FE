import { StyleSheet, Image, Platform } from "react-native";
import { Marker } from "react-native-maps";
import React, { useContext } from "react";
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { AuthContext } from "../../Context/AuthContext";

// Import the custom marker icon
const foodIcon = require("../../assets/food-icon.png");

// Helper function to get values safely
const getValue = (value, fallback = 'N/A') => (value !== undefined && value !== null) ? value : fallback;

const RestaurantMarker = ({ restaurant, setSideModalVisible }) => {
  const { setSelectedRestaurant, selectedRestaurant } = useContext(AuthContext);

  const onMarkerPress = async () => {
    if(Platform.OS === 'web') {
      setSelectedRestaurant({
        id: getValue(restaurant?.id),
        name: getValue(restaurant?.name),
        latitude: getValue(restaurant?.latitude),
        longitude: getValue(restaurant?.longitude),
        address: getValue(restaurant?.formatted_address, getValue(restaurant?.address)),
        cuisine_type: getValue(restaurant?.cuisine_type, 'Not specified'),
        rating: getValue(restaurant?.rating, 'N/A'),
        menu_url: getValue(restaurant?.menu_url, 'Not available'),
        opening_hours: restaurant?.opening_hours ? restaurant.opening_hours: [{ open: 'N/A', close: 'N/A'}],
        open_now: restaurant.open_now ? 'Yes' : 'No',
      });
      setSideModalVisible(true);
      return;
    }
    console.log(`[RestaurantMarker:onMarkerPress] Marker pressed:`, restaurant);
  
    // Prevent selecting the same restaurant again while navigating
    if (selectedRestaurant?.id && selectedRestaurant.id === restaurant.id) {
      console.log(`[RestaurantMarker:onMarkerPress] Same restaurant pressed, skipping update.`);
      return;
    }
  
    try {
      // Fetch restaurant details from the unified details endpoint
      console.log(`[RestaurantMarker:onMarkerPress] Fetching details for restaurant id: ${restaurant.id}`);
      const response = await axios.get(`${API_BASE_URL}/restaurants/details/${restaurant.id}`);
      console.log(`[RestaurantMarker:onMarkerPress] Restaurant Details:`, response.data);
  
      // Check the structure of response data
      const details = response.data.data || response.data;
  
      // Update selected restaurant with the correct fields
      setSelectedRestaurant({
        id: getValue(details?.id),
        name: getValue(details?.name),
        latitude: details?.latitude || restaurant.latitude, // Retain original value if latitude is missing
        longitude: details?.longitude || restaurant.longitude, // Retain original value if longitude is missing
        address: getValue(details?.formatted_address, getValue(details?.address)),
        cuisine_type: details?.categories && details.categories.length > 0
          ? details.categories.map(category => category.title).join(', ')
          : getValue(details?.cuisine_type?.trim(), 'Not specified'),
        rating: getValue(details?.rating, 'N/A'),
        menu_url: getValue(details?.website, getValue(details?.menu_url, 'Not available')),
        opening_hours: details?.opening_hours?.length > 0 ? details.opening_hours : [{ open: 'Unknown', close: 'Unknown' }],
        open_now: details?.open_now ? 'Yes' : 'No',
      });
  
      setSideModalVisible(true);
    } catch (error) {
      console.error(`[RestaurantMarker:onMarkerPress] Error fetching restaurant details:`, error.message);
    }
  };
  
  // Confirm valid coordinates before rendering the Marker
  const latitude = parseFloat(restaurant.latitude);
  const longitude = parseFloat(restaurant.longitude);

  if (isNaN(latitude) || isNaN(longitude)) {
    console.error(`[RestaurantMarker] Invalid coordinates for restaurant:`, restaurant);
    return null; // Skip rendering if coordinates are invalid
  }

  return (
    <Marker
      coordinate={{
        latitude,
        longitude,
      }}
      onPress={onMarkerPress}
    >
      <Image source={foodIcon} style={styles.markerImage} resizeMode="contain" />
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerImage: {
    width: 40,
    height: 40,
  },
});

export default RestaurantMarker;
