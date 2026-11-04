require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const designRoutes = require('./routes/designRoutes');

const app = express();

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/', (req, res) => {
  res.send('🎨 Artify Studio Backend API Running Successfully on Vercel!');
});

// API Routes
app.use('/api/designs', designRoutes);

// Export for Vercel Serverless
module.exports = app;

// Local development server listener
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
}
