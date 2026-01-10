import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../styles/theme';

interface TagPillProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  size?: 'sm' | 'md';
  variant?: 'default' | 'outline';
}

export default function TagPill({
  label,
  selected = false,
  onPress,
  size = 'md',
  variant = 'default',
}: TagPillProps) {
  const Container = onPress ? TouchableOpacity : View;

  const containerStyles = [
    styles.container,
    styles[`size_${size}`],
    variant === 'outline' && styles.outline,
    selected && styles.selected,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${size}`],
    variant === 'outline' && styles.textOutline,
    selected && styles.textSelected,
  ];

  return (
    <Container
      style={containerStyles}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={textStyles}>{label}</Text>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.full,
  },
  size_sm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  size_md: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  text: {
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  text_sm: {
    fontSize: fontSize.xs,
  },
  text_md: {
    fontSize: fontSize.sm,
  },
  textOutline: {
    color: colors.textSecondary,
  },
  textSelected: {
    color: colors.textInverse,
  },
});
