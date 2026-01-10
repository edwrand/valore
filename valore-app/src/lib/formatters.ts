// Utility functions for formatting data

/**
 * Format a date to a human-readable relative time string
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${diffYears}y ago`;
};

/**
 * Format a date to a short date string (e.g., "Jan 2024")
 */
export const formatShortDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Format a date to a full date string (e.g., "January 15, 2024")
 */
export const formatFullDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format a number with K/M suffix for large numbers
 */
export const formatCompactNumber = (num: number): string => {
  if (num < 1000) return String(num);
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  return `${(num / 1000000).toFixed(1)}M`;
};

/**
 * Format a rating to 1 decimal place
 */
export const formatRating = (rating: number | null): string => {
  if (rating === null) return '-';
  return rating.toFixed(1);
};

/**
 * Get initials from a name
 */
export const getInitials = (name: string | null): string => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Generate a consistent color from a string (for avatars)
 */
export const stringToColor = (str: string): string => {
  const colors = [
    '#6B7FFF', // Primary blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#8B5CF6', // Purple
    '#14B8A6', // Teal
    '#F97316', // Orange
    '#06B6D4', // Cyan
  ];

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

/**
 * Format location string from city and country
 */
export const formatLocation = (city: string | null, country: string | null): string => {
  if (city && country) return `${city}, ${country}`;
  return city || country || 'Unknown location';
};

/**
 * Format trip type to display string
 */
export const formatTripType = (tripType: string | null): string => {
  if (!tripType) return '';

  const labels: Record<string, string> = {
    honeymoon: 'Honeymoon',
    girls_trip: 'Girls Trip',
    solo: 'Solo Travel',
    work: 'Business',
    family: 'Family',
    couples: 'Couples',
    friends: 'Friends',
  };

  return labels[tripType] || tripType;
};

/**
 * Truncate text to a maximum length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};
