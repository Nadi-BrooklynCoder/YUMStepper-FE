import { View, Text } from 'react-native';
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../Context/AuthContext';
import StepsCard from './StepsCard';

const StepsContainer = ({ displayType }) => {
  const { userId, userToken, stepsToPoints } = useContext(AuthContext);
  const [stepsData, setStepsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSteps = async () => {
      try {
        const response = await axios.get(`https://demo-day-be.onrender.com/users/${userId}/steps`, {
          headers: { Authorization: `${userToken}` },
        });
        Array.isArray(response.data) && setStepsData(response.data);
        setLoading(false);
      } catch (err) {
        // Handle errors
        setLoading(false);
      }
    };

    fetchSteps();
  }, [userId, userToken]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View>
      <Text>{displayType === 'steps' ? 'Steps:' : 'Points:'}</Text>
      {stepsData.map((step, index) => (
        <StepsCard
          key={index}
          step={step}
          displayType={displayType}
          stepsToPoints={stepsToPoints}
        />
      ))}
    </View>
  );
};

export default StepsContainer;
