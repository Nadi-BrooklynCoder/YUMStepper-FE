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
import { useNavigation } from "@react-navigation/native";
import { API_BASE_URL } from "@env";
import axios from "axios";
import MapComponent from "../Components/Map/MapComponent";
import SearchMap from "../Components/Map/SearchMap";
import MapSide from "../Components/Map/MapSide";
import { AuthContext } from "../Context/AuthContext";
import { debounce } from "lodash";


const CustomMap = ({ route }) => {
  const {
    selectedRestaurant,
    setSelectedRestaurant,
    directions,
    setDirections,
    isNearRestaurant,
    userLocation,
    user,
    userId,
    userToken,
    fetchNearByPlaces,
    setRestaurants,
    getDirectionsFromGoogleMaps,
    stopVoiceDirections
  } = useContext(AuthContext);


  // Local state variables
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [sideModalVisible, setSideModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);

  // Function to handle search using lodash debounce
  const handleSearch = debounce((query) => {
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredRestaurants([]);
    } else {
      const filtered = restaurants.filter((restaurant) =>
        restaurant.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredRestaurants(filtered);
    }
  }, 500);

  useEffect(() => {
    return () => handleSearch.cancel(); // Cleanup on unmount
  }, []);


  // Function to handle check-in
  const handleCheckIn = async () => {
    if (!isNearRestaurant || hasCheckedInToday) return; // Prevent check-in if not near the restaurant or already checked in
    c

    const checkInData = {
      restaurant_id: selectedRestaurant?.id,
      latitude: userLocation?.latitude,
      longitude: userLocation?.longitude,
      receipt_image: "your_receipt_image_path_here", // Placeholder
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/users/${userId}/checkins`, checkInData, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (response.data.canCheckIn === false) {
        Alert.alert(
          "Check-In Limit Reached",
          response.data.message,
          [{ text: "OK", onPress: closeCheckInModal }],
          { cancelable: false }
        );
      } else {
        Alert.alert(
          "Check-In Successful",
          "You've earned 25 points!",
          [{ text: "OK", onPress: resetMap }],
          { cancelable: false }
        );
        handleStopDirections(); // Stop directions and reset state
      }
    } catch (err) {
      handleCheckInError(err);
    }
  };

  // Reset map after check-in
  const resetMap = () => {
    handleStopDirections();
    setSideModalVisible(false);
  };

  // Close the check-in modal and reset state
  const closeCheckInModal = () => {
    setSideModalVisible(false);
    handleStopDirections(); // Stop directions and reset state
    resetMap();
  };

  // Handle different types of check-in errors
  const handleCheckInError = (err) => {
    console.error("Error during check-in:", err);
    if (err.response?.status === 400) {
      Alert.alert("Check-In Limit Reached", err.response.data.error);
    } else if (err.response?.status === 404) {
      Alert.alert("Check-In Failed", "The requested resource was not found. Please try again.");
    } else {
      Alert.alert("Check-In Failed", "An unexpected error occurred. Please try again later.");
    }
  };

  // Effect to determine if the user has already checked in today
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
    const lastCheckInDate = user?.lastCheckInDate;
    const checkInCount = user?.checkInCount || 0;

    setHasCheckedInToday(lastCheckInDate === today && checkInCount >= 2);
  }, [user]);

  // Fetch restaurants and nearby places when user location updates
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (userLocation && userLocation.latitude) {
        setLoading(true);
        try {
          const restaurantsRes = await axios.get(`${API_BASE_URL}/restaurants`);
          if (isMounted) {
            setRestaurants(restaurantsRes.data);
            fetchNearByPlaces();
          }
        } catch (err) {
          Alert.alert("Error", "Failed to load restaurants. Please check your connection and try again.");
        } finally {
          if (isMounted) setLoading(false);
        }
      }
    };
    fetchData();

    return () => {
      isMounted = false;
    };
  }, [userLocation]);

  useEffect(() => {
    if (selectedRestaurant?.latitude && selectedRestaurant?.longitude) {
      setSideModalVisible(true);
    } else if (selectedRestaurant !== null) {
      console.warn("Selected restaurant coordinates are invalid:", selectedRestaurant);
    }
  }, [selectedRestaurant]);


  // Function to handle restaurant selection
  const selectRestaurant = (restaurant) => {

    if(!restaurant) {
      console.error(`Restaurant object not found`, restaurant)
      return
    }

    const selected = {
      ...restaurant,
      latitude: parseFloat(restaurant.latitude || restaurant?.location?.lat),
      longitude: parseFloat(restaurant.longitude || restaurant?.location?.lng),
    };

    if (isNaN(selected.latitude) || isNaN(selected.longitude)) {
      console.error('Selected rest. has invalid coords', selected);
      return;
    }
    setSelectedRestaurant(selected);
    setSideModalVisible(true);
  };

  const handleStopDirections = () => {
    setDirections([]);
    setSelectedRestaurant(null);
    stopVoiceDirections(); // Stop voice and reset isVoiceEnabled to false
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
        isVoiceEnabled={isVoiceEnabled}
        setIsVoiceEnabled={setIsVoiceEnabled} // Pass control to MapComponent
      />

      {selectedRestaurant && Object.keys(selectedRestaurant).length > 0 && directions.length > 0 && (
        <Animated.View style={styles.checkInButtonContainer}>
          <TouchableOpacity
            style={[
              styles.checkInButton,
              isNearRestaurant && !hasCheckedInToday ? styles.highlightedButton : styles.disabledButton,
            ]}
            disabled={!isNearRestaurant || hasCheckedInToday}
            onPress={handleCheckIn}
          >
            <Text style={styles.checkInButtonText}>
              {hasCheckedInToday ? 'Daily Limit Reached' : 'Check In'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {sideModalVisible && (
        <MapSide setSideModalVisible={setSideModalVisible} />
      )}

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
          <TouchableOpacity
            style={styles.stopButton}
            onPress={handleStopDirections}
          >
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
    backgroundColor: "#0BCF07",
  },
  disabledButton: {
    backgroundColor: "#A9A9A9",
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
