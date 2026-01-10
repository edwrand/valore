import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight, borderRadius } from '../styles/theme';
import { getInitials, stringToColor } from '../lib/formatters';

interface AvatarProps {
  uri?: string | null;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const SIZES = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

const FONT_SIZES = {
  xs: fontSize.xs,
  sm: fontSize.sm,
  md: fontSize.base,
  lg: fontSize.xl,
  xl: fontSize['2xl'],
};

export default function Avatar({ uri, name, size = 'md' }: AvatarProps) {
  const dimension = SIZES[size];
  const textSize = FONT_SIZES[size];

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[
          styles.image,
          {
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
          },
        ]}
      />
    );
  }

  const initials = getInitials(name ?? null);
  const bgColor = stringToColor(name || 'default');

  return (
    <View
      style={[
        styles.placeholder,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          backgroundColor: bgColor,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: textSize }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.backgroundTertiary,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: colors.textInverse,
    fontWeight: fontWeight.semibold,
  },
});
