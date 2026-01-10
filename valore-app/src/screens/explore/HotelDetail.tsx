import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import {
  ChevronLeft,
  Bookmark,
  MapPin,
  Globe,
  Phone,
  Star,
  PenSquare,
} from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme';
import PhotoCarousel from '../../components/PhotoCarousel';
import RatingStars from '../../components/RatingStars';
import TagPill from '../../components/TagPill';
import Avatar from '../../components/Avatar';
import PrimaryButton from '../../components/PrimaryButton';
import { useHotel, useHotelReviews } from '../../hooks/useHotels';
import { useToggleSave, useIsHotelSaved } from '../../hooks/useSaveHotel';
import { formatLocation, formatRelativeTime, formatRating } from '../../lib/formatters';
import type { ExploreStackParamList } from '../../navigation/ExploreStack';

type Props = {
  navigation: NativeStackNavigationProp<ExploreStackParamList, 'HotelDetail'>;
  route: RouteProp<ExploreStackParamList, 'HotelDetail'>;
};

export default function HotelDetailScreen({ navigation, route }: Props) {
  const { hotelId } = route.params;
  const { data: hotel, isLoading: hotelLoading } = useHotel(hotelId);
  const { data: reviews, isLoading: reviewsLoading } = useHotelReviews(hotelId);
  const { data: isSaved } = useIsHotelSaved(hotelId);
  const toggleSave = useToggleSave();

  if (hotelLoading || !hotel) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = () => {
    toggleSave.mutate({ hotelId });
  };

  const handleWriteReview = () => {
    navigation.navigate('CreateReview', { hotelId });
  };

  const photos = hotel.cover_image_url ? [hotel.cover_image_url] : [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with back button */}
        <View style={styles.headerOverlay}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={colors.textInverse} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Bookmark
              size={24}
              color={colors.textInverse}
              fill={isSaved ? colors.textInverse : 'transparent'}
            />
          </TouchableOpacity>
        </View>

        {/* Photo carousel */}
        <PhotoCarousel photos={photos} height={300} borderRadius={0} />

        {/* Content */}
        <View style={styles.content}>
          {/* Name and rating */}
          <View style={styles.titleRow}>
            <Text style={styles.name}>{hotel.name}</Text>
            {hotel.avg_rating !== null && (
              <View style={styles.ratingBadge}>
                <Star size={16} color={colors.star} fill={colors.star} />
                <Text style={styles.ratingText}>{formatRating(hotel.avg_rating)}</Text>
              </View>
            )}
          </View>

          {/* Location */}
          <View style={styles.infoRow}>
            <MapPin size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              {formatLocation(hotel.city, hotel.country)}
            </Text>
          </View>

          {/* Price tier */}
          {hotel.price_tier && (
            <View style={styles.infoRow}>
              <Text style={styles.priceLabel}>Price: </Text>
              <Text style={styles.priceValue}>{hotel.price_tier}</Text>
            </View>
          )}

          {/* Tags */}
          {hotel.tags.length > 0 && (
            <View style={styles.tags}>
              {hotel.tags.map((tag) => (
                <TagPill key={tag.id} label={tag.name} size="sm" />
              ))}
            </View>
          )}

          {/* Description */}
          {hotel.description && (
            <Text style={styles.description}>{hotel.description}</Text>
          )}

          {/* Contact info */}
          <View style={styles.contactSection}>
            {hotel.website_url && (
              <TouchableOpacity
                style={styles.contactRow}
                onPress={() => Linking.openURL(hotel.website_url!)}
              >
                <Globe size={16} color={colors.primary} />
                <Text style={styles.contactLink}>Visit Website</Text>
              </TouchableOpacity>
            )}
            {hotel.phone && (
              <TouchableOpacity
                style={styles.contactRow}
                onPress={() => Linking.openURL(`tel:${hotel.phone}`)}
              >
                <Phone size={16} color={colors.primary} />
                <Text style={styles.contactLink}>{hotel.phone}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Write review button */}
          <PrimaryButton
            title="Write a Review"
            onPress={handleWriteReview}
            fullWidth
            style={styles.reviewButton}
          />

          {/* Reviews section */}
          <View style={styles.reviewsSection}>
            <Text style={styles.sectionTitle}>
              Reviews ({hotel.review_count})
            </Text>

            {reviewsLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : reviews && reviews.length > 0 ? (
              reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Avatar
                      uri={review.user.avatar_url}
                      name={review.user.full_name}
                      size="sm"
                    />
                    <View style={styles.reviewMeta}>
                      <Text style={styles.reviewAuthor}>
                        {review.user.full_name || review.user.username}
                      </Text>
                      <Text style={styles.reviewDate}>
                        {formatRelativeTime(review.created_at)}
                      </Text>
                    </View>
                    <RatingStars rating={review.rating_overall} size="sm" />
                  </View>
                  {review.title && (
                    <Text style={styles.reviewTitle}>{review.title}</Text>
                  )}
                  {review.body && (
                    <Text style={styles.reviewBody}>{review.body}</Text>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.noReviews}>
                No reviews yet. Be the first to review!
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: borderRadius.full,
    padding: spacing.sm,
  },
  saveButton: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: borderRadius.full,
    padding: spacing.sm,
  },
  content: {
    padding: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.md,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  ratingText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  infoText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  priceLabel: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  priceValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    lineHeight: fontSize.base * 1.6,
    marginBottom: spacing.md,
  },
  contactSection: {
    marginBottom: spacing.md,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  contactLink: {
    fontSize: fontSize.base,
    color: colors.primary,
  },
  reviewButton: {
    marginBottom: spacing.xl,
  },
  reviewsSection: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  reviewCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  reviewMeta: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  reviewAuthor: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  reviewDate: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
  reviewTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  reviewBody: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: fontSize.sm * 1.5,
  },
  noReviews: {
    fontSize: fontSize.base,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
