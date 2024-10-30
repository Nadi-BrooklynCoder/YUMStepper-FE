// containers/Map/RestaurantMarkerContainer.js

import React, { useContext } from "react";
import axios from "axios";
import { AuthContext } from '../../Context/AuthContext';
import { API_BASE_URL } from "@env";

// Import the presentational component
import RestaurantMarker from "./RestaurantMarker";

// Helper function to get values safely
const getValue = (value, fallback = "N/A") =>
  value !== undefined && value !== null ? value : fallback;

const RestaurantDetails = ({ restaurant, setSideModalVisible }) => {
  const { setSelectedRestaurant } = useContext(AuthContext);
  

  // Ensure the restaurant object is valid before using it
  if (!restaurant || !restaurant.latitude || !restaurant.longitude) {
    console.error("Restaurant object or its coordinates are undefined:", restaurant);
    return null; // Return null to avoid rendering if the data is missing
  }

  const onMarkerPress = async () => {
    console.log(`[RestaurantMarker:onMarkerPress] Marker pressed:`, restaurant);

    if (!restaurant || !restaurant.latitude || !restaurant.longitude) {
      console.error(`Restaurant object or its coordinates are undefined:`, restaurant);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/restaurants/details/${restaurant.id}`);
      const details = response.data.data || response.data;

      // Prepare selected restaurant data
      const selected = {
        id: getValue(details?.id),
        name: getValue(details?.name),
        latitude: details?.latitude || restaurant.latitude,
        longitude: details?.longitude || restaurant.longitude,
        address: getValue(details?.formatted_address, getValue(details?.address)),
        cuisine_type: details?.categories && details.categories.length > 0
          ? details.categories.map(category => category.title).join(', ')
          : getValue(details?.cuisine_type?.trim(), 'Not specified'),
        rating: getValue(details?.rating, 'N/A'),
        menu_url: getValue(details?.website, getValue(details?.menu_url, 'Not available')),
        opening_hours: details?.opening_hours?.length > 0 ? details.opening_hours : [{ open: 'Unknown', close: 'Unknown' }],
        open_now: details?.open_now ? 'Yes' : 'No',
      };

      console.log("Selected Restaurant:", selected);

      // Check if the selected restaurant has valid coordinates
      if (!selected.latitude || !selected.longitude) {
        console.error("Selected restaurant location is not available:", selected);
        return;
      }
      

      setSelectedRestaurant(selected);
        setSideModalVisible(true);

      console.log(`[RestaurantMarker:onMarkerPress] Navigating to RestaurantDetails screen with ID: ${selected.id}`);
    } catch (error) {
      console.error(`[RestaurantMarker:onMarkerPress] Error fetching restaurant details:`, error.response?.data || error.message);
    }

  
  };

  return (
    <RestaurantMarker
      restaurant={restaurant}
      onPress={onMarkerPress}
    />
  );
};

export default RestaurantDetails;
