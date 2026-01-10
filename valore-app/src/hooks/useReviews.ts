import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserReviews,
  createReview,
  addReviewPhotos,
  getFeed,
} from '../lib/localApi';
import { hotelKeys } from './useHotels';
import type { Review } from '../types/db';
import { useAuth } from './useLocalAuth';

// Query keys
export const reviewKeys = {
  all: ['reviews'] as const,
  user: (userId: string) => [...reviewKeys.all, 'user', userId] as const,
  feed: (userId: string) => [...reviewKeys.all, 'feed', userId] as const,
};

/**
 * Hook to fetch reviews by a specific user
 */
export function useUserReviews(userId: string) {
  return useQuery({
    queryKey: reviewKeys.user(userId),
    queryFn: () => getUserReviews(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch the current user's reviews
 */
export function useMyReviews() {
  const { user } = useAuth();

  return useQuery({
    queryKey: reviewKeys.user(user?.id || ''),
    queryFn: () => getUserReviews(user!.id),
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to fetch the friends' feed
 */
export function useFeed() {
  const { user } = useAuth();

  return useQuery({
    queryKey: reviewKeys.feed(user?.id || ''),
    queryFn: () => getFeed(user!.id),
    enabled: !!user?.id,
    staleTime: 1 * 60 * 1000, // 1 minute (feed is more dynamic)
  });
}

interface CreateReviewInput {
  hotelId: string;
  ratingOverall: number;
  ratingAesthetic?: number;
  ratingService?: number;
  ratingAmenities?: number;
  title?: string;
  body?: string;
  tripType?: string;
  stayDate?: string;
  photoUrls?: string[];
}

/**
 * Hook to create a review
 */
export function useCreateReview() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateReviewInput) => {
      if (!user) throw new Error('Must be logged in to create a review');

      // Create the review
      const review = await createReview({
        user_id: user.id,
        hotel_id: input.hotelId,
        rating_overall: input.ratingOverall,
        rating_aesthetic: input.ratingAesthetic ?? null,
        rating_service: input.ratingService ?? null,
        rating_amenities: input.ratingAmenities ?? null,
        title: input.title ?? null,
        body: input.body ?? null,
        trip_type: input.tripType ?? null,
        stay_date: input.stayDate ?? null,
      });

      // Add photos if any
      if (input.photoUrls?.length) {
        await addReviewPhotos(review.id, input.photoUrls);
      }

      return review;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: reviewKeys.user(user!.id) });
      queryClient.invalidateQueries({ queryKey: hotelKeys.reviews(variables.hotelId) });
      queryClient.invalidateQueries({ queryKey: hotelKeys.detail(variables.hotelId) });
    },
  });
}
