import * as express from 'express';
import { Request, Response } from 'express';
import helmet from 'helmet';
import * as cors from 'cors';
import cookieParser = require('cookie-parser');
// import { loggingMiddleware } from './middleware/logging.middleware'; // Will add later
import { errorMiddleware } from './middleware/error.middleware';
import routes from './routes';

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

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/v1', routes);

// Basic health check endpoint
app.get('/', (_req: Request, res: Response) => {
  res.send('CV Analyzer API is running...');
});

// Error handler (MUST be last)
app.use(errorMiddleware);

export default app;
