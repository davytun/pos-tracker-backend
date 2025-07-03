import Style from '../models/StyleModel.js';
import Client from '../models/ClientModel.js';
import { uploadImageToCloudinary, deleteImageFromCloudinary, attemptCloudinaryDelete } from '../services/styleService.js';
import { BadRequestError, NotFoundError, AppError } from '../utils/customErrors.js';
import asyncHandler from '../utils/asyncHandler.js';
import mongoose from 'mongoose';

// @desc    Upload a new style image and create style record
// @route   POST /api/v1/styles
// @access  Private (TODO: Add auth middleware)
export const createStyle = asyncHandler(async (req, res, next) => {
  const { name, category, description } = req.body;

  if (!name || !category) {
    return next(new BadRequestError('Name and category are required fields'));
  }
  if (!req.file) {
    return next(new BadRequestError('Style image is required'));
  }

  let uploadedImageResult;
  try {
    uploadedImageResult = await uploadImageToCloudinary(req.file.path, 'fashion_styles');

    const style = new Style({
      name,
      category,
      description,
      imageUrl: uploadedImageResult.secure_url,
      cloudinaryPublicId: uploadedImageResult.public_id,
    });

    const createdStyle = await style.save();
    res.status(201).json(createdStyle);
  } catch (error) {
    if (uploadedImageResult && uploadedImageResult.public_id && !(error instanceof AppError && error.statusCode < 500)) {
      await attemptCloudinaryDelete(uploadedImageResult.public_id);
    }
    return next(error);
  }
});

// @desc    Get all styles
// @route   GET /api/v1/styles
// @access  Private (TODO: Add auth middleware)
export const getStyles = asyncHandler(async (req, res, next) => {
  const { category, name } = req.query;
  const queryObject = {};

  if (category) {
    queryObject.category = category;
  }
  if (name) {
    queryObject.name = { $regex: name, $options: 'i' };
  }

  const styles = await Style.find(queryObject);
  res.json(styles);
});

// @desc    Get a single style by ID
// @route   GET /api/v1/styles/:id
// @access  Private (TODO: Add auth middleware)
export const getStyleById = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new BadRequestError(`Invalid style ID: ${req.params.id}`));
  }
  const style = await Style.findById(req.params.id);

  if (!style) {
    return next(new NotFoundError(`Style not found with id ${req.params.id}`));
  }
  res.json(style);
});

// @desc    Update a style
// @route   PUT /api/v1/styles/:id
// @access  Private (TODO: Add auth middleware)
export const updateStyle = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new BadRequestError(`Invalid style ID: ${req.params.id}`));
  }
  const style = await Style.findById(req.params.id);

  if (!style) {
    return next(new NotFoundError(`Style not found with id ${req.params.id}`));
  }

  const { name, category, description } = req.body;
  const oldPublicId = style.cloudinaryPublicId;
  let newImageUploadResult;

  try {
    if (req.file) {
      newImageUploadResult = await uploadImageToCloudinary(req.file.path, 'fashion_styles');
      style.imageUrl = newImageUploadResult.secure_url;
      style.cloudinaryPublicId = newImageUploadResult.public_id;
    }

    style.name = name || style.name;
    style.category = category || style.category;
    style.description = description === undefined ? style.description : description;

    const updatedStyle = await style.save();

    if (req.file && oldPublicId && oldPublicId !== updatedStyle.cloudinaryPublicId) {
      await attemptCloudinaryDelete(oldPublicId);
    }

    res.json(updatedStyle);
  } catch (error) {
    if (newImageUploadResult && newImageUploadResult.public_id) {
      await attemptCloudinaryDelete(newImageUploadResult.public_id);
    }
    return next(error);
  }
});

// @desc    Delete a style
// @route   DELETE /api/v1/styles/:id
// @access  Private (TODO: Add auth middleware)
export const deleteStyle = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new BadRequestError(`Invalid style ID: ${req.params.id}`));
  }
  const style = await Style.findById(req.params.id);

  if (!style) {
    return next(new NotFoundError(`Style not found with id ${req.params.id}`));
  }

  const publicIdToDelete = style.cloudinaryPublicId;

  await Client.updateMany(
    { styles: style._id },
    { $pull: { styles: style._id } }
  );

  await style.deleteOne();

  if (publicIdToDelete) {
    await attemptCloudinaryDelete(publicIdToDelete);
  }

  res.json({ message: 'Style removed successfully' });
});