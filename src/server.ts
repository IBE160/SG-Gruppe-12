import 'dotenv/config';
import * as Sentry from '@sentry/node';
import { prisma } from './config/database'; // Import prisma client
import app from './app';
import './jobs/cv-parsing.job'; // Import the CV parsing job processor to start it
import './jobs/document-generation.job'; // Import the document generation job processor to start it

// Sentry Initialization for Performance Monitoring
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleSample: 0.1, // Capture 10% of transactions for performance
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Prisma({ client: prisma }),
  ],
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});