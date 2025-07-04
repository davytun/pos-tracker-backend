import express from "express";
import {
  getAdminStats,
  getAllUsersForAdmin,
} from "../controllers/adminController.js";
import protect, { admin } from "../middleware/authMiddleware.js"; // Import protect and admin

const router = express.Router();

// All routes in this file will be protected and require admin access
router.use(protect);
router.use(admin);

// @desc    Routes for admin functionalities
// @access  Private/Admin

router.get("/stats", getAdminStats);

router.get("/users", getAllUsersForAdmin);

// Example of how other admin routes could be added:
// router.route('/users/:userId/manage').put(manageUser);
// router.get('/logs', viewSystemLogs);

export default router;
