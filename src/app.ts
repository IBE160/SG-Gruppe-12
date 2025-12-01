import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
// import { loggingMiddleware } from './middleware/logging.middleware'; // Will add later
import { errorMiddleware } from './middleware/error.middleware';
import routes from './routes'; // Import the main router

const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    }
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
}));

// Routes
app.use('/api/v1', routes); // Use the main router under /api/v1

// Basic health check endpoint (retained)
app.get('/', (req, res) => {
  res.send('CV Analyzer API is running...');
});

// Error handler (MUST be last)
app.use(errorMiddleware);


export default app;
