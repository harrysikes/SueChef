# SueChef — AI Cooking & Grocery Assistant

A React Native (Expo) mobile app where users interact with an AI assistant named **Sue** to plan meals, generate and manage grocery lists, track pantry inventory & expiration dates, get cooking help in real time, and reduce food waste.

## Setup Instructions

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac) or Expo Go app on your iPhone

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Email/Password and Anonymous)
   - Create a Firestore database
   - Copy your Firebase config to `.env` file:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

3. Configure OpenAI:
   - Get an API key from https://platform.openai.com
   - Add to `.env`:
   ```
   EXPO_PUBLIC_OPENAI_API_KEY=your-openai-api-key
   ```

4. Start the development server:
```bash
npm start
```

5. Run on iOS:
   - Press `i` in the terminal to open iOS Simulator
   - Or scan the QR code with Expo Go app on your iPhone

## Features

- **Authentication**: Apple Sign In, Email/Password, and Anonymous guest mode
- **Home Dashboard**: View meals, reminders, and expiring items
- **Chat with Sue**: Conversational AI assistant for cooking help
- **Grocery Lists**: Create, manage, and compile multiple lists
- **Pantry Tracking**: Track inventory with expiration dates
- **Meal Planning**: Schedule meals and auto-deduct ingredients
- **Smart Reminders**: Defrost and expiration notifications

## Project Structure

```
/app
  /(auth)          # Authentication screens
  /(tabs)          # Main app screens (Home, Chat, Grocery, Pantry)
/components        # Reusable components
/store             # Zustand state management
/services          # Firebase, AI, notifications
/utils             # Helper functions
```

## Development Status

This is the initial setup with core features implemented. Additional features like recipe image parsing, cooking mode, and advanced meal planning are ready to be enhanced.

## License

MIT



