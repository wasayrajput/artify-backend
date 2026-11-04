const express = require('express');
const router = express.Router();
const { getDesigns, addDesign, deleteDesign } = require('../controllers/designController');
const upload = require('../middleware/upload');

// GET all designs
router.get('/', getDesigns);

// POST new design with image upload
router.post('/', upload.single('image'), addDesign);

// DELETE a design by ID
router.delete('/:id', deleteDesign);

module.exports = router;
