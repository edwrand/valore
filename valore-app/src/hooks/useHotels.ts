import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getHotels,
  getHotel,
  getHotelReviews,
  getAllTags,
} from '../lib/localApi';
import type { HotelFilters } from '../types/models';

// Query keys
export const hotelKeys = {
  all: ['hotels'] as const,
  lists: () => [...hotelKeys.all, 'list'] as const,
  list: (filters: HotelFilters) => [...hotelKeys.lists(), filters] as const,
  details: () => [...hotelKeys.all, 'detail'] as const,
  detail: (id: string) => [...hotelKeys.details(), id] as const,
  reviews: (id: string) => [...hotelKeys.all, 'reviews', id] as const,
  tags: () => ['hotel-tags'] as const,
  search: (query: string) => ['places-search', query] as const,
};

/**
 * Hook to fetch hotels with optional filters
 */
export function useHotels(filters?: HotelFilters) {
  return useQuery({
    queryKey: hotelKeys.list(filters || {}),
    queryFn: () => getHotels(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single hotel
 */
export function useHotel(hotelId: string) {
  return useQuery({
    queryKey: hotelKeys.detail(hotelId),
    queryFn: () => getHotel(hotelId),
    enabled: !!hotelId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch hotel reviews
 */
export function useHotelReviews(hotelId: string) {
  return useQuery({
    queryKey: hotelKeys.reviews(hotelId),
    queryFn: () => getHotelReviews(hotelId),
    enabled: !!hotelId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch all hotel tags
 */
export function useTags() {
  return useQuery({
    queryKey: hotelKeys.tags(),
    queryFn: getAllTags,
    staleTime: 30 * 60 * 1000, // 30 minutes (tags rarely change)
  });
}

// Note: Places search disabled for local SQLite mode
// Enable when using Supabase with Google Places Edge Functions
