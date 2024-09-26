import { View, Text } from 'react-native'
import React from 'react'
import MapComponent from '../Components/MapComponent'

const Map = ({route}) => {
    return (
        <View>
            <Text>Map</Text>
            <MapComponent route={route}/>
        </View>
    )
}

export default Map