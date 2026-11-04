const mongoose = require('mongoose');

const designSchema = new mongoose.Schema(
  {
    legacyId: { type: Number },
    title: { type: String, required: true },
    image: { type: String, required: true }, // Cloudinary secure URL
    category: { type: String, required: true },
    date: { type: String, required: true },
    public_id: { type: String, default: '' }, // Cloudinary public ID
  },
  { timestamps: true }
);

module.exports = mongoose.model('Design', designSchema);
