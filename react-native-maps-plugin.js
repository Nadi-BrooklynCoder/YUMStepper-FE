const { withAndroidManifest, withInfoPlist } = require('@expo/config-plugins');

// Config Plugin for react-native-maps
module.exports = function withReactNativeMaps(config) {
  // Add Google Maps API key to iOS Info.plist
  config = withInfoPlist(config, (config) => {
    config.modResults.GMSApiKey = process.env.GOOGLE_API_KEY;
    return config;
  });

  // Modify AndroidManifest.xml to add Google Maps API key
  config = withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest.application.find(
      (app) => app['$']['android:name'] === '.MainApplication'
    );

    if (mainApplication) {
      const metaData = {
        $: {
          'android:name': 'com.google.android.geo.API_KEY',
          'android:value': process.env.GOOGLE_API_KEY,
        },
      };
      mainApplication['meta-data'] = mainApplication['meta-data'] || [];
      mainApplication['meta-data'].push(metaData);
    }

    return config;
  });

  return config;
};
