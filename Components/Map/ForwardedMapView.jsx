// ForwardMapView.ios.js

import React, { forwardRef } from 'react';
import MapView from 'react-native-maps';

const ForwardMapView = forwardRef((props, ref) => {
    return <MapView ref={ref} {...props} />;
});

export default ForwardMapView;
