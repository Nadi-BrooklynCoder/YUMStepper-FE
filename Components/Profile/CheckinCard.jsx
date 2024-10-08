import { View, Text, StyleSheet } from 'react-native';
<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@env';

const CheckinCard = ({ checkin }) => {

  const [ restaurant, setRestaurant ] = useState({})
   
  useEffect(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/restaurants/${checkin.restaurant_id}`)
      setRestaurant(res.data)
    }catch (err) {
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Status:', err.response.status);
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Error', err.message);
      }
    }
  }, [])

  return (
    <View style={styles.card}>
      <Text style={styles.placeName}>Place: {restaurant.name}</Text>
      <Text style={styles.date}>Date: {checkin.date}</Text>
=======
import React from 'react';

const CheckinCard = ({ checkin }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.placeName}>Place: {checkin.place_name}</Text>
      <Text style={styles.date}>Date: {checkin.date}</Text>
      {checkin.notes ? <Text style={styles.notes}>Notes: {checkin.notes}</Text> : null}
>>>>>>> KhyBranch
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

<<<<<<< HEAD
export default CheckinCard;
=======
export default CheckinCard;
>>>>>>> KhyBranch
