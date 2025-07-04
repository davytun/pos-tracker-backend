import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';

// Import routes
import clientRoutes from './routes/clientRoutes.js';
import styleRoutes from './routes/styleRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
// import swaggerUi from 'swagger-ui-express'; // Temporarily commented out
// import swaggerSpec from './config/swaggerConfig.js'; // Temporarily commented out
import errorHandlerMiddleware from './middleware/errorHandlerMiddleware.js';

// Load env vars
dotenv.config(); // Call once at the top

// Connect to database
connectDB();

const app = express();

app.set('trust proxy', 1); // Trust first proxy for X-Forwarded-For

// Set security HTTP headers
app.use(helmet());

// Body parser - explicitly setting types
app.use(express.json({ type: 'application/json' }));
app.use(express.urlencoded({ extended: true, type: 'application/x-www-form-urlencoded' }));

// Enable CORS
const corsOptions = {
  origin: 'https://fittingz-frontend.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight requests

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', limiter);

// Mount core routers
app.use('/api/v1/clients', clientRoutes); // Temporarily commented out
app.use('/api/v1/styles', styleRoutes); // Temporarily commented out
app.use('/api/v1/auth', authRoutes); // Temporarily commented out
app.use('/api/v1/admin', adminRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Swagger UI setup - Temporarily commented out
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Global error handler - should be the LAST middleware
app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app; // For testing purposes if needed
