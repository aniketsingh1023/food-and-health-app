/**
 * Simple toast/snackbar for transient feedback.
 * Usage: import { useToast } from './Toast'; const { showToast, ToastView } = useToast();
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

interface UseToastReturn {
  showToast: (message: string, type?: ToastType) => void;
  ToastView: React.ReactElement;
}

export function useToast(): UseToastReturn {
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'success', visible: false });
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToast({ message, type, visible: true });
    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    timeoutRef.current = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
        setToast(prev => ({ ...prev, visible: false }));
      });
    }, 2800);
  }, [opacity]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const bgColor = toast.type === 'success' ? '#16a34a' : toast.type === 'error' ? '#ef4444' : '#334155';

  const ToastView = (
    toast.visible ? (
      <Animated.View
        style={[styles.container, { opacity, backgroundColor: bgColor }]}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
      >
        <Text style={styles.text}>{toast.message}</Text>
      </Animated.View>
    ) : <View style={styles.hidden} />
  );

  return { showToast, ToastView };
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 96,
    left: 16,
    right: 16,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  hidden: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
});
