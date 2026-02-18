import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function RootLayout() {
  const { setLoading } = useAuthStore();

  // Skip Firebase Auth for now – go straight into the app. Re-enable auth in _layout when ready.
  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export const unstable_settings = { initialRouteName: 'index' };

