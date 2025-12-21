import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function Index() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return null;
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)" />;
}



