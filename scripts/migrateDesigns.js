require('dotenv').config();
const path = require('path');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');
const Design = require('../models/designSchema');
const connectDB = require('../config/database');

async function migrate() {
  await connectDB();

  // Read GalleryData.js
  const galleryDataPath = path.resolve(__dirname, '../../artify-studio-portfolio/src/components/GalleryData.js');
  let fileContent = fs.readFileSync(galleryDataPath, 'utf8');

  // Convert ES export to CommonJS
  fileContent = fileContent.replace('export const ArtifyDesigns =', 'module.exports =');
  const tempFile = path.resolve(__dirname, 'tempGalleryData.cjs');
  fs.writeFileSync(tempFile, fileContent);

  const rawDesigns = require(tempFile);
  fs.unlinkSync(tempFile); // cleanup

  console.log(`Found ${rawDesigns.length} designs in GalleryData.js.`);

  const designsDir = path.resolve(__dirname, '../../artify-studio-portfolio/public/designs');

  let uploadedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < rawDesigns.length; i++) {
    const item = rawDesigns[i];
    const imagePath = path.join(designsDir, item.image);

    // Check if already in MongoDB by legacyId
    const existing = await Design.findOne({ legacyId: item.id });
    if (existing) {
      console.log(`[${i + 1}/${rawDesigns.length}] Skipped (legacyId ${item.id} exists): "${item.title}"`);
      skippedCount++;
      continue;
    }

    if (!fs.existsSync(imagePath)) {
      console.warn(`[${i + 1}/${rawDesigns.length}] Warning: File not found: ${imagePath}`);
      continue;
    }

    try {
      const baseName = path.parse(item.image).name;
      console.log(`[${i + 1}/${rawDesigns.length}] Uploading ID ${item.id}: "${item.title}" (${item.image})...`);
      
      const uploadResult = await cloudinary.uploader.upload(imagePath, {
        folder: 'artify_designs',
        public_id: baseName,
        overwrite: true,
        resource_type: 'image',
      });

      const newDesign = new Design({
        legacyId: item.id,
        title: item.title,
        category: item.category,
        date: item.date,
        image: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      });

      await newDesign.save();
      uploadedCount++;
      console.log(`  ✓ Saved!`);
    } catch (err) {
      console.error(`  ✗ Error uploading ID ${item.id} "${item.title}":`, err.message);
    }
  }

  console.log(`\n🎉 Migration Complete!`);
  console.log(`Total Uploaded & Saved: ${uploadedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
