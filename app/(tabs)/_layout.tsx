import { Tabs } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Redirect } from 'expo-router';

export default function TabsLayout() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          borderTopWidth: 0.5,
          borderTopColor: '#E5E5E5',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Sue',
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="grocery"
        options={{
          title: 'Grocery',
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="pantry"
        options={{
          title: 'Pantry',
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="cooking"
        options={{
          title: 'Cooking',
          tabBarIcon: () => null,
        }}
      />
    </Tabs>
  );
}

