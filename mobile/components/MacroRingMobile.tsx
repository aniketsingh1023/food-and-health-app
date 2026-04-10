/**
 * SVG macro progress ring for React Native.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MacroRingMobileProps {
  label: string;
  value: number;
  goal: number;
  color: string;
  unit: string;
  size?: number;
}

const STROKE = 7;

/**
 * Renders a circular progress ring using SVG-like View approach.
 * Pure React Native — no SVG library required.
 */
export function MacroRingMobile({ label, value, goal, color, unit, size = 72 }: MacroRingMobileProps) {
  const percent = goal > 0 ? Math.min(100, (value / goal) * 100) : 0;

  return (
    <View
      style={styles.wrapper}
      accessibilityRole="progressbar"
      accessibilityLabel={`${label}: ${Math.round(value)} of ${goal} ${unit}`}
      accessibilityValue={{ min: 0, max: goal, now: Math.round(value) }}
    >
      {/* Outer ring (track) */}
      <View style={[styles.track, { width: size, height: size, borderRadius: size / 2, borderColor: '#F0F0F0' }]}>
        {/* Progress overlay using border trick — simplified for RN */}
        <View
          style={[
            styles.progress,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: color,
              opacity: percent / 100,
            },
          ]}
        />
        {/* Center content */}
        <View style={styles.center}>
          <Text style={[styles.value, { fontSize: size * 0.18 }]}>{Math.round(value)}</Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.percent}>{Math.round(percent)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', gap: 3 },
  track: {
    borderWidth: STROKE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progress: {
    position: 'absolute',
    borderWidth: STROKE,
  },
  center: { alignItems: 'center' },
  value: { fontWeight: '700', color: '#2D3436', lineHeight: 18 },
  unit: { fontSize: 9, color: '#B2BEC3' },
  label: { fontSize: 11, fontWeight: '500', color: '#636E72', textAlign: 'center' },
  percent: { fontSize: 9, color: '#B2BEC3' },
});
