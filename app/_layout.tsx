import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { usePantryStore } from '@/store/pantryStore';
import { useGroceryStore } from '@/store/groceryStore';
import { useMealStore } from '@/store/mealStore';
import { useReminderStore } from '@/store/reminderStore';

export default function RootLayout() {
  const { setUser, setLoading, user } = useAuthStore();
  const { loadItems } = usePantryStore();
  const { loadLists } = useGroceryStore();
  const { loadMeals } = useMealStore();
  const { loadReminders } = useReminderStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        // Load user data when authenticated
        await Promise.all([
          loadItems(),
          loadLists(),
          loadMeals(),
          loadReminders(),
        ]);
      }
    });

    return unsubscribe;
  }, [setUser, setLoading, loadItems, loadLists, loadMeals, loadReminders]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

