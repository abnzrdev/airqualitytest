# Air Quality Dashboard

React + Vite single-page app that visualizes air-quality readings on a map-driven dashboard. The project currently renders Leaflet-based maps, stat bars, historical trends, and a table from simulated data while keeping the door open for a Postgres-backed API (see `lib/db` and `lib/data-access`).

## Quick start
- Prerequisites: Node >= 16 and npm.
- Install dependencies: `npm install`.
- Run development server (with hot reload): `npm run dev`.
- Lint: `npm run lint`.
- Build for production: `npm run build`.
- Preview the production build locally: `npm run preview`.

## Environment
Create a `.env.local` file and keep it out of version control. The Vite client only reads env vars that start with `VITE_`, but the database helpers in `lib/db` look for a `DATABASE_URL` as well.

```
VITE_GOOGLE_MAPS_API_KEY=your-browser-key
DATABASE_URL=postgresql://aquser:change-me@localhost:5433/airquality
PGPOOL_MAX=10
PGSSLMODE=require
```

You can also tune `PGPOOL_MAX` (default 10) or set `PGSSLMODE=require` when connecting to managed Postgres instances.

## Tech stack
- **Vite + React**: Fast single-page experience; `src/App.jsx` manages hash-aware navigation without a router.
- **Leaflet + react-leaflet**: Map panels in `HomePage` and `air-quality-map.tsx` that do not load Google Maps.
- **Tailwind + PostCSS**: Styling via `tailwind.config.js` and `postcss.config.js`.
- **pg driver**: Direct Postgres access in `lib/db`, kept lightweight so future APIs can reuse the same helper.

## Data access & database helpers
- `lib/db/index.ts` keeps a `pg` pool that honors `DATABASE_URL`, `PGPOOL_MAX`, and `PGSSLMODE` while providing query helpers and a migration runner.
- `lib/data-access.ts` exposes the SQL that fetches sensor metadata plus most recent readings so the UI keeps working when a real API replaces the simulated data.
- `migrations/001_create_readings.sql` defines the `readings` table and supporting indexes referenced by the helpers.
- `scripts/setup_db.sh` can provision Postgres for you: it optionally starts a Docker container (`aq-postgres` by default), applies the SQL migration, and prints the `DATABASE_URL` to drop back into `.env.local`.
- Use `scripts/check_db.sh` to confirm the connection string in `.env.local` actually reaches Postgres.
- If you rotate credentials, `scripts/change_db_password.sh` updates the Docker or host Postgres user and rewrites the `DATABASE_URL` in `.env.local` with URL-encoded values.

## Deploying & Docker
When handing this repo to someone else for deployment, share these steps:

1. **Share the repo and env values.** Ask the recipient to clone the repo, copy `.env.local` locally (never commit it), and set `VITE_GOOGLE_MAPS_API_KEY` plus a working `DATABASE_URL`. Mention `PGPOOL_MAX` and `PGSSLMODE` if the target database requires them.
2. **Provision the database.** Point them to `scripts/setup_db.sh`—it can launch Postgres inside Docker, apply `migrations/001_create_readings.sql`, and echo the connection string. They can also use an existing Postgres instance, just make sure `DATABASE_URL` matches.
3. **Run the app.** After `npm install`, run `npm run dev` for local testing or `npm run build` for production artifacts. Host the `dist` folder on any static server (Netlify, Vercel, Cloudflare) or inside a container that serves the built files.
4. **Optional Docker deployment.** You can serve the front end from a Docker image (build with `npm run build` and serve `dist` with `nginx`, `http-server`, etc.) and connect it to the Postgres container started by `scripts/setup_db.sh` by sharing the same `DATABASE_URL`.

Document these points when sharing the GitHub repo so the next person knows how to install, wire the env vars, bring up Postgres via Docker (or supply their own), and run the usual Vite commands.
