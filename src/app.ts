import express from 'express';
import { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // Note: cookie-parser does not have a default export in @types/cookie-parser
// import { loggingMiddleware } from './middleware/logging.middleware'; // Will add later
import { errorMiddleware } from './middleware/error.middleware';
import routes from './routes';

const app = express();

// Security headers (first, before anything else)
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

// CORS middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Use environment variable for frontend URL
  credentials: true,
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/v1', routes); // Use the main router under /api/v1

// Basic health check endpoint
app.get('/', (_req: Request, res: Response) => {
  res.send('CV Analyzer API is running...');
});

// Error handler (MUST be last)
app.use(errorMiddleware);

export default app;