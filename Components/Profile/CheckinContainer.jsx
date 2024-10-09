import { View, Text, StyleSheet } from 'react-native';
import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../Context/AuthContext';
import axios from 'axios';
import CheckinCard from './CheckinCard';

const CheckinContainer = () => {
  const { userId } = useContext(AuthContext);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCheckins = async () => {
      try {
        const response = await axios.get(`https://demo-day-be.onrender.com/checkins`);
        const userCheckins = response.data.filter((ci) => ci.user_id == userId);
        setCheckins(userCheckins);
        setLoading(false);
      } catch (err) {
        if (err.response) {
          console.error('Error response:', err.response.data);
          console.error('Status:', err.response.status);
        } else if (err.request) {
          console.error('No response received:', err.request);
        } else {
          console.error('Error', err.message);
        }
        setLoading(false);
      }
    };

    fetchCheckins();
  }, [userId]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (checkins.length === 0) {
    return <Text>No check-ins found.</Text>;
  }

  return (
    <View style={styles.container}>
      {checkins.map((checkin) => (
        <CheckinCard checkin={checkin} key={checkin.id} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F2632F',
    padding: 10,
  },
});

export default CheckinContainer;
