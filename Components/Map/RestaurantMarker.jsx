import React, { useMemo, useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Marker } from "react-native-maps";
import PropTypes from "prop-types";
import { AuthContext } from "../../Context/AuthContext";
import CuisineIcon from "./CuisineIcon";

const RestaurantMarker = ({ restaurant, setSideModalVisible }) => {
  const { selectRestaurant } = useContext(AuthContext);

  const multiplierLabel = useMemo(() => (
    restaurant.bonusMultiplierPoints
      ? `x${(restaurant.bonusMultiplierPoints / restaurant.baseCheckInPoints + 1).toFixed(1)}`
      : "x1"
  ), [restaurant.bonusMultiplierPoints, restaurant.baseCheckInPoints]);

  return (
    <Marker
      coordinate={{ latitude: restaurant.latitude, longitude: restaurant.longitude }}
      title={`${restaurant.name || 'Unnamed Restaurant'} (+${restaurant.baseCheckInPoints || 0} Pts)`}
      onPress={() => {
        selectRestaurant(restaurant);
        setSideModalVisible(true);
      }}
    >
      <View style={styles.markerContainer}>
        {/* Multiplier Label positioned above the marker */}
        <View style={styles.multiplierContainer}>
          <Text style={styles.multiplierText}>{multiplierLabel}</Text>
        </View>

        {/* Restaurant Icon */}
        <CuisineIcon cuisineType={restaurant.cuisine_type || "default"} />
      </View>
    </Marker>
  );
};

RestaurantMarker.propTypes = {
  restaurant: PropTypes.shape({
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
    name: PropTypes.string,
    cuisine_type: PropTypes.string,
    baseCheckInPoints: PropTypes.number,
    bonusMultiplierPoints: PropTypes.number,
  }).isRequired,
  setSideModalVisible: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: "center",
  },
  multiplierContainer: {
    position: "absolute",
    top: 23, // Position adjusted to overlap the bottom of the icon
    backgroundColor: "#FF4500",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    borderColor: "#FFFFFF", // White border for clarity
    borderWidth: 1,
    zIndex: 2,
  },
  multiplierText: {
    fontSize: 10, // Slightly larger font for readability
    color: "#FFF8DC",
    fontWeight: "bold",
  },
});


export default RestaurantMarker;
