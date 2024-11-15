import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { FontAwesome } from '@expo/vector-icons';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

const MAX_POINTS = 600;

const PointsCard = React.memo(({ points, onPress }) => {
  const clampedPoints = Math.min(points, MAX_POINTS);
  const progressPercentage = (clampedPoints / MAX_POINTS) * 100;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      accessible={true}
      accessibilityLabel={`You have earned ${clampedPoints} points out of ${MAX_POINTS}`}
    >
      <View style={styles.iconContainer}>
        <FontAwesome name="star" size={24} color="#F85E00" />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Your Points</Text>
        <AnimatedCircularProgress
          size={120}
          width={12}
          fill={progressPercentage}
          tintColor="#A41623"
          backgroundColor="#E0E0E0"
          lineCap="round"
          rotation={0}
          duration={1000}
          easing="easeInOut"
        >
          {() => (
            <Text style={styles.pointsText}>
              {points} Points
            </Text>
          )}
        </AnimatedCircularProgress>
        <Text style={styles.progressText}>
          {clampedPoints} / {MAX_POINTS} Points
        </Text>
      </View>
    </TouchableOpacity>
  );
});

PointsCard.propTypes = {
  points: PropTypes.number.isRequired,
  onPress: PropTypes.func,
};

PointsCard.defaultProps = {
  onPress: () => {},
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    marginVertical: 10,
    backgroundColor: '#FFF5E1',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderColor: '#A41623',
    borderWidth: 1,
  },
  iconContainer: {
    marginRight: 15,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Itim', // Assuming a custom font like Itim
    color: '#A41623',
    marginBottom: 8,
  },
  pointsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F85E00',
  },
  progressText: {
    fontSize: 14,
    color: '#198754',
    marginTop: 8,
  },
});

export default PointsCard;
