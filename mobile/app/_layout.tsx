/**
 * Root layout with tab navigation and auth gate.
 */

import { useEffect, useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USER_STORAGE_KEY } from './auth';

export default function RootLayout() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(USER_STORAGE_KEY).then(value => {
      if (!value) router.replace('/auth');
      setChecked(true);
    });
  }, []);

  if (!checked) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#00B894',
          tabBarInactiveTintColor: '#B2BEC3',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#F0F0F0',
            paddingBottom: 4,
            height: 60,
          },
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerShadowVisible: false,
          headerTitleStyle: {
            fontWeight: '700',
            color: '#2D3436',
            fontSize: 18,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarLabel: 'Dashboard',
            tabBarIcon: ({ color }) => (
              <TabIcon emoji="🏠" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="log"
          options={{
            title: 'Log Food',
            tabBarLabel: 'Log',
            tabBarIcon: ({ color }) => (
              <TabIcon emoji="➕" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="habits"
          options={{
            title: 'Habits',
            tabBarLabel: 'Habits',
            tabBarIcon: ({ color }) => (
              <TabIcon emoji="🎯" color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
}

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  // Using Text as icon for simplicity (no additional icon package needed)
  const { Text } = require('react-native');
  return <Text style={{ fontSize: 20, opacity: color === '#00B894' ? 1 : 0.5 }}>{emoji}</Text>;
}
