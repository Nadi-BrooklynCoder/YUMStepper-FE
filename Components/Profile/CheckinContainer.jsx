import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, RefreshControl, FlatList, Button } from 'react-native';
import { AuthContext } from '../../Context/AuthContext';
import axios from 'axios';
import CheckinCard from './CheckinCard';
import { API_BASE_URL } from '@env';

const CheckinContainer = ({ refreshTrigger }) => {
  const { userId, userToken } = useContext(AuthContext);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Function to load check-ins from the server
  const loadCheckins = async () => {
    if (!userId || !userToken) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userId}/checkins`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      const fetchedCheckins = response.data.map(checkin => ({
        ...checkin,
        points_earned: Number(checkin.points_earned) || 0,
        check_in_points: Number(checkin.check_in_points) || 0,
        multiplier_points: Number(checkin.multiplier_points) || 0,
      }));

      // Ensure unique check-ins based on ID
      const uniqueCheckins = Array.from(
        new Map(fetchedCheckins.map((item) => [item.id, item])).values()
      );

      console.log("Unique check-ins:", uniqueCheckins);
      setCheckins(uniqueCheckins);
    } catch (err) {
      setError('Failed to load check-ins.');
      console.error('Error fetching check-ins:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Manual refresh function
  const onRefresh = () => {
    setRefreshing(true);
    loadCheckins();
  };

  // Reload check-ins whenever `refreshTrigger` or `userId` changes
  useEffect(() => {
    if (userId) {
      console.log("Refresh trigger or user ID updated:", refreshTrigger);
      loadCheckins();
    }
  }, [refreshTrigger, userId, userToken]);

  // Render loading indicator when data is being fetched
  if (loading && !refreshing) {
    return <ActivityIndicator size="large" color="#F2632F" style={styles.loadingIndicator} />;
  }

  // Render error message with retry option if an error occurs during fetch
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={loadCheckins} />
      </View>
    );
  }

  // Render message if no check-ins are found
  if (checkins.length === 0) {
    return <Text style={styles.emptyText}>No check-ins found.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Check-ins</Text>
      <FlatList
        data={checkins}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CheckinCard
            checkin={item}
            restaurantName={item.restaurant_name || 'Unknown Restaurant'}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Allow the container to take the full height of the screen to enable independent scrolling
    backgroundColor: '#FFEEDD',
    paddingVertical: 20,
    marginVertical: 10,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#A41623',
    marginBottom: 15,
    textAlign: 'center',
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  errorText: {
    textAlign: 'center',
    color: '#D9534F',
    fontSize: 16,
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6C757D',
    marginTop: 20,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 50, // Add bottom padding to make sure the list can scroll smoothly to the last item
  },
});

export default CheckinContainer;
