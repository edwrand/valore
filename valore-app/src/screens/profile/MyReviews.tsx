import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, BookOpen, Star } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../styles/theme';
import RatingStars from '../../components/RatingStars';
import { useMyReviews } from '../../hooks/useReviews';
import { useResponsiveSpacing } from '../../hooks/useResponsiveSpacing';
import { formatRelativeTime, formatLocation, formatTripType } from '../../lib/formatters';
import type { ProfileStackParamList } from '../../navigation/ProfileStack';
import type { ReviewWithDetails } from '../../types/models';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'MyReviews'>;
};

export default function MyReviewsScreen({ navigation }: Props) {
  const { data: reviews, isLoading } = useMyReviews();
  const { screenPadding } = useResponsiveSpacing();

  const handleReviewPress = (hotelId: string) => {
    navigation.navigate('HotelDetail', { hotelId });
  };

  const renderItem = ({ item }: { item: ReviewWithDetails }) => (
    <TouchableOpacity
      style={styles.reviewCard}
      onPress={() => handleReviewPress(item.hotel_id)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.hotelInfo}>
          <Text style={styles.hotelName} numberOfLines={1}>
            {item.hotel.name}
          </Text>
          <Text style={styles.hotelLocation}>
            {formatLocation(item.hotel.city, item.hotel.country)}
          </Text>
        </View>
        <RatingStars rating={item.rating_overall} size="sm" />
      </View>

      {item.title && <Text style={styles.reviewTitle}>{item.title}</Text>}

      {item.body && (
        <Text style={styles.reviewBody} numberOfLines={3}>
          {item.body}
        </Text>
      )}

      <View style={styles.cardFooter}>
        {item.trip_type && (
          <View style={styles.tripTypeBadge}>
            <Text style={styles.tripTypeText}>
              {formatTripType(item.trip_type)}
            </Text>
          </View>
        )}
        <Text style={styles.reviewDate}>
          {formatRelativeTime(item.created_at)}
        </Text>
      </View>

      {/* Detailed ratings if available */}
      {(item.rating_aesthetic || item.rating_service || item.rating_amenities) && (
        <View style={styles.detailedRatings}>
          {item.rating_aesthetic && (
            <View style={styles.detailRating}>
              <Text style={styles.detailLabel}>Aesthetic</Text>
              <Text style={styles.detailValue}>{item.rating_aesthetic}/5</Text>
            </View>
          )}
          {item.rating_service && (
            <View style={styles.detailRating}>
              <Text style={styles.detailLabel}>Service</Text>
              <Text style={styles.detailValue}>{item.rating_service}/5</Text>
            </View>
          )}
          {item.rating_amenities && (
            <View style={styles.detailRating}>
              <Text style={styles.detailLabel}>Amenities</Text>
              <Text style={styles.detailValue}>{item.rating_amenities}/5</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <BookOpen size={48} color={colors.textTertiary} />
      <Text style={styles.emptyTitle}>No reviews yet</Text>
      <Text style={styles.emptyText}>
        Share your hotel experiences and help others discover great places to stay
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: screenPadding }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Reviews</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={reviews}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingHorizontal: screenPadding }]}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  list: {
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
  },
  reviewCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  hotelInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  hotelName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  hotelLocation: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  reviewTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  reviewBody: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: fontSize.sm * 1.5,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  tripTypeBadge: {
    backgroundColor: colors.primaryLight + '30',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  tripTypeText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  reviewDate: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
  detailedRatings: {
    flexDirection: 'row',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: spacing.lg,
  },
  detailRating: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
  detailValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
});
