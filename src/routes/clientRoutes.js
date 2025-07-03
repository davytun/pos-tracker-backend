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
import protect from '../middleware/authMiddleware.js';
import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../middleware/validationResultHandler.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 * name: Clients
 * description: Client management and measurements
 */

/**
 * @swagger
 * /clients:
 * post:
 * summary: Create a new client
 * tags: [Clients]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ClientInput'
 * responses:
 * 201:
 * description: Client created successfully
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Client'
 * 400:
 * description: Invalid input or validation error (e.g., missing name/phone)
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ErrorResponse'
 * 401:
 * description: Not authorized
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ErrorResponse'
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ErrorResponse'
 * get:
 * summary: Get all clients
 * tags: [Clients]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: query
 * name: name
 * schema:
 * type: string
 * description: Filter clients by name (case-insensitive, partial match)
 * - in: query
 * name: eventType
 * schema:
 * type: string
 * description: Filter clients by event type (case-insensitive, partial match)
 * responses:
 * 200:
 * description: A list of clients
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Client'
 * 401:
 * description: Not authorized
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ErrorResponse'
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ErrorResponse'
 */
router.route('/')
  .post(
    protect,
    [
      body('name').trim().notEmpty().withMessage('Client name is required.')
        .isLength({ min: 2 }).withMessage('Client name must be at least 2 characters.')
        .escape(),
      body('phone').notEmpty().withMessage('Phone number is required.')
        .isString().withMessage('Phone number must be a string.')
        .escape(), // Phone numbers are usually digits/simple chars, but escape for safety
      body('email').optional({ checkFalsy: true }).isEmail().withMessage('Provide a valid email address.').normalizeEmail(),
      body('eventType').optional().isString().trim().escape(),
      body('measurements').optional().isArray().withMessage('Measurements must be an array.'),
      body('measurements.*.name').if(body('measurements').exists()).notEmpty().withMessage('Measurement name is required.').trim().escape(),
      body('measurements.*.value').if(body('measurements').exists()).notEmpty().withMessage('Measurement value is required.').trim().escape(),
    ],
    handleValidationErrors,
    createClient
  )
  .get(
    protect,
    [
      query('name').optional().isString().trim(),
      query('eventType').optional().isString().trim(),
    ],
    handleValidationErrors, // Though for GET query params, often direct use in controller is fine too
    getClients
  );

/**
 * @swagger
 * /clients/{id}:
 * get:
 * summary: Get a specific client by ID
 * tags: [Clients]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: The client ID
 * responses:
 * 200:
 * description: Client data
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Client'
 * 401:
 * description: Not authorized
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ErrorResponse'
 * 404:
 * description: Client not found
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ErrorResponse'
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ErrorResponse'
 * put:
 * summary: Update a specific client
 * tags: [Clients]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: The client ID
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ClientInput'
 * responses:
 * 200:
 * description: Client updated successfully
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Client'
 * 400:
 * description: Invalid input or validation error
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ErrorResponse'
 * 401:
 * description: Not authorized
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ErrorResponse'
 * 404:
 * description: Client not found
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ErrorResponse'
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ErrorResponse'
 * delete:
 * summary: Delete a specific client
 * tags: [Clients]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: The client ID
 * responses:
 * 200:
 * description: Client removed successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * example: Client removed
 * 401:
 * description: Not authorized
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ErrorResponse'
 * 404:
 * description: Client not found
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ErrorResponse'
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ErrorResponse'
 */
router.route('/:id')
  .get(
    protect,
    [
      param('id').isMongoId().withMessage('Invalid client ID format.'),
    ],
    handleValidationErrors,
    getClientById
  )
  .put(
    protect,
    [
      param('id').isMongoId().withMessage('Invalid client ID format.'),
      body('name').optional().trim().notEmpty().withMessage('Client name cannot be empty if provided.')
        .isLength({ min: 2 }).withMessage('Client name must be at least 2 characters if provided.')
        .escape(),
      body('phone').optional().notEmpty().withMessage('Phone number cannot be empty if provided.')
        .isString().withMessage('Phone number must be a string.')
        .escape(),
      body('email').optional({ checkFalsy: true }).isEmail().withMessage('Provide a valid email address if updating.').normalizeEmail(),
      body('eventType').optional().isString().trim().escape(),
      body('measurements').optional().isArray().withMessage('Measurements must be an array if provided.'),
      body('measurements.*.name').if(body('measurements').exists()).notEmpty().withMessage('Measurement name is required if measurements are provided.').trim().escape(),
      body('measurements.*.value').if(body('measurements').exists()).notEmpty().withMessage('Measurement value is required if measurements are provided.').trim().escape(),
    ],
    handleValidationErrors,
    updateClient
  )
  .delete(
    protect,
    [
      param('id').isMongoId().withMessage('Invalid client ID format.'),
    ],
    handleValidationErrors,
    deleteClient
  );

/**
 * @swagger
 * /clients/{clientId}/styles:
 * post:
 * summary: Link a style to a client
 * tags: [Clients]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: clientId
 * required: true
 * schema:
 * type: string
 * description: The ID of the client to link the style to
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/LinkStyleToClientInput'
 * responses:
 * 200:
 * description: Style linked successfully, returns the updated client
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Client'
 * 400:
 * description: Style already linked or invalid styleId
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ErrorResponse'
 * 401:
 * description: Not authorized
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ErrorResponse'
 * 404:
 * description: Client or Style not found
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ErrorResponse'
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ErrorResponse'
 * get:
 * summary: Get all styles linked to a specific client
 * tags: [Clients]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: clientId
 * required: true
 * schema:
 * type: string
 * description: The client ID
 * responses:
 * 200:
 * description: A list of styles linked to the client
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Style' # Assumes populated styles
 * 401:
 * description: Not authorized
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ErrorResponse'
 * 404:
 * description: Client not found
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ErrorResponse'
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ErrorResponse'
 */
router.route('/:clientId/styles')
  .post(
    protect,
    [
      param('clientId').isMongoId().withMessage('Invalid client ID format.'),
      body('styleId').notEmpty().withMessage('styleId is required.').isMongoId().withMessage('Invalid style ID format.'),
    ],
    handleValidationErrors,
    linkStyleToClient
  )
  .get(
    protect,
    [
      param('clientId').isMongoId().withMessage('Invalid client ID format.'),
    ],
    handleValidationErrors,
    getClientStyles
  );

export default router;
