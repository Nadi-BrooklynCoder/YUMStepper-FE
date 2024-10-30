import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { AuthContext } from '../../Context/AuthContext';
import axios from 'axios';
import CheckinCard from './CheckinCard';
import { API_BASE_URL } from '@env';

const CheckinContainer = () => {
  const { userId, userToken } = useContext(AuthContext);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(false); // Initially set to false

  useEffect(() => {
    isMounted.current = true;
    const fetchCheckins = async () => {
      console.log(`${API_BASE_URL}/users/${userId}/checkins`);
  
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/users/${userId}/checkins`, {
          headers: {
            Authorization: `Bearer ${userToken}`, // Add the user token here for authentication
          },
        });
        if (isMounted.current) {
          const userCheckins = response.data.filter((ci) => ci.user_id == userId);
          setCheckins(userCheckins);
        }
      } catch (err) {
        if (isMounted.current) {
          setError('Failed to load check-ins. Please try again later.');
          console.error('Error fetching check-ins:', err.message);
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };
  
    fetchCheckins();
  
    return () => {
      isMounted.current = false;
    };
  }, [userId, userToken]); // Ensure userToken is included in the dependency list
  

  if (loading) {
    return <ActivityIndicator size="large" color="#F2632F" style={styles.loadingIndicator} />;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  if (checkins.length === 0) {
    return <Text style={styles.emptyText}>No check-ins found.</Text>;
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
    flex: 1, // Ensure the container takes up the full screen height
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    color: '#ff0000',
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#000',
    marginTop: 20,
  },
});

export default CheckinContainer;
