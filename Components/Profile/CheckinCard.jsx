import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format, parseISO } from 'date-fns';

const CheckinCard = ({ checkin, restaurantName }) => {
  console.log(`CheckinCard - ID: ${checkin.id}, check_in_points: ${checkin.check_in_points}, multiplier_points: ${checkin.multiplier_points}`);

  const formatDate = (date) => {
    try {
      const parsedDate = parseISO(date);
      return !isNaN(parsedDate) ? format(parsedDate, 'MMMM dd, yyyy') : 'Invalid date';
    } catch {
      return 'Date not available';
    }
  };

  const formattedDate = checkin?.created_at ? formatDate(checkin.created_at) : 'Date not available';
  const checkInPoints = Number(checkin?.check_in_points) || 0;
  const multiplierPoints = Number(checkin?.multiplier_points) || 0;
  const pointsEarned = checkInPoints + multiplierPoints;

  return (
    <View style={styles.card}>
      <Text style={styles.placeName}>Restaurant: {restaurantName || 'Unknown Restaurant'}</Text>
      <Text style={styles.date}>Date: {formattedDate}</Text>
      <Text style={styles.pointsEarned}>Points Earned: {pointsEarned}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 15, // Add horizontal margin to create space on the sides
    backgroundColor: '#FFF5E1',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderColor: '#A41623',
    borderWidth: 1,
    width: '90%', // Adjust width to make the card narrower
    alignSelf: 'center', // Center the card within its parent container
  },
  placeName: {
    fontSize: 18,
    fontFamily: 'Itim',
    color: '#A41623',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    fontFamily: 'Open Sans',
    color: '#444',
    marginBottom: 5,
  },
  pointsEarned: {
    fontSize: 16,
        fontWeight: 'bold',
        color: '#198754',
        marginBottom: 5,
  },
});

export default CheckinCard;
