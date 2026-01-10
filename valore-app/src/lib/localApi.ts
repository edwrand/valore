import { getDatabase, generateId } from './database';
import type {
  Profile,
  Hotel,
  Review,
  List,
  HotelTag,
  ReviewPhoto,
} from '../types/db';
import type {
  HotelWithDetails,
  ReviewWithDetails,
  ListWithCount,
  ListWithHotels,
  ProfileWithStats,
  HotelFilters,
  FeedItem,
} from '../types/models';

// ==================== PROFILES ====================

export const getProfile = async (userId: string): Promise<Profile | null> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<Profile>(
    'SELECT * FROM profiles WHERE id = ?',
    [userId]
  );
  return result || null;
};

export const getProfileWithStats = async (userId: string): Promise<ProfileWithStats | null> => {
  const db = await getDatabase();
  const profile = await db.getFirstAsync<Profile>(
    'SELECT * FROM profiles WHERE id = ?',
    [userId]
  );
  if (!profile) return null;

  const reviewCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM reviews WHERE user_id = ?',
    [userId]
  );
  const followerCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM follows WHERE following_id = ?',
    [userId]
  );
  const followingCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM follows WHERE follower_id = ?',
    [userId]
  );
  const savedCount = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM list_items li
     JOIN lists l ON li.list_id = l.id
     WHERE l.user_id = ?`,
    [userId]
  );

  return {
    ...profile,
    review_count: reviewCount?.count || 0,
    follower_count: followerCount?.count || 0,
    following_count: followingCount?.count || 0,
    saved_count: savedCount?.count || 0,
  };
};

export const updateProfile = async (userId: string, updates: Partial<Profile>): Promise<Profile> => {
  const db = await getDatabase();

  const fields: string[] = [];
  const values: any[] = [];

  if (updates.username !== undefined) {
    fields.push('username = ?');
    values.push(updates.username);
  }
  if (updates.full_name !== undefined) {
    fields.push('full_name = ?');
    values.push(updates.full_name);
  }
  if (updates.avatar_url !== undefined) {
    fields.push('avatar_url = ?');
    values.push(updates.avatar_url);
  }
  if (updates.bio !== undefined) {
    fields.push('bio = ?');
    values.push(updates.bio);
  }
  if (updates.home_city !== undefined) {
    fields.push('home_city = ?');
    values.push(updates.home_city);
  }

  if (fields.length > 0) {
    values.push(userId);
    await db.runAsync(
      `UPDATE profiles SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  const profile = await getProfile(userId);
  return profile!;
};

export const createProfile = async (userId: string, data: Partial<Profile>): Promise<Profile> => {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO profiles (id, username, full_name, avatar_url, bio, home_city)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      userId,
      data.username || null,
      data.full_name || null,
      data.avatar_url || null,
      data.bio || null,
      data.home_city || null,
    ]
  );
  return (await getProfile(userId))!;
};

// ==================== HOTELS ====================

export const getHotels = async (filters?: HotelFilters): Promise<HotelWithDetails[]> => {
  const db = await getDatabase();

  let query = `
    SELECT h.*,
           (SELECT AVG(rating_overall) FROM reviews WHERE hotel_id = h.id) as avg_rating,
           (SELECT COUNT(*) FROM reviews WHERE hotel_id = h.id) as review_count
    FROM hotels h
    WHERE 1=1
  `;
  const params: any[] = [];

  if (filters?.query) {
    query += ` AND (h.name LIKE ? OR h.city LIKE ? OR h.country LIKE ?)`;
    const searchTerm = `%${filters.query}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (filters?.bounds) {
    query += ` AND h.lat >= ? AND h.lat <= ? AND h.lng >= ? AND h.lng <= ?`;
    params.push(filters.bounds.south, filters.bounds.north, filters.bounds.west, filters.bounds.east);
  }

  if (filters?.price_tier?.length) {
    query += ` AND h.price_tier IN (${filters.price_tier.map(() => '?').join(',')})`;
    params.push(...filters.price_tier);
  }

  query += ' ORDER BY h.name';

  const hotels = await db.getAllAsync<Hotel & { avg_rating: number | null; review_count: number }>(query, params);

  // Get tags for each hotel
  const result: HotelWithDetails[] = [];
  for (const hotel of hotels) {
    const tags = await db.getAllAsync<HotelTag>(
      `SELECT ht.* FROM hotel_tags ht
       JOIN hotel_tag_map htm ON ht.id = htm.tag_id
       WHERE htm.hotel_id = ?`,
      [hotel.id]
    );

    result.push({
      ...hotel,
      tags,
      is_saved: false, // Will be populated by the hook if needed
    });
  }

  return result;
};

export const getHotel = async (hotelId: string): Promise<HotelWithDetails | null> => {
  const db = await getDatabase();

  const hotel = await db.getFirstAsync<Hotel & { avg_rating: number | null; review_count: number }>(
    `SELECT h.*,
            (SELECT AVG(rating_overall) FROM reviews WHERE hotel_id = h.id) as avg_rating,
            (SELECT COUNT(*) FROM reviews WHERE hotel_id = h.id) as review_count
     FROM hotels h WHERE h.id = ?`,
    [hotelId]
  );

  if (!hotel) return null;

  const tags = await db.getAllAsync<HotelTag>(
    `SELECT ht.* FROM hotel_tags ht
     JOIN hotel_tag_map htm ON ht.id = htm.tag_id
     WHERE htm.hotel_id = ?`,
    [hotelId]
  );

  return {
    ...hotel,
    tags,
    is_saved: false,
  };
};

// ==================== REVIEWS ====================

export const getHotelReviews = async (hotelId: string): Promise<ReviewWithDetails[]> => {
  const db = await getDatabase();

  const reviews = await db.getAllAsync<Review>(
    'SELECT * FROM reviews WHERE hotel_id = ? ORDER BY created_at DESC',
    [hotelId]
  );

  const result: ReviewWithDetails[] = [];
  for (const review of reviews) {
    const user = await db.getFirstAsync<Profile>(
      'SELECT id, username, full_name, avatar_url FROM profiles WHERE id = ?',
      [review.user_id]
    );
    const hotel = await db.getFirstAsync<Hotel>(
      'SELECT id, name, city, country, cover_image_url FROM hotels WHERE id = ?',
      [review.hotel_id]
    );
    const photos = await db.getAllAsync<ReviewPhoto>(
      'SELECT * FROM review_photos WHERE review_id = ?',
      [review.id]
    );

    result.push({
      ...review,
      user: user!,
      hotel: hotel!,
      photos,
    });
  }

  return result;
};

export const getUserReviews = async (userId: string): Promise<ReviewWithDetails[]> => {
  const db = await getDatabase();

  const reviews = await db.getAllAsync<Review>(
    'SELECT * FROM reviews WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );

  const result: ReviewWithDetails[] = [];
  for (const review of reviews) {
    const user = await db.getFirstAsync<Profile>(
      'SELECT id, username, full_name, avatar_url FROM profiles WHERE id = ?',
      [review.user_id]
    );
    const hotel = await db.getFirstAsync<Hotel>(
      'SELECT id, name, city, country, cover_image_url FROM hotels WHERE id = ?',
      [review.hotel_id]
    );
    const photos = await db.getAllAsync<ReviewPhoto>(
      'SELECT * FROM review_photos WHERE review_id = ?',
      [review.id]
    );

    result.push({
      ...review,
      user: user!,
      hotel: hotel!,
      photos,
    });
  }

  return result;
};

export const createReview = async (review: Omit<Review, 'id' | 'created_at'>): Promise<Review> => {
  const db = await getDatabase();
  const id = generateId();

  await db.runAsync(
    `INSERT INTO reviews (id, user_id, hotel_id, rating_overall, rating_aesthetic, rating_service, rating_amenities, title, body, trip_type, stay_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      review.user_id,
      review.hotel_id,
      review.rating_overall,
      review.rating_aesthetic,
      review.rating_service,
      review.rating_amenities,
      review.title,
      review.body,
      review.trip_type,
      review.stay_date,
    ]
  );

  const created = await db.getFirstAsync<Review>(
    'SELECT * FROM reviews WHERE id = ?',
    [id]
  );
  return created!;
};

export const addReviewPhotos = async (reviewId: string, urls: string[]): Promise<ReviewPhoto[]> => {
  const db = await getDatabase();
  const photos: ReviewPhoto[] = [];

  for (const url of urls) {
    const id = generateId();
    await db.runAsync(
      'INSERT INTO review_photos (id, review_id, url) VALUES (?, ?, ?)',
      [id, reviewId, url]
    );
    const photo = await db.getFirstAsync<ReviewPhoto>(
      'SELECT * FROM review_photos WHERE id = ?',
      [id]
    );
    photos.push(photo!);
  }

  return photos;
};

// ==================== LISTS (Saved Hotels) ====================

export const getUserLists = async (userId: string): Promise<ListWithCount[]> => {
  const db = await getDatabase();

  const lists = await db.getAllAsync<List & { hotel_count: number }>(
    `SELECT l.*, (SELECT COUNT(*) FROM list_items WHERE list_id = l.id) as hotel_count
     FROM lists l WHERE l.user_id = ?
     ORDER BY l.is_default DESC, l.created_at DESC`,
    [userId]
  );

  return lists;
};

export const getListWithHotels = async (listId: string): Promise<ListWithHotels | null> => {
  const db = await getDatabase();

  const list = await db.getFirstAsync<List>(
    'SELECT * FROM lists WHERE id = ?',
    [listId]
  );
  if (!list) return null;

  const hotelIds = await db.getAllAsync<{ hotel_id: string }>(
    'SELECT hotel_id FROM list_items WHERE list_id = ?',
    [listId]
  );

  const hotels: HotelWithDetails[] = [];
  for (const { hotel_id } of hotelIds) {
    const hotel = await getHotel(hotel_id);
    if (hotel) {
      hotels.push({ ...hotel, is_saved: true });
    }
  }

  return { ...list, hotels };
};

export const getOrCreateDefaultList = async (userId: string): Promise<List> => {
  const db = await getDatabase();

  const existing = await db.getFirstAsync<List>(
    'SELECT * FROM lists WHERE user_id = ? AND is_default = 1',
    [userId]
  );
  if (existing) return existing;

  const id = generateId();
  await db.runAsync(
    'INSERT INTO lists (id, user_id, name, is_default) VALUES (?, ?, ?, 1)',
    [id, userId, 'Saved']
  );

  return (await db.getFirstAsync<List>('SELECT * FROM lists WHERE id = ?', [id]))!;
};

export const createList = async (userId: string, name: string): Promise<List> => {
  const db = await getDatabase();
  const id = generateId();

  await db.runAsync(
    'INSERT INTO lists (id, user_id, name, is_default) VALUES (?, ?, ?, 0)',
    [id, userId, name]
  );

  return (await db.getFirstAsync<List>('SELECT * FROM lists WHERE id = ?', [id]))!;
};

export const saveHotelToList = async (listId: string, hotelId: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR IGNORE INTO list_items (list_id, hotel_id) VALUES (?, ?)',
    [listId, hotelId]
  );
};

export const removeHotelFromList = async (listId: string, hotelId: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    'DELETE FROM list_items WHERE list_id = ? AND hotel_id = ?',
    [listId, hotelId]
  );
};

export const isHotelSaved = async (userId: string, hotelId: string): Promise<boolean> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM list_items li
     JOIN lists l ON li.list_id = l.id
     WHERE l.user_id = ? AND li.hotel_id = ?`,
    [userId, hotelId]
  );
  return (result?.count || 0) > 0;
};

// ==================== FOLLOWS ====================

export const followUser = async (followerId: string, followingId: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)',
    [followerId, followingId]
  );
};

export const unfollowUser = async (followerId: string, followingId: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
    [followerId, followingId]
  );
};

export const getFollowers = async (userId: string): Promise<Profile[]> => {
  const db = await getDatabase();
  return db.getAllAsync<Profile>(
    `SELECT p.* FROM profiles p
     JOIN follows f ON p.id = f.follower_id
     WHERE f.following_id = ?`,
    [userId]
  );
};

export const getFollowing = async (userId: string): Promise<Profile[]> => {
  const db = await getDatabase();
  return db.getAllAsync<Profile>(
    `SELECT p.* FROM profiles p
     JOIN follows f ON p.id = f.following_id
     WHERE f.follower_id = ?`,
    [userId]
  );
};

export const isFollowing = async (followerId: string, followingId: string): Promise<boolean> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM follows WHERE follower_id = ? AND following_id = ?',
    [followerId, followingId]
  );
  return (result?.count || 0) > 0;
};

// ==================== FEED ====================

export const getFeed = async (userId: string): Promise<FeedItem[]> => {
  const db = await getDatabase();

  // Get reviews from people the user follows
  const reviews = await db.getAllAsync<Review>(
    `SELECT r.* FROM reviews r
     JOIN follows f ON r.user_id = f.following_id
     WHERE f.follower_id = ?
     ORDER BY r.created_at DESC
     LIMIT 50`,
    [userId]
  );

  const result: FeedItem[] = [];
  for (const review of reviews) {
    const user = await db.getFirstAsync<Profile>(
      'SELECT id, username, full_name, avatar_url FROM profiles WHERE id = ?',
      [review.user_id]
    );
    const hotel = await db.getFirstAsync<Hotel>(
      'SELECT id, name, city, country, cover_image_url FROM hotels WHERE id = ?',
      [review.hotel_id]
    );
    const photos = await db.getAllAsync<ReviewPhoto>(
      'SELECT * FROM review_photos WHERE review_id = ?',
      [review.id]
    );

    result.push({
      review: {
        ...review,
        user: user!,
        hotel: hotel!,
        photos,
      },
      friend: user!,
    });
  }

  return result;
};

// ==================== TAGS ====================

export const getAllTags = async (): Promise<HotelTag[]> => {
  const db = await getDatabase();
  return db.getAllAsync<HotelTag>('SELECT * FROM hotel_tags ORDER BY name');
};
