const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix "Component auth has not been registered yet" with Firebase Auth on Expo SDK 53 / RN 0.79.
// Disabling package exports avoids dual package hazard (Metro loading both CJS and ESM firebase/auth).
config.resolver.unstable_enablePackageExports = false;
config.resolver.unstable_enableSymlinks = false;

module.exports = config;


