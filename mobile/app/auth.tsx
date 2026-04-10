/**
 * Google sign-in screen for the mobile app.
 *
 * Dependencies to install:
 *   expo install expo-auth-session expo-web-browser @react-native-async-storage/async-storage
 */

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

export const USER_STORAGE_KEY = '@nutriai_user';

export interface MobileUser {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export default function AuthScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      fetchUserAndStore(response.authentication?.accessToken);
    } else if (response?.type === 'error') {
      setError('Sign-in failed. Please try again.');
      setLoading(false);
    }
  }, [response]);

  async function fetchUserAndStore(accessToken?: string | null) {
    if (!accessToken) {
      setError('No access token received.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const user: MobileUser = await res.json();
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      router.replace('/');
    } catch {
      setError('Could not fetch your profile. Please try again.');
      setLoading(false);
    }
  }

  async function handleSignIn() {
    setError(null);
    setLoading(true);
    await promptAsync();
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>

        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>N</Text>
          </View>
          <Text style={styles.appName}>NutriAI</Text>
          <Text style={styles.tagline}>Food Intelligence</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.heading}>Welcome</Text>
          <Text style={styles.subheading}>
            Sign in or create an account to track your nutrition and habits.
          </Text>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.googleBtn, (loading || !request) && styles.googleBtnDisabled]}
            onPress={handleSignIn}
            disabled={loading || !request}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#5f6368" size="small" />
            ) : (
              <GoogleIcon />
            )}
            <Text style={styles.googleBtnText}>
              {loading ? 'Redirecting...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.legal}>
            By continuing, you agree to our terms of service and privacy policy.
          </Text>
        </View>

        <Text style={styles.footer}>Powered by Gemini AI</Text>
      </View>
    </SafeAreaView>
  );
}

function GoogleIcon() {
  // Inline SVG-equivalent using View shapes (React Native doesn't render SVG natively)
  return (
    <View style={styles.googleIcon}>
      <Text style={styles.googleIconText}>G</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  tagline: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  subheading: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 13,
    color: '#dc2626',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  googleBtnDisabled: {
    opacity: 0.6,
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  legal: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 16,
  },
  footer: {
    fontSize: 11,
    color: '#cbd5e1',
    marginTop: 24,
  },
});
