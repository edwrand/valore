import { getDatabase, generateId } from './database';

// Sample tags
const TAGS = [
  { id: 'tag-1', name: 'Luxury' },
  { id: 'tag-2', name: 'Boutique' },
  { id: 'tag-3', name: 'Eco-Luxe' },
  { id: 'tag-4', name: 'Heritage' },
  { id: 'tag-5', name: 'Beach Resort' },
  { id: 'tag-6', name: 'Wellness' },
  { id: 'tag-7', name: 'Design-Led' },
  { id: 'tag-8', name: 'Coastal Chic' },
];

// Sample hotels with real data
const HOTELS = [
  {
    id: 'hotel-1',
    name: 'The Ritz Paris',
    city: 'Paris',
    country: 'France',
    lat: 48.8682,
    lng: 2.3282,
    price_tier: '$$$$',
    cover_image_url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    description: 'Legendary palace hotel on Place Vendôme, offering timeless luxury and impeccable French elegance since 1898.',
    tags: ['tag-1', 'tag-4'],
  },
  {
    id: 'hotel-2',
    name: 'Aman Tokyo',
    city: 'Tokyo',
    country: 'Japan',
    lat: 35.6853,
    lng: 139.7635,
    price_tier: '$$$$',
    cover_image_url: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=800',
    description: 'Urban sanctuary in Otemachi Tower with minimalist Japanese design and panoramic city views.',
    tags: ['tag-1', 'tag-7', 'tag-6'],
  },
  {
    id: 'hotel-3',
    name: 'Soneva Fushi',
    city: 'Baa Atoll',
    country: 'Maldives',
    lat: 5.1108,
    lng: 72.9553,
    price_tier: '$$$$',
    cover_image_url: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800',
    description: 'Pioneering barefoot luxury resort with overwater villas and a no-shoes, no-news philosophy.',
    tags: ['tag-3', 'tag-5', 'tag-6'],
  },
  {
    id: 'hotel-4',
    name: 'Claridge\'s',
    city: 'London',
    country: 'United Kingdom',
    lat: 51.5122,
    lng: -0.1467,
    price_tier: '$$$$',
    cover_image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    description: 'Art Deco masterpiece in Mayfair, beloved by royalty and celebrities for over a century.',
    tags: ['tag-1', 'tag-4'],
  },
  {
    id: 'hotel-5',
    name: 'Six Senses Zil Pasyon',
    city: 'Félicité Island',
    country: 'Seychelles',
    lat: -4.3167,
    lng: 55.8667,
    price_tier: '$$$$',
    cover_image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
    description: 'Private island retreat with dramatic granite boulders and pristine beaches.',
    tags: ['tag-3', 'tag-5', 'tag-6'],
  },
  {
    id: 'hotel-6',
    name: 'The Hoxton, Paris',
    city: 'Paris',
    country: 'France',
    lat: 48.8606,
    lng: 2.3522,
    price_tier: '$$',
    cover_image_url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
    description: 'Hip hotel in a former 18th-century mansion in the 2nd arrondissement.',
    tags: ['tag-2', 'tag-7'],
  },
  {
    id: 'hotel-7',
    name: 'Ace Hotel Kyoto',
    city: 'Kyoto',
    country: 'Japan',
    lat: 35.0012,
    lng: 135.7659,
    price_tier: '$$',
    cover_image_url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
    description: 'Design-forward hotel blending industrial chic with traditional Japanese craft.',
    tags: ['tag-2', 'tag-7'],
  },
  {
    id: 'hotel-8',
    name: 'Belmond Hotel Caruso',
    city: 'Ravello',
    country: 'Italy',
    lat: 40.6493,
    lng: 14.6125,
    price_tier: '$$$',
    cover_image_url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
    description: '11th-century palazzo perched on the Amalfi Coast with an infinity pool overlooking the Mediterranean.',
    tags: ['tag-1', 'tag-4', 'tag-8'],
  },
  {
    id: 'hotel-9',
    name: 'The Brando',
    city: 'Tetiaroa',
    country: 'French Polynesia',
    lat: -17.0167,
    lng: -149.5833,
    price_tier: '$$$$',
    cover_image_url: 'https://images.unsplash.com/photo-1439130490301-25e322d88054?w=800',
    description: 'Carbon-neutral luxury resort on Marlon Brando\'s private island atoll.',
    tags: ['tag-3', 'tag-5'],
  },
  {
    id: 'hotel-10',
    name: 'Singita Sabi Sand',
    city: 'Kruger',
    country: 'South Africa',
    lat: -24.8333,
    lng: 31.4167,
    price_tier: '$$$$',
    cover_image_url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800',
    description: 'Ultra-luxury safari lodge with exceptional Big Five game viewing.',
    tags: ['tag-1', 'tag-3'],
  },
  {
    id: 'hotel-11',
    name: 'Soho House Barcelona',
    city: 'Barcelona',
    country: 'Spain',
    lat: 41.3784,
    lng: 2.1892,
    price_tier: '$$',
    cover_image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
    description: 'Members club and hotel in the Gothic Quarter with rooftop pool.',
    tags: ['tag-2', 'tag-7'],
  },
  {
    id: 'hotel-12',
    name: 'Como Castello Del Nero',
    city: 'Tuscany',
    country: 'Italy',
    lat: 43.5167,
    lng: 11.2333,
    price_tier: '$$$',
    cover_image_url: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800',
    description: '12th-century castle estate in the Chianti hills with destination spa.',
    tags: ['tag-4', 'tag-6'],
  },
];

// Sample users
const USERS = [
  {
    id: 'user-1',
    username: 'traveljane',
    full_name: 'Jane Thompson',
    bio: 'Luxury travel blogger. 50+ countries. Collecting sunsets and room service.',
    home_city: 'New York',
  },
  {
    id: 'user-2',
    username: 'marcowanders',
    full_name: 'Marco Ricci',
    bio: 'Hotel enthusiast and architecture lover.',
    home_city: 'Milan',
  },
  {
    id: 'user-3',
    username: 'sarahexplores',
    full_name: 'Sarah Chen',
    bio: 'Seeking the perfect hotel experience, one stay at a time.',
    home_city: 'San Francisco',
  },
];

// Sample reviews
const REVIEWS = [
  {
    id: 'review-1',
    user_id: 'user-1',
    hotel_id: 'hotel-1',
    rating_overall: 5,
    rating_aesthetic: 5,
    rating_service: 5,
    rating_amenities: 5,
    title: 'Pure magic in the heart of Paris',
    body: 'The Ritz Paris exceeded every expectation. From the moment we arrived, we were treated like royalty. The Coco Chanel suite was breathtaking, and the attention to detail throughout was impeccable. The Bar Hemingway is a must-visit.',
    trip_type: 'honeymoon',
  },
  {
    id: 'review-2',
    user_id: 'user-2',
    hotel_id: 'hotel-2',
    rating_overall: 5,
    rating_aesthetic: 5,
    rating_service: 4,
    rating_amenities: 5,
    title: 'Zen in the sky',
    body: 'Aman Tokyo is a masterclass in minimalist luxury. The ryokan-inspired design creates an oasis of calm above the bustling city. The spa is transcendent, and the kaiseki at the restaurant was one of the best meals of my life.',
    trip_type: 'solo',
  },
  {
    id: 'review-3',
    user_id: 'user-3',
    hotel_id: 'hotel-3',
    rating_overall: 5,
    rating_aesthetic: 5,
    rating_service: 5,
    rating_amenities: 4,
    title: 'Paradise found',
    body: 'Soneva Fushi is the ultimate escape. No shoes, no news, just pure bliss. The overwater villa was stunning, and the stargazing dinner was unforgettable. Already planning our return.',
    trip_type: 'couples',
  },
  {
    id: 'review-4',
    user_id: 'user-1',
    hotel_id: 'hotel-8',
    rating_overall: 5,
    rating_aesthetic: 5,
    rating_service: 5,
    rating_amenities: 4,
    title: 'Italian dreams come true',
    body: 'Waking up to views of the Amalfi Coast from our terrace was surreal. The infinity pool is even more stunning in person. The staff remembered every preference. True Italian hospitality.',
    trip_type: 'couples',
  },
  {
    id: 'review-5',
    user_id: 'user-2',
    hotel_id: 'hotel-6',
    rating_overall: 4,
    rating_aesthetic: 5,
    rating_service: 4,
    rating_amenities: 4,
    title: 'Cool and comfortable',
    body: 'The Hoxton perfectly balances style and value. Love the design aesthetic and the location is unbeatable. The lobby is always buzzing with a great crowd. Perfect for a design-forward Paris trip.',
    trip_type: 'work',
  },
];

export const seedDatabase = async (): Promise<void> => {
  const db = await getDatabase();

  // Check if already seeded
  const existingHotels = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM hotels'
  );

  if (existingHotels && existingHotels.count > 0) {
    console.log('Database already seeded');
    return;
  }

  console.log('Seeding database...');

  // Insert tags
  for (const tag of TAGS) {
    await db.runAsync(
      'INSERT OR IGNORE INTO hotel_tags (id, name) VALUES (?, ?)',
      [tag.id, tag.name]
    );
  }

  // Insert hotels
  for (const hotel of HOTELS) {
    await db.runAsync(
      `INSERT OR IGNORE INTO hotels (id, name, city, country, lat, lng, price_tier, cover_image_url, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        hotel.id,
        hotel.name,
        hotel.city,
        hotel.country,
        hotel.lat,
        hotel.lng,
        hotel.price_tier,
        hotel.cover_image_url,
        hotel.description,
      ]
    );

    // Insert hotel-tag mappings
    for (const tagId of hotel.tags) {
      await db.runAsync(
        'INSERT OR IGNORE INTO hotel_tag_map (hotel_id, tag_id) VALUES (?, ?)',
        [hotel.id, tagId]
      );
    }
  }

  // Insert sample users
  for (const user of USERS) {
    await db.runAsync(
      `INSERT OR IGNORE INTO profiles (id, username, full_name, bio, home_city)
       VALUES (?, ?, ?, ?, ?)`,
      [user.id, user.username, user.full_name, user.bio, user.home_city]
    );
  }

  // Insert sample reviews
  for (const review of REVIEWS) {
    await db.runAsync(
      `INSERT OR IGNORE INTO reviews (id, user_id, hotel_id, rating_overall, rating_aesthetic, rating_service, rating_amenities, title, body, trip_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        review.id,
        review.user_id,
        review.hotel_id,
        review.rating_overall,
        review.rating_aesthetic,
        review.rating_service,
        review.rating_amenities,
        review.title,
        review.body,
        review.trip_type,
      ]
    );
  }

  // Create some follows between sample users
  await db.runAsync(
    'INSERT OR IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)',
    ['user-1', 'user-2']
  );
  await db.runAsync(
    'INSERT OR IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)',
    ['user-1', 'user-3']
  );
  await db.runAsync(
    'INSERT OR IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)',
    ['user-2', 'user-1']
  );

  console.log('Database seeded successfully');
};
