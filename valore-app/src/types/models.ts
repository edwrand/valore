// Enriched models with joined data for UI consumption

import { Hotel, Profile, Review, ReviewPhoto, List, HotelTag } from './db';

// Hotel with aggregated data
export interface HotelWithDetails extends Hotel {
  tags: HotelTag[];
  avg_rating: number | null;
  review_count: number;
  is_saved: boolean;
}

// Review with user and hotel info
export interface ReviewWithDetails extends Review {
  user: Pick<Profile, 'id' | 'username' | 'full_name' | 'avatar_url'>;
  hotel: Pick<Hotel, 'id' | 'name' | 'city' | 'country' | 'cover_image_url'>;
  photos: ReviewPhoto[];
}

// List with hotel count
export interface ListWithCount extends List {
  hotel_count: number;
}

// List with hotels
export interface ListWithHotels extends List {
  hotels: HotelWithDetails[];
}

// Profile with stats
export interface ProfileWithStats extends Profile {
  review_count: number;
  follower_count: number;
  following_count: number;
  saved_count: number;
}

// User for follow suggestions
export interface UserSuggestion extends Pick<Profile, 'id' | 'username' | 'full_name' | 'avatar_url' | 'home_city'> {
  mutual_friends: number;
  is_following: boolean;
}

// Feed item (friend's review)
export interface FeedItem {
  review: ReviewWithDetails;
  friend: Pick<Profile, 'id' | 'username' | 'full_name' | 'avatar_url'>;
}

// Google Places autocomplete prediction
export interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

// Search filters
export interface HotelFilters {
  query?: string;
  tags?: string[];
  price_tier?: string[];
  min_rating?: number;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}
