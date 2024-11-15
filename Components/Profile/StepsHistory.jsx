import React, { useContext, useEffect } from 'react';
import { FlatList, View, Text, StyleSheet, Dimensions } from 'react-native';
import StepsCard from './StepsCard';
import { AuthContext } from '../../Context/AuthContext';

const { height } = Dimensions.get('window');

const StepsHistory = () => {
    const { stepsHistory, userToken } = useContext(AuthContext);

    useEffect(() => {
        console.log("StepsHistory component rendered. Steps history data:", stepsHistory);
    }, [stepsHistory]);

    // Ensure user is authenticated
    if (!userToken) {
        return null;
    }

    // Directly use the date from stepsHistory without additional formatting
    const filteredStepsHistory = stepsHistory?.map(item => ({
        ...item,
        total_steps: parseInt(item.total_steps, 10), // Ensure steps are numbers
        total_points: parseInt(item.total_points, 10),
    })).filter(item => item.step_count != null) || [];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Monthly Step History</Text>
            {filteredStepsHistory.length > 0 ? (
                <FlatList
                    data={filteredStepsHistory}
                    renderItem={({ item }) => {
                        console.log("Rendering StepsCard for item:", item);
                        return <StepsCard step={item} />;
                    }}
                    keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
                    style={styles.list}
                />
            ) : (
                <Text style={styles.noHistoryText}>No step history available.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFEEDD',
        paddingHorizontal: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 15,
    },
    list: {
        maxHeight: height * 0.3,
    },
    noHistoryText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default StepsHistory;
