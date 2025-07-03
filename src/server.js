import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit'; // Import rate-limit
import connectDB from './config/db.js';
// Import routes
import clientRoutes from './routes/clientRoutes.js';
import styleRoutes from './routes/styleRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js'; // Import admin routes

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

app.set('trust proxy', 1); // Trust first proxy for X-Forwarded-For

// Set security HTTP headers
app.use(helmet());

// Body parser - Using defaults
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS - Configure properly for production
app.use(cors()); // For now, open. In prod, specify origins: app.use(cors({ origin: process.env.FRONTEND_URL }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', limiter); // Apply to all routes starting with /api

// Mount routers
app.use('/api/v1/clients', clientRoutes);
app.use('/api/v1/styles', styleRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes); // Mount admin routes

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swaggerConfig.js';

// Basic route for testing
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Swagger UI setup
import errorHandlerMiddleware from './middleware/errorHandlerMiddleware.js';

// Serve Swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Global error handler - should be the last middleware
app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app; // For testing purposes if needed
