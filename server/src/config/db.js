const mongoose = require('mongoose');

const cleanEnvValue = (value) => {
  const trimmed = (value || '').trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
};

const connectDB = async () => {
  try {
    const mongoUri = cleanEnvValue(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bpsmv-resource-hub')
      .replace('mongodb://localhost:', 'mongodb://127.0.0.1:');
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      family: 4
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
