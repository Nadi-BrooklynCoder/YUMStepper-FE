// ForwardedMapView.js

import React, { forwardRef } from 'react';
import MapView from 'react-native-maps';

const ForwardedMapView = forwardRef((props, ref) => (
    <MapView {...props} ref={ref} />
));

export default ForwardedMapView;
