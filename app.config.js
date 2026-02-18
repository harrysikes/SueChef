// Load .env from project root so the API key is available
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const openAIKey = (process.env.EXPO_PUBLIC_OPENAI_API_KEY || '').trim();

module.exports = {
  expo: {
    name: 'SueChef',
    slug: 'suechef',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.suechef.app',
      infoPlist: {
        NSCameraUsageDescription: 'We need access to your camera to scan recipe photos.',
        NSPhotoLibraryUsageDescription: 'We need access to your photo library to select recipe images.',
        NSMicrophoneUsageDescription: 'We may need microphone access for future voice features.',
      },
    },
    assetBundlePatterns: ['**/*'],
    scheme: 'suechef',
    extra: {
      EXPO_PUBLIC_OPENAI_API_KEY: openAIKey,
    },
    plugins: [
      'expo-router',
      ['expo-notifications', { icon: './assets/icon.png', color: '#ffffff' }],
      ['expo-image-picker', { photosPermission: 'Allow SueChef to access your photos to scan recipes.' }],
    ],
  },
};
