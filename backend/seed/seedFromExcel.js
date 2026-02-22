require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Artist = require('../models/Artist');
const Artwork = require('../models/Artwork');
const LiveProject = require('../models/LiveProject');
const CustomRequest = require('../models/CustomRequest');
const Review = require('../models/Review');
const Message = require('../models/Message');
const { readExcelRows, getColumnMap, get } = require('./readExcel');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cultural-art';
const placeholder = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400';

const ART_CATEGORIES = ['mandala', 'portrait', 'wall-painting', 'digital-art', 'traditional', 'other'];
function toCategory(str) {
  if (!str) return 'other';
  const s = str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return ART_CATEGORIES.includes(s) ? s : ART_CATEGORIES.find((c) => s.includes(c)) || 'other';
}

async function seedFromExcel() {
  await mongoose.connect(MONGODB_URI);

  const rows = readExcelRows();
  if (rows.length === 0) {
    console.log('Excel file has no data rows. Run default seed with: npm run seed');
    process.exit(0);
    return;
  }

  const columnMap = getColumnMap(rows[0]);
  console.log('Excel columns (normalized):', Object.keys(columnMap).join(', '));

  await User.deleteMany({});
  await Artist.deleteMany({});
  await Artwork.deleteMany({});
  await LiveProject.deleteMany({});
  await CustomRequest.deleteMany({});
  await Review.deleteMany({});
  await Message.deleteMany({});

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@culturalart.com',
    password: 'admin123',
    role: 'admin',
  });

  const testUser = await User.create({
    name: 'Test User',
    email: 'user@test.com',
    password: 'password123',
    role: 'user',
    city: 'Mumbai',
  });

  const artistByRegion = new Map();
  const artistUsers = [];
  const artists = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const artForm =
      get(row, columnMap, 'art_form', 'artform', 'art form', 'form', 'type', 'art_type', 'category', 'style') || 'Traditional Art';
    const region =
      get(row, columnMap, 'region', 'city', 'location', 'place', 'state') || 'India';
    const howApplied =
      get(row, columnMap, 'how_its_applied_in_homes', 'how_its_applied', 'application', 'how_applied') || '';
    const whyArtistPresence =
      get(row, columnMap, 'why_it_requires_artist_presence', 'why_artist_presence', 'artist_presence') || '';
    const description = [howApplied, whyArtistPresence].filter(Boolean).join(' ') || `${artForm} from ${region}.`;
    const priceRaw = get(row, columnMap, 'price', 'cost', 'amount', 'budget');
    const price = isNaN(Number(priceRaw)) ? 500 + i * 100 : Math.max(0, Number(priceRaw));

    const key = region;
    if (!artistByRegion.has(key)) {
      const artistName = `Artisan from ${region}`;
      const email = `artist${artistUsers.length + 1}@culturalart.com`;
      const user = await User.create({
        name: artistName,
        email,
        password: 'password123',
        role: 'artist',
        city: region,
        avatar: placeholder,
      });
      const artist = await Artist.create({
        user: user._id,
        displayName: artistName,
        bio: `Traditional and cultural art forms from ${region}.`,
        artStyles: [artForm],
        city: region,
        profileImage: placeholder,
        rating: 4 + Math.random(),
        reviewCount: Math.floor(Math.random() * 20),
        isFeatured: artists.length < 5,
      });
      artistUsers.push(user);
      artists.push(artist);
      artistByRegion.set(key, artist);
    }

    const artist = artistByRegion.get(key);
    await Artwork.create({
      artist: artist._id,
      title: artForm,
      description: description.slice(0, 500),
      images: [placeholder],
      style: artForm,
      category: toCategory(artForm),
      price,
      likeCount: Math.floor(Math.random() * 50),
      orderCount: Math.floor(Math.random() * 15),
      isFeatured: i < 10,
    });
  }

  const projArtists = artists.slice(0, Math.min(5, artists.length));
  for (let i = 0; i < projArtists.length; i++) {
    await LiveProject.create({
      artist: projArtists[i]._id,
      title: `Live Project ${i + 1}`,
      description: 'Work in progress.',
      images: [placeholder],
      status: ['sketch', 'in-progress', 'final'][i % 3],
      progress: 20 + i * 15,
      likeCount: Math.floor(Math.random() * 30),
    });
  }

  await CustomRequest.insertMany([
    {
      user: testUser._id,
      artType: 'Portrait',
      budget: 3000,
      deadline: new Date(Date.now() + 14 * 86400000),
      description: 'Custom portrait request',
      status: 'pending',
    },
  ]);

  if (artists.length > 0 && testUser) {
    await Review.create({
      user: testUser._id,
      artist: artists[0]._id,
      rating: 5,
      comment: 'Amazing work from the Excel data!',
      artworkOrdered: 'Custom',
    });
  }

  console.log('Seed from Excel done.');
  console.log('Artists created:', artists.length);
  console.log('Artworks created:', rows.length);
  console.log('Admin: admin@culturalart.com / admin123');
  console.log('User: user@test.com / password123');
  console.log('Artists: artist1@culturalart.com, artist2@culturalart.com, ... / password123');
  process.exit(0);
}

seedFromExcel().catch((e) => {
  console.error(e);
  process.exit(1);
});
