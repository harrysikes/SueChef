# SueChef Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
   EXPO_PUBLIC_OPENAI_API_KEY=your-openai-api-key
   ```

3. **Firebase Setup**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project
   - Enable Authentication:
     - Email/Password
     - Anonymous
     - Apple (for iOS)
   - Create a Firestore database
   - Copy your config values to `.env`

4. **OpenAI Setup**
   - Go to [OpenAI Platform](https://platform.openai.com)
   - Create an API key
   - Add to `.env` as `EXPO_PUBLIC_OPENAI_API_KEY`

5. **Run the App**
   ```bash
   npm start
   ```
   - Press `i` for iOS Simulator
   - Or scan QR code with Expo Go on your iPhone

## Project Structure

```
/app
  /(auth)          # Authentication screens
    index.tsx      # Main auth screen (Apple, Email, Guest)
    signin.tsx     # Email sign in
    signup.tsx     # Email sign up
  /(tabs)          # Main app screens
    index.tsx      # Home dashboard
    chat.tsx       # Sue AI chat interface
    grocery.tsx    # Grocery lists management
    grocery/[id].tsx # Grocery list detail
    pantry.tsx     # Pantry inventory
    cooking.tsx    # Cooking mode
/store             # Zustand state management
  authStore.ts     # Authentication state
  pantryStore.ts   # Pantry items
  groceryStore.ts  # Grocery lists
  mealStore.ts     # Meal plans
  reminderStore.ts # Reminders
/services          # External services
  firebase.ts      # Firebase config
  auth.ts          # Authentication functions
  ai.ts            # OpenAI integration
  vision.ts        # Recipe image parsing
  notifications.ts # Push notifications
/components        # Reusable components
  GroceryListCard.tsx
  PantryItemRow.tsx
/utils
  date.ts          # Day.js utilities
```

## Features Implemented

✅ Authentication (Apple Sign In, Email/Password, Anonymous)
✅ Home Dashboard (meals, reminders, expiring items)
✅ Chat with Sue (OpenAI integration)
✅ Grocery Lists (manual creation, recipe text/image parsing)
✅ Pantry Tracking (with expiration dates)
✅ Cooking Mode (step-by-step instructions)
✅ Recipe to Grocery List (text and image)
✅ List Compilation (merge multiple lists)

## Features to Enhance

- Meal planning with automatic pantry deduction
- Smart notifications (defrost, expiration)
- Voice input (future)
- Recipe suggestions based on expiring items
- Advanced meal scheduling

## iOS Permissions

The app requests:
- Camera (for recipe photos)
- Photo Library (for selecting images)
- Notifications (for reminders)

All permissions are configured in `app.json`.

## Troubleshooting

**Firebase errors**: Make sure your Firebase project has Firestore enabled and authentication methods configured.

**OpenAI errors**: Verify your API key is correct and you have credits available.

**Image picker not working**: Check that permissions are granted in iOS Settings.

**Notifications not working**: Ensure notifications are enabled in iOS Settings for the app.



