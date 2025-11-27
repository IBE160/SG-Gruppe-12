import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as Sentry from '@sentry/node'; // Import Sentry
// import { loggingMiddleware } from './middleware/logging.middleware'; // Will add later
import { errorMiddleware } from './middleware/error.middleware';
import routes from './routes'; // Import the main router

const app = express();

// Sentry: The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());

// Security headers
app.use(helmet({
// ... (rest of the file)
// Routes
app.use('/api/v1', routes); // Use the main router under /api/v1

// Basic health check endpoint (retained)
app.get('/', (req, res) => {
  res.send('CV Analyzer API is running...');
});

// Sentry: The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

// Error handler (MUST be last)
app.use(errorMiddleware);


export default app;
