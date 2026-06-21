require('dotenv').config();
const mongoose = require('mongoose');
const Subject = require('./src/models/Subject');

const subjects = [
  { name: 'Data Structures and Algorithms', code: 'CSE201', degree: 'B.Tech', branch: 'CSE', semester: 3 },
  { name: 'Database Management Systems', code: 'CSE202', degree: 'B.Tech', branch: 'CSE', semester: 4 },
  { name: 'Operating Systems', code: 'CSE301', degree: 'B.Tech', branch: 'CSE', semester: 5 },
  { name: 'Computer Networks', code: 'CSE302', degree: 'B.Tech', branch: 'CSE', semester: 6 },
  { name: 'Software Engineering', code: 'CSE401', degree: 'B.Tech', branch: 'CSE', semester: 7 },
  { name: 'Digital Electronics', code: 'ECE201', degree: 'B.Tech', branch: 'ECE', semester: 3 },
  { name: 'Analog Communication', code: 'ECE202', degree: 'B.Tech', branch: 'ECE', semester: 4 }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding');

    await Subject.deleteMany();
    console.log('Cleared existing subjects');

    await Subject.insertMany(subjects);
    console.log('Subjects seeded successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
