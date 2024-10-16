// StepsCard.js

import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

const StepsCard = ({ step, displayType, stepsToPoints }) => {
  const value =
    displayType === 'steps' ? step.step_count : stepsToPoints(step.step_count);

  return (
    <View style={styles.card}>
      <Text style={styles.valueText}>
        {displayType === 'steps' ? `Steps: ${value}` : `Points: ${value}`}
      </Text>
      <Text style={styles.dateText}>Date: {step.date}</Text>
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
  dateText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});

export default StepsCard;
