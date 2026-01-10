// Database types matching Postgres schemas from spec

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  home_city: string | null;
  created_at: string;
}

export interface Hotel {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  place_id: string | null;
  website_url: string | null;
  phone: string | null;
  price_tier: string | null;
  cover_image_url: string | null;
  description: string | null;
  created_at: string;
}

export interface HotelTag {
  id: string;
  name: string;
}

export interface HotelTagMap {
  hotel_id: string;
  tag_id: string;
}

export interface Review {
  id: string;
  user_id: string;
  hotel_id: string;
  rating_overall: number;
  rating_aesthetic: number | null;
  rating_service: number | null;
  rating_amenities: number | null;
  title: string | null;
  body: string | null;
  trip_type: string | null;
  stay_date: string | null;
  created_at: string;
}

export interface ReviewPhoto {
  id: string;
  review_id: string;
  url: string;
  created_at: string;
}

export interface List {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  created_at: string;
}

export interface ListItem {
  list_id: string;
  hotel_id: string;
  created_at: string;
}

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Event {
  id: string;
  user_id: string | null;
  event_name: string;
  payload: Record<string, unknown>;
  created_at: string;
}

// Trip types for reviews
export type TripType =
  | 'honeymoon'
  | 'girls_trip'
  | 'solo'
  | 'work'
  | 'family'
  | 'couples'
  | 'friends';

// Price tiers
export type PriceTier = '$' | '$$' | '$$$' | '$$$$';
