import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Settings, MapPin, Plus, Bookmark, ChevronRight } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../styles/theme';
import Avatar from '../../components/Avatar';
import PrimaryButton from '../../components/PrimaryButton';
import SegmentedControl from '../../components/SegmentedControl';
import { useAuth } from '../../hooks/useLocalAuth';
import { useMyReviews } from '../../hooks/useReviews';
import { useUserLists, useCreateList } from '../../hooks/useSaveHotel';
import { useResponsiveSpacing } from '../../hooks/useResponsiveSpacing';
import { formatCompactNumber } from '../../lib/formatters';
import type { ProfileStackParamList } from '../../navigation/ProfileStack';
import type { ListWithCount } from '../../types/models';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'MyProfile'>;
};

export default function MyProfileScreen({ navigation }: Props) {
  const { profile, refreshProfile } = useAuth();
  const { data: reviews, refetch: refetchReviews } = useMyReviews();
  const { data: lists, refetch: refetchLists } = useUserLists();
  const { screenPadding } = useResponsiveSpacing();
  const createList = useCreateList();

  const [activeTab, setActiveTab] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');

  const totalSaved = lists?.reduce((sum, list) => sum + (list.hotel_count || 0), 0) || 0;

  const handleRefresh = async () => {
    await Promise.all([refreshProfile(), refetchReviews(), refetchLists()]);
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      Alert.alert('Error', 'Please enter a list name');
      return;
    }

    try {
      await createList.mutateAsync(newListName.trim());
      setNewListName('');
      setShowCreateModal(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create list');
    }
  };

  const renderReviewsTab = () => (
    <View style={styles.tabContent}>
      {reviews && reviews.length > 0 ? (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Reviews</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MyReviews')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {reviews.slice(0, 5).map((review) => (
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
        </>
      ) : (
        <View style={styles.emptyTab}>
          <Text style={styles.emptyTitle}>No reviews yet</Text>
          <Text style={styles.emptyText}>
            Start exploring hotels and share your experiences
          </Text>
        </View>
      )}
    </View>
  );

  const renderSavedTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Lists</Text>
        <TouchableOpacity onPress={() => setShowCreateModal(true)}>
          <Plus size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
      {lists && lists.length > 0 ? (
        lists.map((list: ListWithCount) => (
          <TouchableOpacity
            key={list.id}
            style={styles.listCard}
            onPress={() => navigation.navigate('ListDetail', { listId: list.id })}
            activeOpacity={0.8}
          >
            <View style={styles.listIcon}>
              <Bookmark size={20} color={colors.primary} fill={colors.primaryLight} />
            </View>
            <View style={styles.listInfo}>
              <Text style={styles.listName}>{list.name}</Text>
              <Text style={styles.listCount}>
                {list.hotel_count} {list.hotel_count === 1 ? 'hotel' : 'hotels'}
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyTab}>
          <Bookmark size={40} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>No saved lists yet</Text>
          <Text style={styles.emptyText}>
            Create a list to start saving your favorite hotels
          </Text>
          <PrimaryButton
            title="Create List"
            onPress={() => setShowCreateModal(true)}
            size="sm"
            style={styles.createButton}
          />
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: screenPadding }]}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Settings size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingHorizontal: screenPadding }]}
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
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => profile?.id && navigation.navigate('FollowersList', { userId: profile.id })}
          >
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => profile?.id && navigation.navigate('FollowingList', { userId: profile.id })}
          >
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Following</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => setActiveTab(1)}
          >
            <Text style={styles.statValue}>
              {formatCompactNumber(totalSaved)}
            </Text>
            <Text style={styles.statLabel}>Saved</Text>
          </TouchableOpacity>
        </View>

        {/* Segmented Control */}
        <View style={styles.segmentedWrapper}>
          <SegmentedControl
            tabs={['Reviews', 'Saved']}
            selectedIndex={activeTab}
            onTabChange={setActiveTab}
          />
        </View>

        {/* Tab Content */}
        {activeTab === 0 ? renderReviewsTab() : renderSavedTab()}
      </ScrollView>

      {/* Create list modal */}
      {showCreateModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Create New List</Text>
            <TextInput
              style={styles.modalInput}
              value={newListName}
              onChangeText={setNewListName}
              placeholder="List name (e.g., Honeymoon 2026)"
              placeholderTextColor={colors.textTertiary}
              autoFocus
            />
            <View style={styles.modalActions}>
              <PrimaryButton
                title="Cancel"
                onPress={() => {
                  setShowCreateModal(false);
                  setNewListName('');
                }}
                variant="ghost"
                size="sm"
              />
              <PrimaryButton
                title="Create"
                onPress={handleCreateList}
                loading={createList.isPending}
                size="sm"
              />
            </View>
          </View>
        </View>
      )}
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
    paddingVertical: spacing.md,
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
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  segmentedWrapper: {
    marginTop: spacing.lg,
  },
  tabContent: {
    marginTop: spacing.md,
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
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  listIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  listCount: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  emptyTab: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
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
  },
  createButton: {
    marginTop: spacing.md,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modal: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  modalInput: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
});
