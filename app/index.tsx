import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function Index() {
  const { loading } = useAuthStore();

  // Skip sign-in for now – go straight to main app
  if (loading) return null;
  return <Redirect href="/(tabs)" />;
}



