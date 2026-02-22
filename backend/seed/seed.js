require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Artist = require('../models/Artist');
const Artwork = require('../models/Artwork');
const LiveProject = require('../models/LiveProject');
const CustomRequest = require('../models/CustomRequest');
const Review = require('../models/Review');
const Message = require('../models/Message');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cultural-art';
const placeholder = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400';

async function seed() {
  await mongoose.connect(MONGODB_URI);
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
    role: 'admin'
  });

  const users = await User.insertMany([
    { name: 'Priya Sharma', email: 'priya@test.com', password: 'password123', role: 'user', city: 'Mumbai' },
    { name: 'Rahul Verma', email: 'rahul@test.com', password: 'password123', role: 'user', city: 'Delhi' },
    { name: 'Anita Desai', email: 'anita@test.com', password: 'password123', role: 'user', city: 'Bangalore' }
  ]);

  const artistsData = [
    { name: 'Vikram Singh', email: 'vikram@artist.com', password: 'password123', role: 'artist', city: 'Jaipur', avatar: placeholder },
    { name: 'Meera Krishnan', email: 'meera@artist.com', password: 'password123', role: 'artist', city: 'Chennai', avatar: placeholder },
    { name: 'Arjun Nair', email: 'arjun@artist.com', password: 'password123', role: 'artist', city: 'Kochi', avatar: placeholder },
    { name: 'Lakshmi Reddy', email: 'lakshmi@artist.com', password: 'password123', role: 'artist', city: 'Hyderabad', avatar: placeholder }
  ];
  const artistUsers = await User.insertMany(artistsData);

  const artists = await Artist.insertMany([
    { user: artistUsers[0]._id, displayName: 'Vikram Singh', bio: 'Traditional mandala & wall art.', artStyles: ['Mandala', 'Traditional'], city: 'Jaipur', profileImage: placeholder, rating: 4.8, reviewCount: 24, isFeatured: true },
    { user: artistUsers[1]._id, displayName: 'Meera Krishnan', bio: 'Portrait and digital art.', artStyles: ['Portrait', 'Digital art'], city: 'Chennai', profileImage: placeholder, rating: 4.6, reviewCount: 18, isFeatured: true },
    { user: artistUsers[2]._id, displayName: 'Arjun Nair', bio: 'Wall painting & murals.', artStyles: ['Wall painting', 'Traditional'], city: 'Kochi', profileImage: placeholder, rating: 4.9, reviewCount: 31, isFeatured: true },
    { user: artistUsers[3]._id, displayName: 'Lakshmi Reddy', bio: 'Sketch and portrait specialist.', artStyles: ['Portrait', 'Sketch'], city: 'Hyderabad', profileImage: placeholder, rating: 4.7, reviewCount: 15 }
  ]);

  const styles = ['mandala', 'portrait', 'wall-painting', 'digital-art', 'traditional'];
  const artworkDocs = [];
  for (let i = 0; i < 20; i++) {
    artworkDocs.push({
      artist: artists[i % artists.length]._id,
      title: `Artwork ${i + 1}`,
      description: 'Beautiful cultural art piece.',
      images: [placeholder],
      style: ['Mandala', 'Portrait', 'Wall painting', 'Digital', 'Traditional'][i % 5],
      category: styles[i % 5],
      price: 500 + i * 200,
      likeCount: Math.floor(Math.random() * 50),
      orderCount: Math.floor(Math.random() * 20),
      isFeatured: i < 5
    });
  }
  await Artwork.insertMany(artworkDocs);

  const projects = [];
  for (let i = 0; i < 8; i++) {
    projects.push({
      artist: artists[i % artists.length]._id,
      title: `Live Project ${i + 1}`,
      description: 'Work in progress.',
      images: [placeholder],
      status: ['sketch', 'in-progress', 'final'][i % 3],
      progress: 20 + i * 10,
      likeCount: Math.floor(Math.random() * 30)
    });
  }
  await LiveProject.insertMany(projects);

  const requests = await CustomRequest.insertMany([
    { user: users[0]._id, artType: 'Portrait', budget: 3000, deadline: new Date(Date.now() + 14 * 86400000), description: 'Family portrait', status: 'completed', acceptedBy: artists[0]._id, finalPrice: 2800 },
    { user: users[1]._id, artType: 'Mandala', budget: 2000, deadline: new Date(Date.now() + 7 * 86400000), description: 'Wall mandala', status: 'pending' }
  ]);

  await Review.insertMany([
    { user: users[0]._id, artist: artists[0]._id, rating: 5, comment: 'Amazing work!', artworkOrdered: 'Custom Portrait' },
    { user: users[1]._id, artist: artists[1]._id, rating: 4, comment: 'Very satisfied.', artworkOrdered: 'Digital Art' }
  ]);

  console.log('Seed done. Admin: admin@culturalart.com / admin123');
  console.log('User: priya@test.com / password123');
  console.log('Artist: vikram@artist.com / password123');
  process.exit(0);
}
seed().catch((e) => { console.error(e); process.exit(1); });
