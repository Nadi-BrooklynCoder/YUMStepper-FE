import { View, Text } from 'react-native';
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../Context/AuthContext';
import StepsCard from './StepsCard';
import { API_BASE_URL } from '@env';

const StepsContainer = ({ displayType, steps }) => {
  const { stepsToPoints } = useContext(AuthContext);

  if (!steps || steps.length === 0) {
    return <Text>No steps data available.</Text>;
  }

  return (
    <View>
      <Text>{displayType === 'steps' ? 'Steps:' : 'Points:'}</Text>
      {steps.map((step, index) => (
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
