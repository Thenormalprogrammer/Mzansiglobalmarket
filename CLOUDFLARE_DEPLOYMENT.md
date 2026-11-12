# MarketConnect — Cloudflare Pages deployment

## Architecture
Cloudflare Pages serves the React/Vite frontend. Pages Functions proxy `/api/*` and `/uploads/*` to an **independently hosted** Node/Express backend over HTTPS. This is NOT a full Cloudflare Workers conversion.

## Cloudflare Pages settings
- Framework preset: Vite
- Root directory: repository root (the directory containing `package.json`)
- Build command: `npm run build:pages`
- Build output directory: `dist/public`
- Node.js: 22 (set `NODE_VERSION=22` if necessary)
- Pages environment variable: `API_ORIGIN=https://YOUR-BACKEND.example.com` (no path; replace placeholder with actual HTTPS origin)
- No database passwords, JWT secrets, or private API keys in `VITE_*` variables.

The `functions/api/[[path]].ts` and `functions/uploads/[[path]].ts` proxy same-origin requests to the Node backend, avoiding cross-origin requests in browser code. `_redirects` supports SPA deep links; Functions take precedence for their matching routes.

## Backend hosting
Deploy the existing Express backend to a Node.js host (e.g. Render or Railway) using `npm run build` and `npm start`. Set `DATABASE_URL`, a strong `JWT_SECRET`, `NODE_ENV=production`, and the platform-provided `PORT`. Ensure database network access and schema migration (`npm run db:push`) are configured before launching. The backend uses local `uploads/` storage: this is NOT durable on ephemeral hosts. Add persistent object storage (Cloudflare R2 or equivalent) before accepting real uploads.

## Local verification
Run `npm ci`, `npm run check`, `npm run build:pages`, and `npm run build` on a network-connected machine. The Cloudflare build is independent of the Express bundle. If dependency resolution fails, refresh the lockfile with `npm install --package-lock-only` and commit the resulting `package-lock.json`; then rerun `npm ci`.

## Important limitations
This archive is prepared for deployment but **not verified to build successfully** in this environment: dependency installation timed out. Backend and database deployment are separate prerequisites. Cloudflare Pages alone will not host this Express server.
