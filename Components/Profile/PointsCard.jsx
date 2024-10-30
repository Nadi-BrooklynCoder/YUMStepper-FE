// PointsCard.js

import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import PropTypes from 'prop-types'

const PointsCard = ({ point }) => {
  const pointCount = point?.point_count ?? 0; // Ensure 'point_count' is correct

  console.log("PointsCard point prop:", point);

  return (
    <View style={styles.card}>
      <Text style={styles.valueText}>
        Points: {pointCount}
      </Text>
    </View>
  );
};

PointsCard.propTypes = {
  point: PropTypes.shape({
    point_count: PropTypes.number, 
  }).isRequired,
}


const styles = StyleSheet.create({
  card: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#f7f7f7', // Slightly brighter background
    borderRadius: 8,
    shadowColor: '#000', // Optional: Add some shadow for a card-like effect
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
  },
  valueText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937', // Darker color for better contrast
  },
});

export default PointsCard;
