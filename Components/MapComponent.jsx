import React, { useEffect, useState } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { StyleSheet, View, Text } from 'react-native';
import { GOOGLE_API_KEY, API_BASE_URL } from '@env'
import axios from 'axios';

const MapComponent = ({ route }) => {

  const { userId, token } = route.params;
  const [user, setUser] = useState({})

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/users/${userId}`);
        setUser(res.data)
      } catch (err) {
        console.error("failed to fetch user location", err)
      }
    }

    fetchUser()
  }, [])

  return (
    <MapView
      // provider={PROVIDER_GOOGLE} // Use Google Maps
      style={styles.map}
      initialRegion={{
          latitude: user.latitude,
          longitude: user.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
      }}
      // Add your Google Maps API key
      // googleMapsApiKey={GOOGLE_API_KEY}
    >
      <Marker
        coordinate={{
          latitude: user.latitude,
          longitude: user.longitude,
        }}
        title="My Marker"
        description="Here is a description"
      />
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
});

export default MapComponent;