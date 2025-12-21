import { View, Text, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { signInWithEmail } from '@/services/auth';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Sign In Failed', error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Sign In</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </Pressable>

        <Pressable onPress={() => router.push('/(auth)/signup')}>
          <Text style={styles.linkText}>Don't have an account? Sign up</Text>
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
    paddingHorizontal: 32,
  },
  content: {
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 32,
    fontFamily: 'System',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 17,
    fontFamily: 'System',
  },
  button: {
    width: '100%',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'System',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 15,
    textAlign: 'center',
    fontFamily: 'System',
  },
});



