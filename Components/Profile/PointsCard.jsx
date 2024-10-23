// PointsCard.js

import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

const PointsCard = ({ point }) => {
  console.log("PointsCard point prop:", point);

  return (
    <View style={styles.card}>
      <Text style={styles.valueText}>
        Points: {point.point_count}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  valueText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default PointsCard;
