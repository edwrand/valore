import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Star } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight } from '../styles/theme';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showLabel?: boolean;
  label?: string;
}

const SIZES = {
  sm: 14,
  md: 20,
  lg: 28,
};

export default function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  showLabel = false,
  label,
}: RatingStarsProps) {
  const starSize = SIZES[size];

  const renderStar = (index: number) => {
    const filled = index < rating;
    const halfFilled = index === Math.floor(rating) && rating % 1 >= 0.5;

    const StarComponent = interactive ? TouchableOpacity : View;

    return (
      <StarComponent
        key={index}
        onPress={interactive ? () => onChange?.(index + 1) : undefined}
        style={styles.star}
      >
        <Star
          size={starSize}
          color={filled || halfFilled ? colors.star : colors.starEmpty}
          fill={filled ? colors.star : 'transparent'}
        />
      </StarComponent>
    );
  };

  return (
    <View>
      {(showLabel || label) && (
        <Text style={styles.label}>{label || 'Rating'}</Text>
      )}
      <View style={styles.container}>
        {Array.from({ length: maxRating }, (_, i) => renderStar(i))}
        {!interactive && rating > 0 && (
          <Text style={[styles.ratingText, styles[`text_${size}`]]}>
            {rating.toFixed(1)}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 2,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  ratingText: {
    marginLeft: spacing.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  text_sm: {
    fontSize: fontSize.sm,
  },
  text_md: {
    fontSize: fontSize.base,
  },
  text_lg: {
    fontSize: fontSize.lg,
  },
});
