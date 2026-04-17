/**
 * Skeleton placeholder card for loading states.
 * Uses an Animated pulse — no external library required.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface SkeletonCardProps {
  lines?: number;
}

export function SkeletonCard({ lines = 3 }: SkeletonCardProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.card, { opacity }]} accessibilityLabel="Loading">
      <View style={[styles.line, { width: '45%' }]} />
      <View style={[styles.line, { width: '75%', height: 18 }]} />
      {Array.from({ length: Math.max(0, lines - 2) }).map((_, i) => (
        <View key={i} style={[styles.line, { width: i === 0 ? '60%' : '90%' }]} />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  line: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
  },
});
