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

import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../middleware/validationResultHandler.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Styles
 *   description: Style management and image uploads
 */

/**
 * @swagger
 * /styles:
 *   post:
 *     summary: Create a new style with an image upload
 *     tags: [Styles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/StyleInput'
 *           examples:
 *             example1:
 *               value:
 *                 name: "Casual Summer Dress"
 *                 category: "Casual"
 *                 description: "A light, airy dress for summer."
 *     responses:
 *       201:
 *         description: Style created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Style'
 *       400:
 *         description: Invalid input, missing required fields, or image upload error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Not authorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   get:
 *     summary: Get all styles
 *     tags: [Styles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: ['Traditional', 'Wedding', 'Casual', 'Corporate', 'Evening Wear', 'Other']
 *         description: Filter styles by category
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter styles by name (case-insensitive, partial match)
 *     responses:
 *       200:
 *         description: A list of styles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Style'
 *       401:
 *         description: Not authorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.route('/')
  .post(
    protect,
    upload.single('styleImage'), // Multer middleware for file upload
    [
      body('name').trim().notEmpty().withMessage('Style name is required.').escape(),
      body('category').trim().notEmpty().withMessage('Category is required.')
        .isIn(['Traditional', 'Wedding', 'Casual', 'Corporate', 'Evening Wear', 'Other'])
        .withMessage('Invalid category selected.')
        .escape(), // Category is from a fixed list, but escape for good measure
      body('description').optional().isString().trim().escape(),
      // Validation for req.file (the uploaded image) can be done here or in controller
      // For example, check if file exists after multer processing:
      // body('styleImage').custom((value, { req }) => {
      //   if (!req.file) {
      //     throw new Error('Style image is required.');
      //   }
      //   return true;
      // })
    ],
    handleValidationErrors,
    createStyle
  )
  .get(
    protect,
    [
      query('category').optional().isString().trim()
        .isIn(['Traditional', 'Wedding', 'Casual', 'Corporate', 'Evening Wear', 'Other'])
        .withMessage('Invalid category for filtering.'),
      query('name').optional().isString().trim(),
    ],
    handleValidationErrors,
    getStyles
  );

// Temporarily commenting out the entire JSDoc block for /styles/{id} for debugging
/*
 * @swagger
 * /styles/{id}:
 *   get:
 *     summary: Get a specific style by ID
 *     tags: [Styles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The style ID
 *     responses:
 *       200:
 *         description: Style data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Style'
 *       401:
 *         description: Not authorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Style not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.route('/:id')
  .get(
    protect,
    [
      param('id').isMongoId().withMessage('Invalid style ID format.'),
    ],
    handleValidationErrors,
    getStyleById
  )
  .put(
    protect,
    upload.single('styleImage'), // Multer for potential file update
    [
      param('id').isMongoId().withMessage('Invalid style ID format.'),
      body('name').optional().trim().notEmpty().withMessage('Style name cannot be empty if provided.').escape(),
      body('category').optional().trim().notEmpty().withMessage('Category cannot be empty if provided.')
        .isIn(['Traditional', 'Wedding', 'Casual', 'Corporate', 'Evening Wear', 'Other'])
        .withMessage('Invalid category selected if provided.')
        .escape(),
      body('description').optional().isString().trim().escape(),
    ],
    handleValidationErrors,
    updateStyle
  )
  .delete(
    protect,
    [
      param('id').isMongoId().withMessage('Invalid style ID format.'),
    ],
    handleValidationErrors,
    deleteStyle
  );

export default router;
