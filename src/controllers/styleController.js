import Style from '../models/StyleModel.js';
import Client from '../models/ClientModel.js';
import cloudinary from '../config/cloudinaryConfig.js';
import fs from 'fs/promises'; // For handling temporary file if needed, or use stream directly

// @desc    Upload a new style image and create style record
// @route   POST /api/v1/styles
// @access  Private (TODO: Add auth middleware)
export const createStyle = async (req, res) => {
  try {
    const { name, category, description } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: 'Name and category are required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Style image is required' });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'fashion_styles', // Optional: specify a folder in Cloudinary
      // transformation: [{ width: 500, height: 500, crop: 'limit' }] // Optional: image transformations
    });

    // Optional: Delete the temporary file from server after upload to Cloudinary if multer saves it locally
    // await fs.unlink(req.file.path); // Only if multer is configured to save to disk first

    const style = new Style({
      name,
      category,
      description,
      imageUrl: result.secure_url,
      cloudinaryPublicId: result.public_id,
    });

    const createdStyle = await style.save();
    res.status(201).json(createdStyle);
  } catch (error) {
    console.error('Error creating style:', error);
    // If file was uploaded and then DB save failed, consider deleting from Cloudinary
    if (req.file && error.name !== 'ValidationError') { // Check if it's not a validation error before DB
        // Potentially delete from Cloudinary if `result` is available
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error: Could not create style' });
  }
};

// @desc    Get all styles
// @route   GET /api/v1/styles
// @access  Private (TODO: Add auth middleware)
export const getStyles = async (req, res) => {
  try {
    const { category, name } = req.query;
    const queryObject = {};

    if (category) {
      queryObject.category = category; // Exact match for category
    }
    if (name) {
      queryObject.name = { $regex: name, $options: 'i' }; // Case-insensitive search for name
    }

    const styles = await Style.find(queryObject); // .populate('clients') if needed
    res.json(styles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error: Could not fetch styles' });
  }
};

// @desc    Get a single style by ID
// @route   GET /api/v1/styles/:id
// @access  Private (TODO: Add auth middleware)
export const getStyleById = async (req, res) => {
  try {
    const style = await Style.findById(req.params.id); // .populate('clients') if needed
    if (style) {
      res.json(style);
    } else {
      res.status(404).json({ message: 'Style not found' });
    }
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Style not found' });
    }
    res.status(500).json({ message: 'Server Error: Could not fetch style' });
  }
};

// @desc    Update a style (name, category, description - image update is separate or more complex)
// @route   PUT /api/v1/styles/:id
// @access  Private (TODO: Add auth middleware)
export const updateStyle = async (req, res) => {
  try {
    const { name, category, description } = req.body;
    const style = await Style.findById(req.params.id);

    if (!style) {
      return res.status(404).json({ message: 'Style not found' });
    }

    // For image update, you'd need to handle file upload and delete old image from Cloudinary
    if (req.file) {
        // Delete old image from Cloudinary
        if (style.cloudinaryPublicId) {
            await cloudinary.uploader.destroy(style.cloudinaryPublicId);
        }
        // Upload new image
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'fashion_styles',
        });
        style.imageUrl = result.secure_url;
        style.cloudinaryPublicId = result.public_id;
        // await fs.unlink(req.file.path); // if multer saves locally
    }

    style.name = name || style.name;
    style.category = category || style.category;
    style.description = description || style.description;

    const updatedStyle = await style.save();
    res.json(updatedStyle);
  } catch (error) {
    console.error('Error updating style:', error);
     if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Style not found' });
    }
    res.status(500).json({ message: 'Server Error: Could not update style' });
  }
};

// @desc    Delete a style
// @route   DELETE /api/v1/styles/:id
// @access  Private (TODO: Add auth middleware)
export const deleteStyle = async (req, res) => {
  try {
    const style = await Style.findById(req.params.id);

    if (!style) {
      return res.status(404).json({ message: 'Style not found' });
    }

    // Delete image from Cloudinary
    if (style.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(style.cloudinaryPublicId);
    }

    // Remove style reference from any clients
    await Client.updateMany(
      { styles: style._id },
      { $pull: { styles: style._id } }
    );

    await style.deleteOne();
    res.json({ message: 'Style removed' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Style not found' });
    }
    res.status(500).json({ message: 'Server Error: Could not delete style' });
  }
};
