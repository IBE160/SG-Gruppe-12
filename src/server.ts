import 'dotenv/config';
import * as Sentry from '@sentry/node';
import app from './app';
import './jobs/cv-parsing.job'; // Import the job processor to start it

// Sentry Initialization for Performance Monitoring
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1, // Capture 10% of transactions for performance
  });
}

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});