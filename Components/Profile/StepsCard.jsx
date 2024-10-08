import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

const StepsCard = ({ step, displayType, stepsToPoints }) => {
  const value = displayType === 'steps' ? step.step_count : stepsToPoints(step.step_count);

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
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#eee',
    borderRadius: 5,
  },
  valueText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
});

<<<<<<< HEAD
export default StepsCard;
=======
export default StepsCard;
>>>>>>> KhyBranch
