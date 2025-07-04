import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Fashion Designer API',
    version: '1.0.0',
    description:
      'API documentation for the Fashion Designer Web Application - Phase 1. ' +
      'This API allows fashion designers to manage clients, measurements, and style inspirations.',
    contact: {
      name: 'Altair-Attic Support',
      // url: 'https://altair-attic.com', // Replace with actual contact/support URL
      // email: 'support@altair-attic.com', // Replace with actual email
    },
  },
  // servers: [
  //   {
  //     url: `http://localhost:${process.env.PORT || 5000}/api/v1`,
  //     description: 'Development server',
  //   },
  //   // TODO: Add production server URL once deployed
  //   // {
  //   //   url: 'https://your-production-api-url.com/api/v1',
  //   //   description: 'Production server',
  //   // },
  // ],
  components: {
    securitySchemes: { // Keeping securitySchemes for now, as it's small and standard
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT Bearer token in the format: Bearer {token}',
      },
    },
    // schemas: {
    //   // User Schemas
    //   // User: {
    //   //   type: 'object',
    //   //   properties: {
    //   //     _id: { type: 'string', example: '60d0fe4f5311236168a109ca' },
    //   //     name: { type: 'string', example: 'John Doe' },
    //   //     email: { type: 'string', example: 'john.doe@example.com' },
    //   //     isAdmin: { type: 'boolean', example: false },
    //   //     createdAt: { type: 'string', format: 'date-time' },
    //   //     updatedAt: { type: 'string', format: 'date-time' },
    //   //   },
    //   // },
    //   // UserRegisterInput: {
    //   //   type: 'object',
    //   //   required: ['name', 'email', 'password'],
    //   //   properties: {
    //   //     name: { type: 'string', example: 'Jane Doe' },
    //   //     email: { type: 'string', example: 'jane.doe@example.com' },
    //   //     password: { type: 'string', example: 'password123', format: 'password' },
    //   //     isAdmin: { type: 'boolean', example: false, description: 'Optional, defaults to false.' },
    //   //   },
    //   // },
    //   // UserLoginInput: {
    //   //   type: 'object',
    //   //   required: ['email', 'password'],
    //   //   properties: {
    //   //     email: { type: 'string', example: 'jane.doe@example.com' },
    //   //     password: { type: 'string', example: 'password123', format: 'password' },
    //   //   },
    //   // },
    //   // AuthResponse: {
    //   //   type: 'object',
    //   //   properties: {
    //   //     _id: { type: 'string', example: '60d0fe4f5311236168a109ca' },
    //   //     name: { type: 'string', example: 'Jane Doe' },
    //   //     email: { type: 'string', example: 'jane.doe@example.com' },
    //   //     isAdmin: { type: 'boolean', example: false },
    //   //     token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
    //   //   },
    //   // },
    //   // UserProfileUpdateInput: {
    //   //   type: 'object',
    //   //   properties: {
    //   //       name: { type: 'string', example: 'Jane Doe Updated', description: 'Optional new name' },
    //   //       email: { type: 'string', example: 'jane.doe.updated@example.com', description: 'Optional new email' },
    //   //       password: { type: 'string', example: 'newPassword123', format: 'password', description: 'Optional new password' },
    //   //   },
    //   // },
    //   // // Measurement Schema (reusable for Client)
    //   // Measurement: {
    //   //   type: 'object',
    //   //   required: ['name', 'value'],
    //   //   properties: {
    //   //     name: { type: 'string', example: 'Bust' },
    //   //     value: { type: 'string', example: '34 inches' },
    //   //   },
    //   // },
    //   // // Client Schemas
    //   // Client: {
    //   //   type: 'object',
    //   //   properties: {
    //   //     _id: { type: 'string', example: '60d0fe4f5311236168a109cb' },
    //   //     name: { type: 'string', example: 'Alice Wonderland' },
    //   //     phone: { type: 'string', example: '123-456-7890' },
    //   //     email: { type: 'string', example: 'alice@example.com', nullable: true },
    //   //     eventType: { type: 'string', example: 'Birthday Party', nullable: true },
    //   //     measurements: {
    //   //       type: 'array',
    //   //       items: { $ref: '#/components/schemas/Measurement' },
    //   //     },
    //   //     styles: {
    //   //       type: 'array',
    //   //       items: { type: 'string', example: '60d0fe4f5311236168a109cc' },
    //   //       description: 'Array of Style IDs linked to this client.',
    //   //     },
    //   //     createdAt: { type: 'string', format: 'date-time' },
    //   //     updatedAt: { type: 'string', format: 'date-time' },
    //   //   },
    //   // },
    //   // ClientInput: {
    //   //   type: 'object',
    //   //   required: ['name', 'phone'],
    //   //   properties: {
    //   //     name: { type: 'string', example: 'Alice Wonderland' },
    //   //     phone: { type: 'string', example: '123-456-7890' },
    //   //     email: { type: 'string', example: 'alice@example.com', nullable: true },
    //   //     eventType: { type: 'string', example: 'Birthday Party', nullable: true },
    //   //     measurements: {
    //   //       type: 'array',
    //   //       items: { $ref: '#/components/schemas/Measurement' },
    //   //       example: [{ name: 'Bust', value: '34 inches' }, { name: 'Waist', value: '28 inches' }],
    //   //     },
    //   //   },
    //   // },
    //   // LinkStyleToClientInput: {
    //   //   type: 'object',
    //   //   required: ['styleId'],
    //   //   properties: {
    //   //       styleId: { type: 'string', example: '60d0fe4f5311236168a109cc', description: 'The ID of the style to link.'}
    //   //   }
    //   // },
    //   // // Style Schemas
    //   // Style: {
    //   //   type: 'object',
    //   //   properties: {
    //   //     _id: { type: 'string', example: '60d0fe4f5311236168a109cc' },
    //   //     name: { type: 'string', example: 'Summer Breeze Dress' },
    //   //     category: { type: 'string', example: 'Casual', enum: ['Traditional', 'Wedding', 'Casual', 'Corporate', 'Evening Wear', 'Other'] },
    //   //     imageUrl: { type: 'string', example: 'https://res.cloudinary.com/demo/image/upload/sample.jpg' },
    //   //     cloudinaryPublicId: { type: 'string', example: 'sample' },
    //   //     description: { type: 'string', example: 'A light and airy summer dress.', nullable: true },
    //   //     clients: {
    //   //       type: 'array',
    //   //       items: { type: 'string', example: '60d0fe4f5311236168a109cb' },
    //   //       description: 'Array of Client IDs this style is linked to (less common for this app, but possible).',
    //   //     },
    //   //     createdAt: { type: 'string', format: 'date-time' },
    //   //     updatedAt: { type: 'string', format: 'date-time' },
    //   //   },
    //   // },
    //   // StyleInput: { // For multipart/form-data, actual schema def might be slightly different in JSDoc
    //   //   type: 'object',
    //   //   required: ['name', 'category', 'styleImage'],
    //   //   properties: {
    //   //     name: { type: 'string', example: 'Summer Breeze Dress' },
    //   //     category: { type: 'string', example: 'Casual', enum: ['Traditional', 'Wedding', 'Casual', 'Corporate', 'Evening Wear', 'Other'] },
    //   //     description: { type: 'string', example: 'A light and airy summer dress.', nullable: true },
    //   //     styleImage: {
    //   //       type: 'string',
    //   //       format: 'binary',
    //   //       description: 'The image file for the style.',
    //   //     },
    //   //   },
    //   // },
    //   //  StyleUpdateInput: { // For multipart/form-data, actual schema def might be slightly different in JSDoc
    //   //   type: 'object',
    //   //   properties: {
    //   //     name: { type: 'string', example: 'Summer Breeze Dress V2' },
    //   //     category: { type: 'string', example: 'Casual', enum: ['Traditional', 'Wedding', 'Casual', 'Corporate', 'Evening Wear', 'Other'] },
    //   //     description: { type: 'string', example: 'An updated light and airy summer dress.', nullable: true },
    //   //     styleImage: {
    //   //       type: 'string',
    //   //       format: 'binary',
    //   //       description: 'Optional: New image file to replace the existing one.',
    //   //     },
    //   //   },
    //   // },
    //   // // Admin Schemas
    //   // AdminStats: {
    //   //   type: 'object',
    //   //   properties: {
    //   //       users: { type: 'integer', example: 10 },
    //   //       clients: { type: 'integer', example: 25 },
    //   //       styles: { type: 'integer', example: 50 },
    //   //       message: { type: 'string', example: 'Admin dashboard data - more features to come in future phases.'}
    //   //   }
    //   // },
    //   // // General Error Schema
    //   // ErrorResponse: {
    //   //   type: 'object',
    //   //   properties: {
    //   //     message: { type: 'string', example: 'Error message describing the issue.' },
    //   //     // You could add more properties like errorCode, details, etc.
    //   //   },
    //   // },
    // // }, // End of commented out schemas
  },
  // security: [ // Global security, can be overridden at path/operation level
  //   {
  //     bearerAuth: [],
  //   },
  // ],
};

const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions (JSDoc comments)
  apis: ['./src/routes/adminRoutes.js'], // Temporarily isolating adminRoutes.js
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
