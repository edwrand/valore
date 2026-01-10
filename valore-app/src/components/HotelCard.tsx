import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Bookmark, MapPin, Star } from 'lucide-react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../styles/theme';
import { formatLocation, formatRating } from '../lib/formatters';
import type { HotelWithDetails } from '../types/models';
import TagPill from './TagPill';

interface HotelCardProps {
  hotel: HotelWithDetails;
  onPress: () => void;
  onSave?: () => void;
  isSaved?: boolean;
  compact?: boolean;
}

export default function HotelCard({
  hotel,
  onPress,
  onSave,
  isSaved = false,
  compact = false,
}: HotelCardProps) {
  return (
    <TouchableOpacity
      style={[styles.container, compact && styles.containerCompact]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Image */}
      <View style={[styles.imageContainer, compact && styles.imageContainerCompact]}>
        <Image
          source={{ uri: hotel.cover_image_url || 'https://via.placeholder.com/400x300' }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Save button */}
        {onSave && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={(e) => {
              e.stopPropagation?.();
              onSave();
            }}
          >
            <Bookmark
              size={20}
              color={isSaved ? colors.primary : colors.textInverse}
              fill={isSaved ? colors.primary : 'transparent'}
            />
          </TouchableOpacity>
        )}

        {/* Price tier badge */}
        {hotel.price_tier && (
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>{hotel.price_tier}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Name and rating */}
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {hotel.name}
          </Text>
          {hotel.avg_rating !== null && (
            <View style={styles.rating}>
              <Star size={14} color={colors.star} fill={colors.star} />
              <Text style={styles.ratingText}>{formatRating(hotel.avg_rating)}</Text>
            </View>
          )}
        </View>

        {/* Location */}
        <View style={styles.location}>
          <MapPin size={12} color={colors.textSecondary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {formatLocation(hotel.city, hotel.country)}
          </Text>
        </View>

        {/* Tags */}
        {!compact && hotel.tags.length > 0 && (
          <View style={styles.tags}>
            {hotel.tags.slice(0, 3).map((tag) => (
              <TagPill key={tag.id} label={tag.name} size="sm" />
            ))}
          </View>
        )}

        {/* Review count */}
        {hotel.review_count > 0 && (
          <Text style={styles.reviewCount}>
            {hotel.review_count} {hotel.review_count === 1 ? 'review' : 'reviews'}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  containerCompact: {
    flexDirection: 'row',
  },
  imageContainer: {
    height: 160,
    position: 'relative',
  },
  imageContainerCompact: {
    width: 100,
    height: 100,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  saveButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: borderRadius.full,
    padding: spacing.sm,
  },
  priceBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  priceText: {
    color: colors.textInverse,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  content: {
    padding: spacing.md,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.sm,
  },
  locationText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  reviewCount: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
});
