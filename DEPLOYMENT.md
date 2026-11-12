# MarketConnect deployment

## Architecture
React/Vite frontend and Node/Express API are served together by the Node process. A static-only hosting configuration will not run the API, authentication, or database access. Use a Node-compatible hosting service, or deploy the backend separately.

## Required environment variables
- `DATABASE_URL`: a reachable PostgreSQL connection string (the existing code uses Neon serverless).
- `JWT_SECRET`: a long, randomly generated signing secret.
- `PORT`: set by the hosting provider; defaults to 5000.
- `RESEND_API_KEY`: optional, required for the configured email integration.

Do not commit `.env` files. Copy `.env.example` to `.env` for local development and supply actual values securely.

## Commands
Use Node.js 22.x and npm. From the project root:

```sh
npm ci
npm run check
npm run build
npm start
```

Host settings: build `npm ci && npm run build`; start `npm start`; health check `/health`; output served by Express at the assigned `PORT`. Do not configure `dist/public` as a standalone static deployment unless API is hosted separately.

## Database and files
Run `npm run db:push` against your intended database when appropriate, after backing up any existing data. The application writes to `uploads/`, which is ephemeral on many hosts; configure persistent disk or object storage before accepting production uploads.

## Validation caveat
Dependency installation and production build could not be completed in the preparation environment due to npm installation timeout. Run the commands above on a machine or CI environment with registry access before considering the deployment verified.
