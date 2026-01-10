import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserLists,
  getListWithHotels,
  getOrCreateDefaultList,
  createList,
  saveHotelToList,
  removeHotelFromList,
  isHotelSaved,
} from '../lib/localApi';
import { useAuth } from './useLocalAuth';
import type { List } from '../types/db';

// Query keys
export const listKeys = {
  all: ['lists'] as const,
  user: (userId: string) => [...listKeys.all, 'user', userId] as const,
  detail: (listId: string) => [...listKeys.all, 'detail', listId] as const,
  saved: (userId: string, hotelId: string) => [...listKeys.all, 'saved', userId, hotelId] as const,
};

/**
 * Hook to fetch user's lists
 */
export function useUserLists() {
  const { user } = useAuth();

  return useQuery({
    queryKey: listKeys.user(user?.id || ''),
    queryFn: () => getUserLists(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch a specific list with its hotels
 */
export function useListWithHotels(listId: string) {
  return useQuery({
    queryKey: listKeys.detail(listId),
    queryFn: () => getListWithHotels(listId),
    enabled: !!listId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to check if a hotel is saved
 */
export function useIsHotelSaved(hotelId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: listKeys.saved(user?.id || '', hotelId),
    queryFn: () => isHotelSaved(user!.id, hotelId),
    enabled: !!user?.id && !!hotelId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to create a new list
 */
export function useCreateList() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (name: string) => createList(user!.id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listKeys.user(user!.id) });
    },
  });
}

/**
 * Hook to save a hotel to a list (or default saved list)
 */
export function useSaveHotel() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ hotelId, listId }: { hotelId: string; listId?: string }) => {
      if (!user) throw new Error('Must be logged in to save hotels');

      let targetListId = listId;

      // If no list specified, use or create default list
      if (!targetListId) {
        const defaultList = await getOrCreateDefaultList(user.id);
        targetListId = defaultList.id;
      }

      await saveHotelToList(targetListId, hotelId);
      return { listId: targetListId, hotelId };
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: listKeys.user(user!.id) });
      queryClient.invalidateQueries({ queryKey: listKeys.detail(data.listId) });
      queryClient.invalidateQueries({ queryKey: listKeys.saved(user!.id, data.hotelId) });
    },
  });
}

/**
 * Hook to remove a hotel from a list
 */
export function useRemoveFromList() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ hotelId, listId }: { hotelId: string; listId: string }) => {
      await removeHotelFromList(listId, hotelId);
      return { listId, hotelId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: listKeys.user(user!.id) });
      queryClient.invalidateQueries({ queryKey: listKeys.detail(data.listId) });
      queryClient.invalidateQueries({ queryKey: listKeys.saved(user!.id, data.hotelId) });
    },
  });
}

/**
 * Hook to toggle save state (save if not saved, remove if saved)
 */
export function useToggleSave() {
  const saveHotel = useSaveHotel();
  const removeFromList = useRemoveFromList();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ hotelId, listId }: { hotelId: string; listId?: string }) => {
      if (!user) throw new Error('Must be logged in');

      const saved = await isHotelSaved(user.id, hotelId);

      if (saved) {
        // Get the default list to remove from
        const defaultList = await getOrCreateDefaultList(user.id);
        await removeHotelFromList(listId || defaultList.id, hotelId);
        return { saved: false, hotelId };
      } else {
        const defaultList = await getOrCreateDefaultList(user.id);
        await saveHotelToList(listId || defaultList.id, hotelId);
        return { saved: true, hotelId };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: listKeys.user(user!.id) });
      queryClient.invalidateQueries({ queryKey: listKeys.saved(user!.id, data.hotelId) });
    },
  });
}
