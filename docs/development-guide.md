# Development Guide

This guide provides instructions for setting up and running the "AI CV and Application" project locally. The project is a multi-part application with a separate frontend and backend.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- A running [PostgreSQL](https://www.postgresql.org/) database instance.

## Backend Setup (`src/`)

The backend is an Express.js application located in the project root and the `src/` directory.

1.  **Navigate to the project root directory:**
    ```bash
    cd C:\Users\kayle\Desktop\SG-Gruppe-12
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    - Create a `.env` file in the project root.
    - Add the necessary environment variables for the database connection and server port. Example:
      ```
      PORT=3000
      DB_USER=your_db_user
      DB_HOST=localhost
      DB_DATABASE=your_db_name
      DB_PASSWORD=your_db_password
      DB_PORT=5432
      ```

4.  **Running the server:**
    - **For development (with auto-reloading):**
      ```bash
      npm run dev
      ```
    - **For production:**
      ```bash
      npm run start
      ```

The backend server will be running on the port specified in your `.env` file (e.g., `http://localhost:3000`).

## Frontend Setup (`frontend/`)

The frontend is a Next.js application located in the `frontend/` directory.

1.  **Navigate to the frontend directory:**
    ```bash
    cd C:\Users\kayle\Desktop\SG-Gruppe-12\frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Running the development server:**
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:3001` (or another port if 3000 is in use by the backend).

4.  **Other useful scripts:**
    - **Build for production:**
      ```bash
      npm run build
      ```
    - **Run production build:**
      ```bash
      npm run start
      ```
    - **Lint files:**
      ```bash
      npm run lint
      ```
    - **Check TypeScript types:**
      ```bash
      npm run type-check
      ```
