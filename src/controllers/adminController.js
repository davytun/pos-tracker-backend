import User from '../models/UserModel.js';
import Client from '../models/ClientModel.js';
import Style from '../models/StyleModel.js';

// @desc    Get summary statistics for admin dashboard
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const clientCount = await Client.countDocuments();
    const styleCount = await Style.countDocuments();

    // In a real dashboard, you might fetch more detailed data,
    // recent activities, etc.
    res.json({
      users: userCount,
      clients: clientCount,
      styles: styleCount,
      message: "Admin dashboard data - more features to come in future phases.",
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server Error: Could not fetch admin statistics' });
  }
};

// @desc    Get all users (example for user monitoring)
// @route   GET /api/v1/admin/users
// @access  Private/Admin
export const getAllUsersForAdmin = async (req, res) => {
    try {
        const users = await User.find({}).select('-password'); // Exclude passwords
        res.json(users);
    } catch (error) {
        console.error('Error fetching all users for admin:', error);
        res.status(500).json({ message: 'Server Error: Could not fetch users' });
    }
};

// Placeholder for other admin actions, e.g., managing users, viewing logs, etc.
// export const manageUser = async (req, res) => { ... };
// export const viewSystemLogs = async (req, res) => { ... };
