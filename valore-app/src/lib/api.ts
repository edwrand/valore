import { supabase } from './supabase';
import type {
  Profile,
  Hotel,
  Review,
  List,
  HotelTag,
  ReviewPhoto,
  ListItem
} from '../types/db';
import type {
  HotelWithDetails,
  ReviewWithDetails,
  ListWithCount,
  ListWithHotels,
  ProfileWithStats,
  HotelFilters,
  FeedItem
} from '../types/models';

// ==================== PROFILES ====================

export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const getProfileWithStats = async (userId: string): Promise<ProfileWithStats | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      review_count:reviews(count),
      follower_count:follows!follows_following_id_fkey(count),
      following_count:follows!follows_follower_id_fkey(count),
      saved_count:list_items(count)
    `)
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as ProfileWithStats;
};

export const updateProfile = async (userId: string, updates: Partial<Profile>): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ==================== HOTELS ====================

export const getHotels = async (filters?: HotelFilters): Promise<HotelWithDetails[]> => {
  let query = supabase
    .from('hotels')
    .select(`
      *,
      tags:hotel_tag_map(tag:hotel_tags(*)),
      reviews(rating_overall)
    `);

  if (filters?.query) {
    query = query.or(`name.ilike.%${filters.query}%,city.ilike.%${filters.query}%,country.ilike.%${filters.query}%`);
  }

  if (filters?.bounds) {
    query = query
      .gte('lat', filters.bounds.south)
      .lte('lat', filters.bounds.north)
      .gte('lng', filters.bounds.west)
      .lte('lng', filters.bounds.east);
  }

  if (filters?.price_tier?.length) {
    query = query.in('price_tier', filters.price_tier);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Transform and calculate aggregates
  return (data || []).map((hotel: any) => ({
    ...hotel,
    tags: hotel.tags?.map((t: any) => t.tag) || [],
    avg_rating: hotel.reviews?.length
      ? hotel.reviews.reduce((sum: number, r: any) => sum + r.rating_overall, 0) / hotel.reviews.length
      : null,
    review_count: hotel.reviews?.length || 0,
    is_saved: false, // Will be populated separately
  }));
};

export const getHotel = async (hotelId: string): Promise<HotelWithDetails | null> => {
  const { data, error } = await supabase
    .from('hotels')
    .select(`
      *,
      tags:hotel_tag_map(tag:hotel_tags(*)),
      reviews(rating_overall)
    `)
    .eq('id', hotelId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  if (!data) return null;

  return {
    ...data,
    tags: data.tags?.map((t: any) => t.tag) || [],
    avg_rating: data.reviews?.length
      ? data.reviews.reduce((sum: number, r: any) => sum + r.rating_overall, 0) / data.reviews.length
      : null,
    review_count: data.reviews?.length || 0,
    is_saved: false,
  };
};

// ==================== REVIEWS ====================

export const getHotelReviews = async (hotelId: string): Promise<ReviewWithDetails[]> => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      user:profiles(id, username, full_name, avatar_url),
      hotel:hotels(id, name, city, country, cover_image_url),
      photos:review_photos(*)
    `)
    .eq('hotel_id', hotelId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as ReviewWithDetails[];
};

export const getUserReviews = async (userId: string): Promise<ReviewWithDetails[]> => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      user:profiles(id, username, full_name, avatar_url),
      hotel:hotels(id, name, city, country, cover_image_url),
      photos:review_photos(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as ReviewWithDetails[];
};

export const createReview = async (review: Omit<Review, 'id' | 'created_at'>): Promise<Review> => {
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const addReviewPhotos = async (reviewId: string, urls: string[]): Promise<ReviewPhoto[]> => {
  const photos = urls.map(url => ({ review_id: reviewId, url }));
  const { data, error } = await supabase
    .from('review_photos')
    .insert(photos)
    .select();

  if (error) throw error;
  return data;
};

// ==================== LISTS (Saved Hotels) ====================

export const getUserLists = async (userId: string): Promise<ListWithCount[]> => {
  const { data, error } = await supabase
    .from('lists')
    .select(`
      *,
      hotel_count:list_items(count)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as ListWithCount[];
};

export const getListWithHotels = async (listId: string): Promise<ListWithHotels | null> => {
  const { data, error } = await supabase
    .from('lists')
    .select(`
      *,
      items:list_items(
        hotel:hotels(
          *,
          tags:hotel_tag_map(tag:hotel_tags(*)),
          reviews(rating_overall)
        )
      )
    `)
    .eq('id', listId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  if (!data) return null;

  return {
    ...data,
    hotels: data.items?.map((item: any) => ({
      ...item.hotel,
      tags: item.hotel.tags?.map((t: any) => t.tag) || [],
      avg_rating: item.hotel.reviews?.length
        ? item.hotel.reviews.reduce((sum: number, r: any) => sum + r.rating_overall, 0) / item.hotel.reviews.length
        : null,
      review_count: item.hotel.reviews?.length || 0,
      is_saved: true,
    })) || [],
  };
};

export const getOrCreateDefaultList = async (userId: string): Promise<List> => {
  // Try to get existing default list
  const { data: existing } = await supabase
    .from('lists')
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true)
    .single();

  if (existing) return existing;

  // Create default list
  const { data, error } = await supabase
    .from('lists')
    .insert({ user_id: userId, name: 'Saved', is_default: true })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const createList = async (userId: string, name: string): Promise<List> => {
  const { data, error } = await supabase
    .from('lists')
    .insert({ user_id: userId, name, is_default: false })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const saveHotelToList = async (listId: string, hotelId: string): Promise<void> => {
  const { error } = await supabase
    .from('list_items')
    .insert({ list_id: listId, hotel_id: hotelId });

  if (error && error.code !== '23505') throw error; // Ignore duplicate key
};

export const removeHotelFromList = async (listId: string, hotelId: string): Promise<void> => {
  const { error } = await supabase
    .from('list_items')
    .delete()
    .eq('list_id', listId)
    .eq('hotel_id', hotelId);

  if (error) throw error;
};

export const isHotelSaved = async (userId: string, hotelId: string): Promise<boolean> => {
  const { data } = await supabase
    .from('list_items')
    .select('list_id, lists!inner(user_id)')
    .eq('hotel_id', hotelId)
    .eq('lists.user_id', userId)
    .limit(1);

  return (data?.length || 0) > 0;
};

// ==================== FOLLOWS ====================

export const followUser = async (followerId: string, followingId: string): Promise<void> => {
  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: followerId, following_id: followingId });

  if (error && error.code !== '23505') throw error;
};

export const unfollowUser = async (followerId: string, followingId: string): Promise<void> => {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);

  if (error) throw error;
};

export const getFollowers = async (userId: string): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('follows')
    .select('follower:profiles!follows_follower_id_fkey(*)')
    .eq('following_id', userId);

  if (error) throw error;
  return data?.map((f: any) => f.follower) || [];
};

export const getFollowing = async (userId: string): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('follows')
    .select('following:profiles!follows_following_id_fkey(*)')
    .eq('follower_id', userId);

  if (error) throw error;
  return data?.map((f: any) => f.following) || [];
};

export const isFollowing = async (followerId: string, followingId: string): Promise<boolean> => {
  const { data } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .limit(1);

  return (data?.length || 0) > 0;
};

// ==================== FEED ====================

export const getFeed = async (userId: string): Promise<FeedItem[]> => {
  // First get the list of users the current user follows
  const { data: followingData } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId);

  const followingIds = followingData?.map(f => f.following_id) || [];

  if (followingIds.length === 0) {
    return [];
  }

  // Get reviews from people the user follows
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      user:profiles!reviews_user_id_fkey(id, username, full_name, avatar_url),
      hotel:hotels(id, name, city, country, cover_image_url),
      photos:review_photos(*)
    `)
    .in('user_id', followingIds)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;

  return (data || []).map((review: any) => ({
    review: review as ReviewWithDetails,
    friend: review.user,
  }));
};

// ==================== TAGS ====================

export const getAllTags = async (): Promise<HotelTag[]> => {
  const { data, error } = await supabase
    .from('hotel_tags')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
};

// ==================== ANALYTICS ====================

export const trackEvent = async (
  userId: string | null,
  eventName: string,
  payload: Record<string, unknown>
): Promise<void> => {
  const { error } = await supabase
    .from('events')
    .insert({ user_id: userId, event_name: eventName, payload });

  if (error) console.error('Failed to track event:', error);
};
