import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
} from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Basic admin check middleware (example, can be expanded)
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

// Example of a protected admin route (can be moved to a separate adminRoutes.js later)
// router.get('/admin/users', protect, admin, getAllUsers); // Assuming getAllUsers controller exists

export default router;
