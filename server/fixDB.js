require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const fixDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Drop the old googleId index (it was unique but not sparse, blocking null values)
    const collection = mongoose.connection.collection('users');
    try {
      await collection.dropIndex('googleId_1');
      console.log('Dropped old googleId_1 index');
    } catch (e) {
      console.log('googleId_1 index did not exist or already fixed');
    }

    // Recreate indexes from the current schema
    await User.syncIndexes();
    console.log('Synced indexes successfully');

    // Check current indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));

    console.log('Done! You can now restart the server and register.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixDB();
