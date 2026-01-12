import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../styles/theme';
import { useIsFollowing, useToggleFollow } from '../hooks/useFollows';

interface FollowButtonProps {
  userId: string;
  size?: 'sm' | 'md';
  onFollowChange?: (isFollowing: boolean) => void;
}

export default function FollowButton({
  userId,
  size = 'sm',
  onFollowChange,
}: FollowButtonProps) {
  const { data: isFollowing, isLoading: checkingFollow } = useIsFollowing(userId);
  const toggleFollow = useToggleFollow();

  const handlePress = async () => {
    try {
      const result = await toggleFollow.mutateAsync(userId);
      onFollowChange?.(result.following);
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
  };

  const isLoading = checkingFollow || toggleFollow.isPending;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[`size_${size}`],
        isFollowing ? styles.following : styles.notFollowing,
      ]}
      onPress={handlePress}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={isFollowing ? colors.primary : colors.textInverse}
        />
      ) : (
        <Text
          style={[
            styles.text,
            styles[`text_${size}`],
            isFollowing ? styles.textFollowing : styles.textNotFollowing,
          ]}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  size_sm: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 80,
    minHeight: 32,
  },
  size_md: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minWidth: 100,
    minHeight: 40,
  },
  following: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  notFollowing: {
    backgroundColor: colors.primary,
  },
  text: {
    fontWeight: fontWeight.semibold,
  },
  text_sm: {
    fontSize: fontSize.sm,
  },
  text_md: {
    fontSize: fontSize.base,
  },
  textFollowing: {
    color: colors.primary,
  },
  textNotFollowing: {
    color: colors.textInverse,
  },
});
