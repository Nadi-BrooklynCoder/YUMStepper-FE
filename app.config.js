require('dotenv').config();
const withReactNativeMaps = require('./react-native-maps-plugin');

module.exports = ({ config }) => ({
  ...config,
  name: 'YumStepper-FE',
  slug: 'YumStepper-FE-New',
  version: '1.0.0',
  owner: 'nad1191',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.nad1191.YumStepperFENew',
    config: {
      usesNonExemptEncryption: false,
      googleMapsApiKey: process.env.GOOGLE_API_KEY,
    },
    infoPlist: {
      NSLocationWhenInUseUsageDescription: 'We need your location to show nearby restaurants, walking directions, and enhance your experience.',
      NSLocationAlwaysUsageDescription: 'We use your location to provide directions and show nearby places, even when the app is in the background.',
      NSLocationAlwaysAndWhenInUseUsageDescription: 'Allow YumStepper-FE to access your location to provide the best experience, even when running in the background.'
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    permissions: [
      'ACCESS_FINE_LOCATION',
      'ACCESS_BACKGROUND_LOCATION',
    ],
    package: 'com.nad1191.YumStepperFENew',
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    withReactNativeMaps,
    "expo-font",
    "expo-secure-store",
  ],
  extra: {
    apiBaseUrl: process.env.API_BASE_URL,
    googleApiKey: process.env.GOOGLE_API_KEY,
    eas: {
      projectId: '7544a13a-d5de-4846-be20-36cbea9108ff',
    },
  },
  assetBundlePatterns: [
    "**/*", // This bundles all assets in your project
    "assets/fonts/*" // Specifically bundles all fonts from your fonts directory
  ],
});
