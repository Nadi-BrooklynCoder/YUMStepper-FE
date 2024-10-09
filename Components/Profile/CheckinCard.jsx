import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

const CheckinCard = ({ checkin }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.placeName}>Place: {checkin.place_name}</Text>
      <Text style={styles.date}>Date: {checkin.date}</Text>
      {checkin.notes ? <Text style={styles.notes}>Notes: {checkin.notes}</Text> : null}
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
  placeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  notes: {
    fontSize: 14,
    color: '#333',
  },
});

export default CheckinCard;
