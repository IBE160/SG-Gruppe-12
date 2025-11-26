import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
// import { loggingMiddleware } from './middleware/logging.middleware'; // Will add later
import { errorMiddleware } from './middleware/error.middleware';
import routes from './routes'; // Import the main router

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://cdnjs.cloudflare.com'], // Allow specific CDNs
      styleSrc: ["'self'", "'unsafe-inline'"], // Tailwind CSS requires unsafe-inline
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https:'], // Allow connections to any https
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    }
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
}));

// CORS (allow frontend domain)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Frontend might be on 3000 during dev
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Request logging (will add loggingMiddleware later)
// app.use(loggingMiddleware);

// Routes
app.use('/api/v1', routes); // Use the main router under /api/v1

// Basic health check endpoint (retained)
app.get('/', (req, res) => {
  res.send('CV Analyzer API is running...');
});

// Error handler (MUST be last)
app.use(errorMiddleware);

export default app;
