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
    fetchCheckInHistory,
    setRestaurants,
    stopVoiceDirections,
    checkInsToday,
    restaurants,
    handleCheckIn,
  } = useContext(AuthContext);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [sideModalVisible, setSideModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Debounced search filtering
  const debouncedFilterRestaurants = debounce((query) => {
    setFilteredRestaurants(
      query.trim()
        ? restaurants.filter((restaurant) =>
            restaurant.name.toLowerCase().includes(query.toLowerCase())
          )
        : []
    );
  }, 500);

  const handleSearch = (query) => {
    setSearchQuery(query);
    debouncedFilterRestaurants(query);
  };

  useEffect(() => {
    return () => debouncedFilterRestaurants.cancel(); // Cleanup debounce on unmount
  }, []);

  const resetMap = () => {
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
    if ((Number(checkInsToday[selectedRestaurant?.id]) || 0) >= 2) return "Limit Reached";
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
        selectedRestaurant={selectedRestaurant}
      />

      {selectedRestaurant && directions.length > 0 && (
        <Animated.View style={styles.checkInButtonContainer}>
          <TouchableOpacity
            style={[
              styles.checkInButton,
              isNearRestaurant && (Number(checkInsToday[selectedRestaurant.id]) || 0) < 2
                ? styles.highlightedButton
                : styles.disabledButton,
            ]}
            disabled={!isNearRestaurant || (Number(checkInsToday[selectedRestaurant.id]) || 0) >= 2}
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
    top: 50,
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
