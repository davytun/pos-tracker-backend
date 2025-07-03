import User from '../models/UserModel.js';
import Client from '../models/ClientModel.js';
import Style from '../models/StyleModel.js';
import asyncHandler from '../utils/asyncHandler.js';
// No specific custom errors needed here yet unless we add more complex logic

// @desc    Get summary statistics for admin dashboard
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
export const getAdminStats = asyncHandler(async (req, res, next) => {
  const userCount = await User.countDocuments();
  const clientCount = await Client.countDocuments();
  const styleCount = await Style.countDocuments();

  res.json({
    users: userCount,
    clients: clientCount,
    styles: styleCount,
    message: "Admin dashboard data - more features to come in future phases.",
  });
});

// @desc    Get all users (example for user monitoring)
// @route   GET /api/v1/admin/users
// @access  Private/Admin
export const getAllUsersForAdmin = asyncHandler(async (req, res, next) => {
  const users = await User.find({}).select('-password'); // Exclude passwords
  res.json(users);
});

// Placeholder for other admin actions, e.g., managing users, viewing logs, etc.
// export const manageUser = async (req, res) => { ... };
// export const viewSystemLogs = async (req, res) => { ... };
