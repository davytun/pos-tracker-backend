import Client from '../models/ClientModel.js';
import Style from '../models/StyleModel.js'; // Needed for validating styleId
import { BadRequestError, NotFoundError, ConflictError } from '../utils/customErrors.js';
import asyncHandler from '../utils/asyncHandler.js';
import mongoose from 'mongoose';


// @desc    Create a new client
// @route   POST /api/v1/clients
// @access  Private
export const createClient = asyncHandler(async (req, res, next) => {
  const { name, phone, email, eventType, measurements } = req.body;

  if (!name || !phone) {
    return next(new BadRequestError('Name and phone are required fields'));
  }

  const client = new Client({
    name,
    phone,
    email,
    eventType,
    measurements,
  });

  const createdClient = await client.save(); // Mongoose validation errors will be caught by global handler
  res.status(201).json(createdClient);
});

// @desc    Get all clients
// @route   GET /api/v1/clients
// @access  Private
export const getClients = asyncHandler(async (req, res, next) => {
  const { name, eventType } = req.query;
  const queryObject = {};

  if (name) {
    queryObject.name = { $regex: name, $options: 'i' };
  }
  if (eventType) {
    queryObject.eventType = { $regex: eventType, $options: 'i' };
  }

  const clients = await Client.find(queryObject).populate('styles');
  res.json(clients);
});

// @desc    Get a single client by ID
// @route   GET /api/v1/clients/:id
// @access  Private
export const getClientById = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new BadRequestError(`Invalid client ID: ${req.params.id}`));
  }
  const client = await Client.findById(req.params.id).populate('styles');

  if (!client) {
    return next(new NotFoundError(`Client not found with id ${req.params.id}`));
  }
  res.json(client);
});

// @desc    Update a client
// @route   PUT /api/v1/clients/:id
// @access  Private
export const updateClient = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new BadRequestError(`Invalid client ID: ${req.params.id}`));
  }
  const client = await Client.findById(req.params.id);

  if (!client) {
    return next(new NotFoundError(`Client not found with id ${req.params.id}`));
  }

  const { name, phone, email, eventType, measurements } = req.body;
  client.name = name || client.name;
  client.phone = phone || client.phone;
  client.email = email === undefined ? client.email : email; // Allow clearing email
  client.eventType = eventType === undefined ? client.eventType : eventType;
  client.measurements = measurements || client.measurements;

  const updatedClient = await client.save();
  res.json(updatedClient);
});

// @desc    Delete a client
// @route   DELETE /api/v1/clients/:id
// @access  Private
export const deleteClient = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new BadRequestError(`Invalid client ID: ${req.params.id}`));
  }
  const client = await Client.findById(req.params.id);

  if (!client) {
    return next(new NotFoundError(`Client not found with id ${req.params.id}`));
  }

  await client.deleteOne();
  res.json({ message: 'Client removed successfully' });
});

// @desc    Link a style to a client
// @route   POST /api/v1/clients/:clientId/styles
// @access  Private
export const linkStyleToClient = asyncHandler(async (req, res, next) => {
  const { clientId } = req.params;
  const { styleId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    return next(new BadRequestError(`Invalid client ID: ${clientId}`));
  }
  if (!styleId || !mongoose.Types.ObjectId.isValid(styleId)) {
    return next(new BadRequestError('Valid styleId is required'));
  }

  const client = await Client.findById(clientId);
  if (!client) {
    return next(new NotFoundError(`Client not found with id ${clientId}`));
  }

  const styleExists = await Style.findById(styleId);
  if (!styleExists) {
      return next(new NotFoundError(`Style not found with id ${styleId}`));
  }

  if (client.styles.map(id => id.toString()).includes(styleId.toString())) {
    return next(new ConflictError('Style already linked to this client'));
  }

  client.styles.push(styleId);
  await client.save();
  // Populate styles after saving to return the full style objects
  const updatedClient = await Client.findById(clientId).populate('styles');
  res.status(200).json(updatedClient);
});

// @desc    Get all styles for a specific client
// @route   GET /api/v1/clients/:clientId/styles
// @access  Private
export const getClientStyles = asyncHandler(async (req, res, next) => {
  const { clientId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    return next(new BadRequestError(`Invalid client ID: ${clientId}`));
  }

  const client = await Client.findById(clientId).populate('styles');

  if (!client) {
    return next(new NotFoundError(`Client not found with id ${clientId}`));
  }
  res.status(200).json(client.styles);
});
