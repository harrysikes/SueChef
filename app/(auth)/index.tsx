import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { signInAnonymously, signInWithApple } from '@/services/auth';
import { useEffect } from 'react';

export default function AuthScreen() {
  const router = useRouter();
  const { user, loading } = useAuthStore();

  useEffect(() => {
    if (user && !loading) {
      router.replace('/(tabs)');
    }
  }, [user, loading]);

  const handleAppleSignIn = async () => {
    try {
      await signInWithApple();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Apple Sign In error:', error);
    }
  };

  const handleGuestMode = async () => {
    try {
      await signInAnonymously();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Anonymous sign in error:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>SueChef</Text>
        <Text style={styles.subtitle}>Your AI Cooking Assistant</Text>

        <Pressable style={styles.appleButton} onPress={handleAppleSignIn}>
          <Text style={styles.appleButtonText}>Continue with Apple</Text>
        </Pressable>

        <Pressable style={styles.emailButton} onPress={() => router.push('/(auth)/signin')}>
          <Text style={styles.emailButtonText}>Sign in with Email</Text>
        </Pressable>

        <Pressable style={styles.guestButton} onPress={handleGuestMode}>
          <Text style={styles.guestButtonText}>Continue as Guest</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 48,
    fontFamily: 'System',
  },
  appleButton: {
    width: '100%',
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  appleButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'System',
  },
  emailButton: {
    width: '100%',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  emailButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'System',
  },
  guestButton: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
  },
  guestButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '400',
    fontFamily: 'System',
  },
});



