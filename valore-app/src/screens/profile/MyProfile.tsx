import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Settings, Edit3, BookOpen, MapPin } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme';
import Avatar from '../../components/Avatar';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../hooks/useLocalAuth';
import { useMyReviews } from '../../hooks/useReviews';
import { useUserLists } from '../../hooks/useSaveHotel';
import { formatCompactNumber } from '../../lib/formatters';
import type { ProfileStackParamList } from '../../navigation/ProfileStack';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'MyProfile'>;
};

export default function MyProfileScreen({ navigation }: Props) {
  const { profile, refreshProfile } = useAuth();
  const { data: reviews, refetch: refetchReviews } = useMyReviews();
  const { data: lists } = useUserLists();

  const totalSaved = lists?.reduce((sum, list) => sum + (list.hotel_count || 0), 0) || 0;

  const handleRefresh = async () => {
    await Promise.all([refreshProfile(), refetchReviews()]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Settings size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Profile card */}
        <View style={styles.profileCard}>
          <Avatar
            uri={profile?.avatar_url}
            name={profile?.full_name}
            size="xl"
          />
          <Text style={styles.name}>
            {profile?.full_name || 'Set up your profile'}
          </Text>
          {profile?.username && (
            <Text style={styles.username}>@{profile.username}</Text>
          )}
          {profile?.home_city && (
            <View style={styles.locationRow}>
              <MapPin size={14} color={colors.textSecondary} />
              <Text style={styles.location}>{profile.home_city}</Text>
            </View>
          )}
          {profile?.bio && <Text style={styles.bio}>{profile.bio}</Text>}

          <PrimaryButton
            title="Edit Profile"
            onPress={() => navigation.navigate('EditProfile')}
            variant="outline"
            size="sm"
            style={styles.editButton}
          />
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => navigation.navigate('MyReviews')}
          >
            <Text style={styles.statValue}>
              {formatCompactNumber(reviews?.length || 0)}
            </Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatCompactNumber(totalSaved)}
            </Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatCompactNumber(lists?.length || 0)}
            </Text>
            <Text style={styles.statLabel}>Lists</Text>
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('MyReviews')}
          >
            <BookOpen size={24} color={colors.primary} />
            <Text style={styles.actionTitle}>My Reviews</Text>
            <Text style={styles.actionCount}>{reviews?.length || 0}</Text>
          </TouchableOpacity>
        </View>

        {/* Recent reviews preview */}
        {reviews && reviews.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Reviews</Text>
              <TouchableOpacity onPress={() => navigation.navigate('MyReviews')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            {reviews.slice(0, 3).map((review) => (
              <TouchableOpacity
                key={review.id}
                style={styles.reviewPreview}
                onPress={() =>
                  navigation.navigate('HotelDetail', { hotelId: review.hotel_id })
                }
              >
                <View style={styles.reviewMeta}>
                  <Text style={styles.reviewHotel} numberOfLines={1}>
                    {review.hotel.name}
                  </Text>
                  <View style={styles.reviewRating}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Text
                        key={i}
                        style={[
                          styles.star,
                          i < review.rating_overall && styles.starFilled,
                        ]}
                      >
                        ★
                      </Text>
                    ))}
                  </View>
                </View>
                {review.title && (
                  <Text style={styles.reviewTitle} numberOfLines={1}>
                    {review.title}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  username: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  location: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  bio: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    lineHeight: fontSize.base * 1.5,
  },
  editButton: {
    marginTop: spacing.md,
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  actions: {
    marginTop: spacing.lg,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  actionTitle: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  actionCount: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  seeAll: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  reviewPreview: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  reviewMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewHotel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  star: {
    fontSize: fontSize.sm,
    color: colors.starEmpty,
  },
  starFilled: {
    color: colors.star,
  },
  reviewTitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
