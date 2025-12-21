import {
  signInAnonymously as firebaseSignInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from './firebase';
import * as AppleAuthentication from 'expo-apple-authentication';
import { signInWithCredential, OAuthProvider } from 'firebase/auth';

export const signInAnonymously = async () => {
  return await firebaseSignInAnonymously(auth);
};

export const signInWithEmail = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = async (email: string, password: string) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const signInWithApple = async () => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      throw new Error('Apple Sign In failed - no identity token');
    }

    const provider = new OAuthProvider('apple.com');
    const credentialOptions: { idToken: string; rawNonce?: string } = {
      idToken: credential.identityToken,
    };
    // nonce is optional in newer versions of expo-apple-authentication
    if ('nonce' in credential && (credential as any).nonce) {
      credentialOptions.rawNonce = (credential as any).nonce;
    }
    const credential_firebase = provider.credential(credentialOptions);

    return await signInWithCredential(auth, credential_firebase);
  } catch (error: any) {
    if (error.code === 'ERR_REQUEST_CANCELED') {
      throw new Error('Sign in was cancelled');
    }
    throw error;
  }
};

export const signOut = async () => {
  return await auth.signOut();
};


