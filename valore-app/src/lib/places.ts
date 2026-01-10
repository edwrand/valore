import { supabase } from './supabase';
import type { PlacePrediction } from '../types/models';

// Google Places API proxy through Edge Functions
// This keeps the API key server-side

const EDGE_FUNCTION_URL = process.env.EXPO_PUBLIC_SUPABASE_URL
  ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1`
  : '';

interface AutocompleteResponse {
  predictions: PlacePrediction[];
}

interface PlaceDetails {
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  website?: string;
  formatted_phone_number?: string;
  price_level?: number;
  photos?: {
    photo_reference: string;
  }[];
}

interface UpsertResponse {
  hotelId: string;
}

/**
 * Search for hotels/places using Google Places Autocomplete
 * Results are filtered to lodging establishments
 */
export const searchPlaces = async (
  query: string,
  location?: { lat: number; lng: number },
  radius: number = 50000
): Promise<PlacePrediction[]> => {
  const { data: { session } } = await supabase.auth.getSession();

  const params = new URLSearchParams({
    query,
    ...(location && { location: `${location.lat},${location.lng}` }),
    radius: String(radius),
  });

  const response = await fetch(`${EDGE_FUNCTION_URL}/places-autocomplete?${params}`, {
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to search places');
  }

  const data: AutocompleteResponse = await response.json();
  return data.predictions;
};

/**
 * Get place details and upsert into hotels table
 * Returns the canonical hotel ID from our database
 */
export const getPlaceDetailsAndUpsert = async (placeId: string): Promise<string> => {
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(`${EDGE_FUNCTION_URL}/places-details-upsert`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify({ place_id: placeId }),
  });

  if (!response.ok) {
    throw new Error('Failed to get place details');
  }

  const data: UpsertResponse = await response.json();
  return data.hotelId;
};

/**
 * Convert Google's price_level (0-4) to our price_tier format
 */
export const priceLevelToTier = (level?: number): string | null => {
  switch (level) {
    case 0:
    case 1:
      return '$';
    case 2:
      return '$$';
    case 3:
      return '$$$';
    case 4:
      return '$$$$';
    default:
      return null;
  }
};

/**
 * Get photo URL from Google Places photo reference
 * Note: This should go through an Edge Function to hide API key
 */
export const getPhotoUrl = (photoReference: string, maxWidth: number = 400): string => {
  return `${EDGE_FUNCTION_URL}/places-photo?photo_reference=${photoReference}&maxwidth=${maxWidth}`;
};
