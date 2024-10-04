import { StyleSheet, Image } from "react-native";
import { Marker } from "react-native-maps";
import React, { useContext } from "react";
import { AuthContext } from "../../Context/AuthContext";

// Import the custom marker icon
const foodIcon = require("../../assets/food-icon.png");

const RestaurantMarker = ({ restaurant, setSideModalVisible }) => {
  const { setSelectedRestaurant, selectedRestaurant } = useContext(AuthContext);

  const onMarkerPress = () => {
    if(selectedRestaurant.id){return} // if you have selected a restaurant to travel to you are unable to open anymore 
    setSelectedRestaurant(restaurant);
    setSideModalVisible(true)
  };

  return (
    <Marker
      coordinate={{
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
      }}
      onPress={onMarkerPress}
    >
      {/* Custom Marker Image */}
      <Image source={foodIcon} style={styles.markerImage} resizeMode="contain"/>
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
