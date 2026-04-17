/**
 * Macro progress ring for React Native.
 * Uses a border-based arc technique: two half-circle masks rotated proportionally.
 * Pure React Native — no SVG or third-party library required.
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

const STROKE = 6;

/**
 * Renders a circular progress ring.
 * Progress is shown by rotating two semicircle overlays on top of a full-color circle.
 */
export function MacroRingMobile({
  label,
  value,
  goal,
  color,
  unit,
  size = 70,
}: MacroRingMobileProps) {
  const pct = goal > 0 ? Math.min(1, value / goal) : 0;
  const deg = pct * 360;

  // Split degree into two rotations for the two-semicircle technique
  const firstHalfDeg = Math.min(deg, 180);
  const secondHalfDeg = Math.max(0, deg - 180);

  const innerSize = size - STROKE * 2;
  const percentLabel = Math.round(pct * 100);

  return (
    <View
      style={styles.wrapper}
      accessibilityRole="progressbar"
      accessibilityLabel={`${label}: ${Math.round(value)} of ${goal} ${unit}`}
      accessibilityValue={{ min: 0, max: goal, now: Math.round(value) }}
    >
      {/* Track ring */}
      <View
        style={[
          styles.track,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: STROKE,
            borderColor: '#e2e8f0',
          },
        ]}
      >
        {/* Full colored circle underneath — clipped to inner area */}
        <View
          style={[
            styles.coloredCircle,
            {
              width: size - STROKE,
              height: size - STROKE,
              borderRadius: (size - STROKE) / 2,
              backgroundColor: color,
              opacity: 0.12,
              top: -STROKE / 2,
              left: -STROKE / 2,
            },
          ]}
        />

        {/* Progress arc: left half */}
        <View
          style={[
            styles.halfCircleContainer,
            { width: size / 2, height: size, left: size / 2 },
          ]}
        >
          <View
            style={[
              styles.halfCircle,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: STROKE,
                borderColor: color,
                right: 0,
                transform: [{ rotate: `${firstHalfDeg}deg` }],
              },
            ]}
          />
        </View>

        {/* Progress arc: right half — only shown when > 50% */}
        {secondHalfDeg > 0 && (
          <View
            style={[
              styles.halfCircleContainer,
              { width: size / 2, height: size, left: 0 },
            ]}
          >
            <View
              style={[
                styles.halfCircle,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  borderWidth: STROKE,
                  borderColor: color,
                  left: 0,
                  transform: [{ rotate: `${secondHalfDeg - 180}deg` }],
                },
              ]}
            />
          </View>
        )}

        {/* Center label */}
        <View style={styles.center}>
          <Text style={[styles.valueText, { fontSize: size * 0.185 }]} numberOfLines={1}>
            {Math.round(value)}
          </Text>
          <Text style={styles.unitText}>{unit}</Text>
        </View>
      </View>
      <Text style={styles.labelText}>{label}</Text>
      <Text style={[styles.percentText, { color: pct > 1 ? '#ef4444' : '#94a3b8' }]}>
        {percentLabel}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', gap: 3 },
  track: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  coloredCircle: {
    position: 'absolute',
  },
  halfCircleContainer: {
    position: 'absolute',
    top: 0,
    overflow: 'hidden',
  },
  halfCircle: {
    position: 'absolute',
    top: 0,
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  valueText: {
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: 20,
  },
  unitText: { fontSize: 8, color: '#94a3b8' },
  labelText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
  },
  percentText: { fontSize: 9 },
});
