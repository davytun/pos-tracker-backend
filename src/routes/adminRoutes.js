import express from 'express';
import { getAdminStats, getAllUsersForAdmin } from '../controllers/adminController.js';
import protect, { admin } from '../middleware/authMiddleware.js'; // Import protect and admin

const router = express.Router();

// All routes in this file will be protected and require admin access
router.use(protect);
router.use(admin);

// @desc    Routes for admin functionalities
// @access  Private/Admin

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administration and monitoring functionalities
 */

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get basic system statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminStats'
 *       401:
 *         description: Not authorized (token missing or invalid)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden (user is not an admin)
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
router.get('/stats', getAdminStats);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get a list of all users (for admin monitoring)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User' # User schema without password
 *       401:
 *         description: Not authorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden (user is not an admin)
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
router.get('/users', getAllUsersForAdmin);

// Example of how other admin routes could be added:
// router.route('/users/:userId/manage').put(manageUser);
// router.get('/logs', viewSystemLogs);

export default router;