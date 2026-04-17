/**
 * Root layout — tab navigation with all 6 screens matching the web app.
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const GREEN = '#16a34a';
const INACTIVE = '#94a3b8';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 19, opacity: focused ? 1 : 0.55 }}>
      {emoji}
    </Text>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: GREEN,
          tabBarInactiveTintColor: INACTIVE,
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#f1f5f9',
            borderTopWidth: 1,
            // Extra bottom padding for home-indicator phones (handled by safe area on iOS)
            paddingBottom: Platform.OS === 'android' ? 6 : 0,
            height: Platform.OS === 'android' ? 60 : undefined,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
          },
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerShadowVisible: false,
          headerTitleStyle: {
            fontWeight: '700',
            color: '#1e293b',
            fontSize: 17,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarLabel: 'Home',
            tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="log"
          options={{
            title: 'Log Food',
            tabBarLabel: 'Log',
            tabBarIcon: ({ focused }) => <TabIcon emoji="➕" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="suggest"
          options={{
            title: 'Suggest',
            tabBarLabel: 'Suggest',
            tabBarIcon: ({ focused }) => <TabIcon emoji="✨" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="habits"
          options={{
            title: 'Habits',
            tabBarLabel: 'Habits',
            tabBarIcon: ({ focused }) => <TabIcon emoji="🎯" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="insights"
          options={{
            title: 'Insights',
            tabBarLabel: 'Insights',
            tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="goals"
          options={{
            title: 'My Goals',
            tabBarLabel: 'Goals',
            tabBarIcon: ({ focused }) => <TabIcon emoji="🎖️" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'AI Coach',
            tabBarLabel: 'Chat',
            tabBarIcon: ({ focused }) => <TabIcon emoji="💬" focused={focused} />,
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
}
