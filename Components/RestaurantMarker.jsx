import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Marker } from 'react-native-maps';

import React from 'react';

const RestaurantMarker = ({ restaurant }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);

    const onMarkerPress = () => {
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    return (
        <>
            <Marker coordinate={{
                latitude: restaurant.latitude,
                longitude: restaurant.longitude,
                }} title={restaurant.name} description={restaurant.description} onPress={onMarkerPress}/>
            {isModalVisible && (
                <Modal animationType="slide" transparent={true} visible={isModalVisible} onRequestClose={closeModal}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.restaurantName}>{restaurant.name}</Text>
                            <Text style={styles.restaurantDescription}>
                                {restaurant.description}
                            </Text>
                            <TouchableOpacity onPress={closeModal}>
                                <View style={styles.closeButton}>
                                <Text style={styles.closeText}>Close</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    restaurantName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    restaurantDescription: {
        fontSize: 16,
        marginBottom: 20,
    },
    closeButton: {
        padding: 10,
        backgroundColor: 'red',
        borderRadius: 5,
    },
    closeText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default RestaurantMarker;
