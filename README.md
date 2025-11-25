# AI CV & Job Application Assistant Monorepo

This monorepo contains the `frontend` and `backend` (src) applications for the AI CV & Job Application Assistant.

## Project Structure

- `frontend/`: Next.js application for the user interface.
- `src/`: Node.js/Express.js application for the backend API.
- `docs/`: Project documentation, architecture, and sprint artifacts.
- `.github/workflows/`: GitHub Actions for CI/CD.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher) or Yarn / pnpm (if preferred)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-org/ai-cv-app.git
    cd ai-cv-app
    ```

2.  **Install root dependencies:**
    ```bash
    npm install
    ```
    This will install dependencies for both `frontend` and `src` workspaces.

### Running the Applications

You can run the frontend and backend applications separately or together using the root `package.json` scripts:

-   **Start Backend (src/):**
    ```bash
    npm run start --workspace src
    # or from root: npm run start
    ```

-   **Start Frontend (frontend/):**
    ```bash
    npm run dev --workspace frontend
    # or from root: npm run dev
    ```

-   **Run both (simultaneously):**
    ```bash
    npm run dev
    ```

### Building

```bash
npm run build
```

### Testing

```bash
npm run test
```

### Linting

```bash
npm run lint
```

## Documentation

Refer to the `docs/` directory for detailed project documentation, including architectural specifications, PRD, and UX design.

## CI/CD

Continuous Integration is configured via GitHub Actions in `.github/workflows/ci.yml`.
