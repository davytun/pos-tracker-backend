import express from 'express';
import {
  createStyle,
  getStyles,
  getStyleById,
  updateStyle,
  deleteStyle,
} from '../controllers/styleController.js';
import upload from '../middleware/uploadMiddleware.js'; // For handling image uploads
import protect from '../middleware/authMiddleware.js';   // Assuming auth middleware is ready

const router = express.Router();

// TODO: Apply 'protect' middleware to all routes once auth is fully implemented

router.route('/')
  .post(protect, upload.single('styleImage'), createStyle)
  .get(protect, getStyles);

router.route('/:id')
  .get(protect, getStyleById)
  .put(protect, upload.single('styleImage'), updateStyle)
  .delete(protect, deleteStyle);

export default router;
