import express from 'express';
import {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
  linkStyleToClient,
  getClientStyles
} from '../controllers/clientController.js';
import protect from '../middleware/authMiddleware.js'; // Assuming auth middleware is ready

const router = express.Router();

// TODO: Apply 'protect' middleware to all routes once auth is fully implemented
// For now, we'll leave them unprotected for easier initial testing if not using dummy auth

router.route('/')
  .post(protect, createClient)
  .get(protect, getClients);

router.route('/:id')
  .get(protect, getClientById)
  .put(protect, updateClient)
  .delete(protect, deleteClient);

router.route('/:clientId/styles')
  .post(protect, linkStyleToClient)
  .get(protect, getClientStyles);

export default router;
