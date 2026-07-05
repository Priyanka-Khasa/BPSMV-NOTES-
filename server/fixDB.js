require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const fixDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const collection = mongoose.connection.collection('users');
    const indexes = await collection.indexes();

    const dropIfNotSparse = async (name) => {
      const index = indexes.find((item) => item.name === name);
      if (!index) {
        console.log(`${name} index does not exist yet`);
        return;
      }

      if (index.sparse) {
        console.log(`${name} index is already sparse`);
        return;
      }

      await collection.dropIndex(name);
      console.log(`Dropped old non-sparse ${name} index`);
    };

    try {
      await dropIfNotSparse('googleId_1');
      await dropIfNotSparse('rollNumber_1');
    } catch (error) {
      console.warn('Index cleanup warning:', error.message);
    }

    // Recreate indexes from the current schema
    await User.syncIndexes();
    console.log('Synced indexes successfully');

    // Check current indexes
    const updatedIndexes = await collection.indexes();
    console.log('Current indexes:', updatedIndexes.map((i) => `${i.name}${i.sparse ? ' (sparse)' : ''}`));

    console.log('Done! You can now restart the server and register.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixDB();
