const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log('✅ Database Connected Successfully');
  } catch (error) {
    console.log('❌ Database Connection Failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
