import React from 'react';
// import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { StyleSheet, View, Text } from 'react-native';
import { GOOGLE_API_KEY } from '@env'

const MapComponent = () => {



  return ( 
    <></>
//     <MapView
//     provider={PROVIDER_GOOGLE} // Use Google Maps
//     style={styles.map}
//     initialRegion={{
//         latitude: 37.78825,
//         longitude: -122.4324,
//         latitudeDelta: 0.0922,
//         longitudeDelta: 0.0421,
//     }}
//     // Add your Google Maps API key
//     googleMapsApiKey={GOOGLE_API_KEY}
// >
//     <Marker
//         coordinate={{
//             latitude: 37.78825,
//             longitude: -122.4324,
//         }}
//         title="My Marker"
//         description="Here is a description"
//     />
// </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
});

export default MapComponent;