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
import { RouteProp } from '@react-navigation/native';
import { ChevronLeft, Users } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight } from '../../styles/theme';
import UserListItem from '../../components/UserListItem';
import { useFollowers } from '../../hooks/useFollows';
import { useResponsiveSpacing } from '../../hooks/useResponsiveSpacing';
import type { ProfileStackParamList } from '../../navigation/ProfileStack';
import type { Profile } from '../../types/db';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'FollowersList'>;
  route: RouteProp<ProfileStackParamList, 'FollowersList'>;
};

export default function FollowersListScreen({ navigation, route }: Props) {
  const { userId } = route.params;
  const { data: followers, isLoading } = useFollowers(userId);
  const { screenPadding } = useResponsiveSpacing();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: Profile }) => (
    <UserListItem user={item} showFollowButton={true} />
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Users size={48} color={colors.textTertiary} />
      <Text style={styles.emptyTitle}>No followers yet</Text>
      <Text style={styles.emptyText}>
        When people follow you, they'll appear here
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: screenPadding }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Followers</Text>
          <Text style={styles.subtitle}>
            {followers?.length || 0} {followers?.length === 1 ? 'follower' : 'followers'}
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Followers list */}
      <FlatList
        data={followers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
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
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
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
});
