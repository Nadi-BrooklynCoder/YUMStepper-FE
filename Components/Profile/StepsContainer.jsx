// StepsContainer.js

import { View, Text } from 'react-native';
import React, { useContext } from 'react';
import { AuthContext } from '../../Context/AuthContext';
import StepsCard from './StepsCard';

const StepsContainer = ({ displayType }) => {
  const { userSteps, stepsToPoints } = useContext(AuthContext);

  return (
    <View>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 10 }}>
        {displayType === 'steps' ? 'Steps:' : 'Points:'}
      </Text>
      <StepsCard
        step={userSteps}
        displayType={displayType}
        stepsToPoints={stepsToPoints}
      />
    </View>
  );
};

export default StepsContainer;
