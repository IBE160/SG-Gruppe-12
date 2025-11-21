# Backend API Contracts

This document outlines the API endpoints for the backend service. The analysis was performed on the `src` directory.

## API Endpoints

The current implementation has a very limited set of API routes.

### Root

- **`GET /`**
  - **Description:** A basic health-check endpoint to confirm that the API is running.
  - **Controller:** Inline function in `src/app.js`.
  - **Request Body:** None.
  - **Response:**
    - `200 OK`: with the text `CV Analyzer API is running...`.

*Note: No other business-logic routes were found in `src/routes` or `src/app.js`.*
