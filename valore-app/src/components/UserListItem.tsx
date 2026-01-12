import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../styles/theme';
import Avatar from './Avatar';
import FollowButton from './FollowButton';
import type { Profile } from '../types/db';

interface UserListItemProps {
  user: Pick<Profile, 'id' | 'username' | 'full_name' | 'avatar_url'>;
  showFollowButton?: boolean;
  onPress?: () => void;
}

export default function UserListItem({
  user,
  showFollowButton = true,
  onPress,
}: UserListItemProps) {
  const content = (
    <View style={styles.container}>
      <Avatar uri={user.avatar_url} name={user.full_name} size="md" />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {user.full_name || 'Unknown User'}
        </Text>
        {user.username && (
          <Text style={styles.username} numberOfLines={1}>
            @{user.username}
          </Text>
        )}
      </View>
      {showFollowButton && (
        <FollowButton userId={user.id} size="sm" />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.md,
  },
  name: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  username: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
