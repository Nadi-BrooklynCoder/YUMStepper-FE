import React, { useContext, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  Keyboard,
  ActivityIndicator,
  Alert,
  Animated,
} from "react-native";
import { API_BASE_URL } from "@env";
import axios from "axios";
import MapComponent from "../Components/Map/MapComponent";
import SearchMap from "../Components/Map/SearchMap";
import MapSide from "../Components/Map/MapSide";
import { AuthContext } from "../Context/AuthContext";
import { debounce } from "lodash";
import { getDistance } from 'geolib';

const CustomMap = ({ route }) => {
  const {
    selectedRestaurant,
    setSelectedRestaurant,
    directions,
    setDirections,
    isNearRestaurant,
    userLocation,
    userId,
    userToken,
    fetchNearByPlaces,
    setRestaurants,
    updateUserPoints,
    stopVoiceDirections,
    checkInsToday,
    setCheckInsToday,
    restaurants
  } = useContext(AuthContext);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [sideModalVisible, setSideModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Debounced search filtering
  const debouncedFilterRestaurants = debounce((query) => {
    if (query.trim() === "") {
      setFilteredRestaurants([]);
    } else {
      const filtered = restaurants.filter((restaurant) =>
        restaurant.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredRestaurants(filtered);
    }
  }, 500);

  // Handle search input change
  const handleSearch = (query) => {
    setSearchQuery(query); // Update search input immediately
    debouncedFilterRestaurants(query); // Debounce filtering
  };

  useEffect(() => {
    return () => debouncedFilterRestaurants.cancel(); // Cleanup debounce on unmount
  }, []);

  // Function to handle check-in
  const handleCheckIn = async () => {
    if (!selectedRestaurant || !userLocation || (checkInsToday[selectedRestaurant.id] || 0) >= 2) {
      Alert.alert("Check-In Unavailable", "You have reached your check-in limit or no restaurant is selected.");
      return;
    }
  
    // Calculate distance to ensure we're within 60 meters
    const distanceToRestaurant = getDistance(
      { latitude: userLocation.latitude, longitude: userLocation.longitude },
      { latitude: selectedRestaurant.latitude, longitude: selectedRestaurant.longitude }
    );
  
    if (distanceToRestaurant > 60) {
      Alert.alert("Too Far to Check In", "You must be within 60 meters to check in.");
      return;
    }
  
    const checkInData = {
      restaurant_id: selectedRestaurant?.id,
      latitude: userLocation?.latitude,
      longitude: userLocation?.longitude,
    };
  
    try {
      const response = await axios.post(`${API_BASE_URL}/users/${userId}/checkins`, checkInData, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
  
      if (response.data.canCheckIn === false) {
        Alert.alert("Check-In Limit Reached", response.data.message);
      } else {
        const { totalPoints, check_in_points: checkInPoints, multiplier_points: multiplierPoints } = response.data;
  
        Alert.alert(
          "Check-In Successful",
          `You've earned ${totalPoints} points!\n\nDetails:\nCheck-In Points: ${checkInPoints}\nMultiplier Points: ${multiplierPoints}`,
          [{ text: "OK", onPress: resetMap }]
        );
  
        updateUserPoints(totalPoints);
        setCheckInsToday((prev) => ({
          ...prev,
          [selectedRestaurant.id]: (prev[selectedRestaurant.id] || 0) + 1,
        }));
      }
    } catch (err) {
      console.error("Error during check-in:", err);
  
      let errorMessage = "An unexpected error occurred. Please try again later.";
      if (err.response) {
        errorMessage = err.response.data.message || errorMessage;
      } else if (err.request) {
        errorMessage = "No response from the server. Please check your internet connection.";
      }
  
      Alert.alert("Check-In Failed", errorMessage);
    }
  };
  

  // Reset map after check-in
  const resetMap = () => {
    handleStopDirections();
    setSideModalVisible(false);
  };

  const handleStopDirections = () => {
    setDirections([]);
    setSelectedRestaurant(null);
    stopVoiceDirections();
  };

  useEffect(() => {
    if (selectedRestaurant?.latitude && selectedRestaurant?.longitude) {
      setSideModalVisible(true);
    }
  }, [selectedRestaurant]);

  const selectRestaurant = (restaurant) => {
    if (!restaurant) {
      console.error("Restaurant object not found:", restaurant);
      return;
    }

    const selected = {
      ...restaurant,
      latitude: parseFloat(restaurant.latitude || restaurant?.location?.lat),
      longitude: parseFloat(restaurant.longitude || restaurant?.location?.lng),
    };

    if (isNaN(selected.latitude) || isNaN(selected.longitude)) {
      console.error("Selected restaurant has invalid coordinates:", selected);
      return;
    }

    setSelectedRestaurant(selected);
    setSideModalVisible(true);
  };

  const getCheckInButtonText = () => {
    if (!isNearRestaurant) return "Too Far to Check In";
    if ((checkInsToday[selectedRestaurant?.id] || 0) >= 2) return "Limit Reached";
    return "Check In";
  };

  return (
    <View style={{ flex: 1 }}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}

      <View style={styles.searchContainer}>
        <SearchMap setSearchQuery={handleSearch} searchQuery={searchQuery} editable={!loading} />
      </View>

      <MapComponent
  route={route}
  searchQuery={searchQuery}
  setSideModalVisible={setSideModalVisible}
  selectRestaurant={selectRestaurant}
  restaurants={filteredRestaurants.length > 0 ? filteredRestaurants : restaurants}
/>

      {selectedRestaurant && directions.length > 0 && (
        <Animated.View style={styles.checkInButtonContainer}>
          <TouchableOpacity
            style={[
              styles.checkInButton,
              isNearRestaurant && (checkInsToday[selectedRestaurant.id] || 0) < 2
                ? styles.highlightedButton
                : styles.disabledButton,
            ]}
            disabled={!isNearRestaurant || (checkInsToday[selectedRestaurant.id] || 0) >= 2}
            onPress={handleCheckIn}
          >
            <Text style={styles.checkInButtonText}>{getCheckInButtonText()}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {sideModalVisible && <MapSide setSideModalVisible={setSideModalVisible} />}

      {filteredRestaurants.length > 0 && (
        <View style={styles.popup}>
          <FlatList
            data={filteredRestaurants}
            keyExtractor={(item) => item.id.toString()}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  selectRestaurant(item);
                  setSearchQuery("");
                  setFilteredRestaurants([]);
                }}
              >
                <Text style={styles.itemText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {filteredRestaurants.length === 0 && searchQuery !== "" && (
        <View style={styles.noResults}>
          <Text>No restaurants found for your search.</Text>
        </View>
      )}

      {directions.length > 0 && (
        <View style={styles.stopButtonContainer}>
          <TouchableOpacity style={styles.stopButton} onPress={handleStopDirections}>
            <Text style={styles.stopButtonText}>Stop Directions</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    position: "absolute",
    top: 150,
    left: 10,
    right: 10,
    zIndex: 2,
  },
  popup: {
    position: "absolute",
    top: 220,
    left: 10,
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    maxHeight: 200,
    elevation: 5,
    zIndex: 1,
  },
  itemText: {
    padding: 10,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  noResults: {
    position: "absolute",
    top: 220,
    left: 10,
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 10,
    elevation: 5,
    zIndex: 1,
  },
  stopButtonContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    zIndex: 1,
  },
  stopButton: {
    backgroundColor: "#ff3333",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  stopButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  checkInButtonContainer: {
    position: "absolute",
    bottom: 80,
    right: 20,
    zIndex: 1,
  },
  checkInButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  highlightedButton: {
    backgroundColor: "#0BCF07", // Green color when eligible to check in
  },
  disabledButton: {
    backgroundColor: "#A9A9A9", // Grey color when not eligible
  },
  checkInButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
});

export default CustomMap;
