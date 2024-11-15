import React from "react";
import { Image, View, StyleSheet } from "react-native";
import PropTypes from "prop-types";

// Placeholder paths for cuisine icons
const icons = {
  "Italian": require("../../assets/icons/italian.png"),
  "Mexican": require("../../assets/icons/mexican.png"),
  "Chinese": require("../../assets/icons/chinese.png"),
  "Japanese": require("../../assets/icons/japanese.png"),
  "New American": require("../../assets/icons/american.png"),
  "Indian": require("../../assets/icons/indian.png"),
  "French": require("../../assets/icons/french.png"),
  "Thai": require("../../assets/icons/thai.png"),
  "Pizza": require("../../assets/icons/pizza.png"),
  "Mediterranean": require("../../assets/icons/mediterranean.png"),
  "Seafood": require("../../assets/icons/seafood.png"),
  "Vegetarian": require("../../assets/icons/vegetarian.png"),
  "Middle Eastern": require("../../assets/icons/middle_eastern.png"),
  "Barbeque": require("../../assets/icons/barbeque.png"),
  "Latin": require("../../assets/icons/latin.png"),
  "default": require("../../assets/icons/default.png")
};

// Cuisine groups to normalize incoming cuisine types to predefined keys
const cuisineGroups = {
  "Italian": ["Italian"],
  "Mexican": ["Mexican", "Tex-Mex"],
  "Chinese": ["Chinese", "Dim Sum", "Hong Kong Style Cafe"],
  "Japanese": ["Japanese", "Sushi Bars"],
  "American": ["American", "American (New)", "American (Traditional)", "Burgers", "Fast Food", "Steakhouses", "New American"],
  "Indian": ["Indian", "Bangladeshi", "Pakistani"],
  "French": ["French", "Brasseries"],
  "Thai": ["Thai", "Laotian"],
  "Pizza": ["Pizza"],
  "Mediterranean": ["Mediterranean", "Greek", "Lebanese", "Turkish"],
  "Seafood": ["Seafood", "Fish & Chips"],
  "Vegetarian": ["Vegetarian", "Salad", "Vegan"],
  "Middle Eastern": ["Middle Eastern", "Arabian", "Persian/Iranian"],
  "Barbeque": ["Barbeque", "Southern"],
  "Latin": ["Latin", "Spanish", "South American", "Puerto Rican"]
};



// Helper function to find the closest cuisine icon match
const getCuisineIcon = (cuisineType) => {
  const normalizedType = cuisineType?.toLowerCase();
  console.log(`CuisineIcon received cuisineType: ${cuisineType}`);
  for (const [key, types] of Object.entries(cuisineGroups)) {
    if (types.some(type => type.toLowerCase() === normalizedType)) {
      console.log(`Match found for cuisineType "${cuisineType}" in group "${key}"`);
      return icons[key];
    }
  }

  console.log(`No match found for cuisineType "${cuisineType}", using default icon.`);
  return icons["default"];
};

const CuisineIcon = ({ cuisineType = "default" }) => {
  const iconSource = getCuisineIcon(cuisineType);
  console.log("Icon Source for cuisine type:", cuisineType, iconSource);

  return (
    <View style={styles.iconContainer}>
      <Image source={iconSource} style={styles.icon} resizeMode="contain" />
    </View>
  );
};

CuisineIcon.propTypes = {
  cuisineType: PropTypes.string
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 40,
    height: 40,
  },
});

export default CuisineIcon;
