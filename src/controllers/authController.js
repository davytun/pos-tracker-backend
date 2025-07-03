import User from '../models/UserModel.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../utils/customErrors.js';
import asyncHandler from '../utils/asyncHandler.js';

dotenv.config();

const generateToken = (id, isAdmin) => {
  return jwt.sign({ id, isAdmin }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, isAdmin } = req.body;

  if (!name || !email || !password) {
    return next(new BadRequestError('Please provide name, email, and password'));
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    return next(new BadRequestError('User already exists with that email'));
  }

  const user = await User.create({
    name,
    email,
    password,
    isAdmin: isAdmin || false,
  });

  if (!user) {
    return next(new BadRequestError('Invalid user data, user not created'));
  }

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    token: generateToken(user._id, user.isAdmin),
  });
});

// @desc    Authenticate user & get token (Login)
// @route   POST /api/v1/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError('Please provide email and password'));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return next(new UnauthorizedError('Invalid email or password'));
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    token: generateToken(user._id, user.isAdmin),
  });
});

// @desc    Get current user profile
// @route   GET /api/v1/auth/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res, next) => {
  // req.user is set by the authMiddleware
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new NotFoundError('User not found'));
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
  });
});

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new NotFoundError('User not found'));
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  if (req.body.password) {
    user.password = req.body.password; // Hashing is handled by pre-save middleware
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    isAdmin: updatedUser.isAdmin,
    token: generateToken(updatedUser._id, updatedUser.isAdmin),
  });
});