import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { format } from 'date-fns';

const CheckinCard = ({ checkin }) => {
  // Make sure `checkin.date` is in a valid format for JavaScript Date
  const formattedDate = checkin.date ? format(new Date(checkin.date), 'MMMM dd, yyyy') : 'Invalid date';

  return (
    <View style={styles.card}>
      <Text style={styles.placeName} accessibilityLabel={`Place name is ${checkin.place_name}`}>
        Place: {checkin.place_name}
      </Text>
      <Text style={styles.date} accessibilityLabel={`Check-in date is ${formattedDate}`}>
        Date: {formattedDate}
      </Text>
      {checkin.notes && (
        <Text style={styles.notes} accessibilityLabel={`Notes: ${checkin.notes}`}>
          Notes: {checkin.notes}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    // padding: 10,
    // marginVertical: 5,
    // backgroundColor: '#eee',
    // borderRadius: 5,
    // shadowColor: '#000',  // Optional: add shadow for better card visibility
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.3,
    // shadowRadius: 2,
    // elevation: 3, // For Android shadow
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
