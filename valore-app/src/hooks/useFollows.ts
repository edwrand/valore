import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  isFollowing,
} from '../lib/localApi';
import { useAuth } from './useLocalAuth';
import type { Profile } from '../types/db';

// Query keys
export const followKeys = {
  all: ['follows'] as const,
  followers: (userId: string) => [...followKeys.all, 'followers', userId] as const,
  following: (userId: string) => [...followKeys.all, 'following', userId] as const,
  isFollowing: (followerId: string, followingId: string) =>
    [...followKeys.all, 'check', followerId, followingId] as const,
};

// Hook to get followers
export function useFollowers(userId: string) {
  return useQuery({
    queryKey: followKeys.followers(userId),
    queryFn: () => getFollowers(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
}

// Hook to get following
export function useFollowing(userId: string) {
  return useQuery({
    queryKey: followKeys.following(userId),
    queryFn: () => getFollowing(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
}

// Hook to check follow status
export function useIsFollowing(targetUserId: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: followKeys.isFollowing(profile?.id || '', targetUserId),
    queryFn: () => isFollowing(profile!.id, targetUserId),
    enabled: !!profile?.id && !!targetUserId && profile.id !== targetUserId,
    staleTime: 30 * 1000,
  });
}

// Hook to follow a user
export function useFollowUser() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: (targetUserId: string) => followUser(profile!.id, targetUserId),
    onSuccess: (_, targetUserId) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: followKeys.followers(targetUserId) });
      queryClient.invalidateQueries({ queryKey: followKeys.following(profile!.id) });
      queryClient.invalidateQueries({
        queryKey: followKeys.isFollowing(profile!.id, targetUserId),
      });
    },
  });
}

// Hook to unfollow a user
export function useUnfollowUser() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: (targetUserId: string) => unfollowUser(profile!.id, targetUserId),
    onSuccess: (_, targetUserId) => {
      queryClient.invalidateQueries({ queryKey: followKeys.followers(targetUserId) });
      queryClient.invalidateQueries({ queryKey: followKeys.following(profile!.id) });
      queryClient.invalidateQueries({
        queryKey: followKeys.isFollowing(profile!.id, targetUserId),
      });
    },
  });
}

// Hook to toggle follow state
export function useToggleFollow() {
  const followUserMutation = useFollowUser();
  const unfollowUserMutation = useUnfollowUser();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      const currentlyFollowing = await isFollowing(profile!.id, targetUserId);
      if (currentlyFollowing) {
        await unfollowUserMutation.mutateAsync(targetUserId);
        return { following: false };
      } else {
        await followUserMutation.mutateAsync(targetUserId);
        return { following: true };
      }
    },
  });
}
