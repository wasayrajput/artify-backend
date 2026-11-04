const Design = require('../models/designSchema');
const cloudinary = require('../config/cloudinary');

// GET all designs
const getDesigns = async (req, res) => {
  try {
    const designs = await Design.find().sort({ createdAt: -1 });
    res.status(200).json(designs);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADD a new design (with Cloudinary image upload)
const addDesign = async (req, res) => {
  try {
    const { title, category, date } = req.body;
    let imageUrl = req.body.image;
    let publicId = req.body.public_id || '';

    // If an image file was uploaded via form-data
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'artify_designs',
            resource_type: 'image',
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      imageUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
    }

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }

    if (!title || !category) {
      return res.status(400).json({ success: false, message: 'Title and category are required' });
    }

    // Default formatted date if not provided
    const formattedDate =
      date ||
      new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

    const newDesign = new Design({
      title,
      category,
      date: formattedDate,
      image: imageUrl,
      public_id: publicId,
    });

    await newDesign.save();
    res.status(201).json({ success: true, data: newDesign });
  } catch (error) {
    console.error('Error adding design:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE a design
const deleteDesign = async (req, res) => {
  try {
    const { id } = req.params;
    const design = await Design.findById(id);

    if (!design) {
      return res.status(404).json({ success: false, message: 'Design not found' });
    }

    // If public_id exists, delete from Cloudinary
    if (design.public_id) {
      try {
        await cloudinary.uploader.destroy(design.public_id);
      } catch (cloudErr) {
        console.warn('Cloudinary delete warning:', cloudErr.message);
      }
    }

    await Design.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Design deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDesigns, addDesign, deleteDesign };
