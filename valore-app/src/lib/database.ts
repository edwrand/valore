import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('valore.db');
  return db;
};

export const initDatabase = async (): Promise<void> => {
  const database = await getDatabase();

  // Create tables
  await database.execAsync(`
    -- Profiles table
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      full_name TEXT,
      avatar_url TEXT,
      bio TEXT,
      home_city TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Hotels table
    CREATE TABLE IF NOT EXISTS hotels (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      city TEXT,
      country TEXT,
      address TEXT,
      lat REAL,
      lng REAL,
      place_id TEXT UNIQUE,
      website_url TEXT,
      phone TEXT,
      price_tier TEXT,
      cover_image_url TEXT,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Hotel tags
    CREATE TABLE IF NOT EXISTS hotel_tags (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL
    );

    -- Hotel to tag mapping
    CREATE TABLE IF NOT EXISTS hotel_tag_map (
      hotel_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (hotel_id, tag_id),
      FOREIGN KEY (hotel_id) REFERENCES hotels(id),
      FOREIGN KEY (tag_id) REFERENCES hotel_tags(id)
    );

    -- Reviews
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      hotel_id TEXT NOT NULL,
      rating_overall INTEGER NOT NULL CHECK (rating_overall >= 1 AND rating_overall <= 5),
      rating_aesthetic INTEGER CHECK (rating_aesthetic >= 1 AND rating_aesthetic <= 5),
      rating_service INTEGER CHECK (rating_service >= 1 AND rating_service <= 5),
      rating_amenities INTEGER CHECK (rating_amenities >= 1 AND rating_amenities <= 5),
      title TEXT,
      body TEXT,
      trip_type TEXT,
      stay_date TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE (user_id, hotel_id),
      FOREIGN KEY (user_id) REFERENCES profiles(id),
      FOREIGN KEY (hotel_id) REFERENCES hotels(id)
    );

    -- Review photos
    CREATE TABLE IF NOT EXISTS review_photos (
      id TEXT PRIMARY KEY,
      review_id TEXT NOT NULL,
      url TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (review_id) REFERENCES reviews(id)
    );

    -- Lists (saved hotels)
    CREATE TABLE IF NOT EXISTS lists (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES profiles(id)
    );

    -- List items
    CREATE TABLE IF NOT EXISTS list_items (
      list_id TEXT NOT NULL,
      hotel_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (list_id, hotel_id),
      FOREIGN KEY (list_id) REFERENCES lists(id),
      FOREIGN KEY (hotel_id) REFERENCES hotels(id)
    );

    -- Follows
    CREATE TABLE IF NOT EXISTS follows (
      follower_id TEXT NOT NULL,
      following_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (follower_id, following_id),
      FOREIGN KEY (follower_id) REFERENCES profiles(id),
      FOREIGN KEY (following_id) REFERENCES profiles(id)
    );
  `);

  console.log('Database initialized');
};

// Helper to generate UUIDs
export const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
