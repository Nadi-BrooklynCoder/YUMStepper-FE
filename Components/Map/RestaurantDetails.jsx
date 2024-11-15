import React, { useContext, useState } from "react";
import axios from "axios";
import { AuthContext } from '../../Context/AuthContext';
import { API_BASE_URL } from "@env";
import RestaurantMarker from "./RestaurantMarker";
import { getCuisineIcon, icons } from "./CuisineIcon"; // Import icons map

// Helper function to get values safely
const getValue = (value, fallback = "N/A") =>
  value !== undefined && value !== null ? value : fallback;

const RestaurantDetails = ({ restaurant, userLocation, setSideModalVisible }) => {
  const { setSelectedRestaurant } = useContext(AuthContext);
  const [selectedRestaurant, setSelectedRestaurantState] = useState(null);

  if (!restaurant || !restaurant.latitude || !restaurant.longitude) {
    console.error("Restaurant object or its coordinates are undefined:", restaurant);
    return null;
  }

  const onMarkerPress = async () => {
    console.log(`[RestaurantMarker:onMarkerPress] Marker pressed for restaurant:`, restaurant);
  
    try {
      const response = await axios.get(`${API_BASE_URL}/restaurants/details/${restaurant.id}`);
      const details = response.data.data || response.data;
      console.log("Fetched Restaurant Details Object:", details); // Log entire details object
  
      // Initialize cuisineType as 'default'
      let cuisineType = "default";
  
      // Check if categories are present and log categories array
      if (details.categories && Array.isArray(details.categories)) {
        console.log("Categories available:", details.categories); // Log entire categories array
  
        for (const category of details.categories) {
          console.log("Checking category:", category); // Log full category object
  
          const icon = getCuisineIcon(category.title || category.alias || ""); // Use alias as fallback
          if (icon !== icons["default"]) {
            cuisineType = category.title || category.alias;
            console.log(`Matched cuisine type: ${cuisineType} with icon`, icon);
            break; // Exit loop once we find a match
          }
        }
      } else {
        console.warn("No categories found or categories data is not an array.");
      }
  
      console.log("Final Cuisine Type after looping:", cuisineType);
  
      const selected = {
        id: getValue(details?.id),
        name: getValue(details?.name),
        latitude: details?.latitude || restaurant.latitude,
        longitude: details?.longitude || restaurant.longitude,
        address: getValue(details?.formatted_address, getValue(details?.address)),
        cuisine_type: cuisineType,
        rating: getValue(details?.rating, 'N/A'),
        menu_url: getValue(details?.website, getValue(details?.menu_url, 'Not available')),
        opening_hours: details?.opening_hours?.length > 0 ? details.opening_hours : [{ open: 'Unknown', close: 'Unknown' }],
        open_now: details?.open_now ? 'Yes' : 'No',
      };
  
      console.log("Final Selected Restaurant Data:", selected);
  
      if (!selected.latitude || !selected.longitude) {
        console.error("Selected restaurant location is not available:", selected);
        return;
      }
  
      setSelectedRestaurantState(selected);
      setSelectedRestaurant(selected);
      setSideModalVisible(true);
    } catch (error) {
      console.error(`[RestaurantMarker:onMarkerPress] Error fetching restaurant details:`, error.response?.data || error.message);
    }
  };
  
  

  return (
    selectedRestaurant && (
      <RestaurantMarker
        restaurant={selectedRestaurant}
        userLocation={userLocation}
        setSideModalVisible={setSideModalVisible}
        selectRestaurant={setSelectedRestaurant}
        onMarkerPress={onMarkerPress}
      />
    )
  );
};

export default RestaurantDetails;
