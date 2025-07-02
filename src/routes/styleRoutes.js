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
  .post(protect, upload.single('styleImage'), createStyle)
  .get(protect, getStyles);

/**
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
 *   put:
 *     summary: Update a specific style (can include image replacement)
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

 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/StyleUpdateInput' # References the schema for text fields and optional image
 *     responses:
 *       200:
 *         description: Style updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Style'
 *       400:
 *         description: Invalid input or validation error
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
 *   delete:
 *     summary: Delete a specific style
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
 *         description: Style removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Style removed
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
  .get(protect, getStyleById)
  .put(protect, upload.single('styleImage'), updateStyle)
  .delete(protect, deleteStyle);

export default router;
