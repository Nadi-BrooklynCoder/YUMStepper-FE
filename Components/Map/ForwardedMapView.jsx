import React, { forwardRef } from "react";
import MapView from 'react-native-maps'

const ForwardMapView = forwardRef((props, ref) => (
    <MapView ref={ref} {...props} />
));

export default ForwardMapView;