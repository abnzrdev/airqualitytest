# Air Quality Dashboard

React + Vite single-page app that visualizes air-quality readings on Google Maps and a localized dashboard. The map loads once via `@react-google-maps/api`; the Home view shows current stats, trends, and selectable locations.

## Quick start
- Prerequisites: Node >= 16, npm.
- Install deps: `npm install`
- Run dev server: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build`
- Preview built site: `npm run preview`

## Environment
Create `.env.local` (not committed). Vite client vars must start with `VITE_`.

```
VITE_GOOGLE_MAPS_API_KEY=your-public-browser-key
VITE_SUPABASE_URL=https://xyz.supabase.co
VITE_SUPABASE_ANON_KEY=public-anon-key
```

The app currently hardcodes a maps key in [src/App.jsx](src/App.jsx); swap it to `import.meta.env.VITE_GOOGLE_MAPS_API_KEY` when you add a real key.

## App layout
- [src/App.jsx](src/App.jsx): Loads the Maps script once with `useJsApiLoader`, manages `activePage`, and coordinates hash-based navigation with the sticky NavBar.
- [src/components/HomePage.jsx](src/components/HomePage.jsx): Renders the GoogleMap, InfoWindow, StatBar, HistoricalTrend, and the data table. It keeps a `ResizeObserver` to re-trigger map resize events.
- [src/components/NavBar.jsx](src/components/NavBar.jsx): Hash-based navigation; updates `activePage` without a router.
- [src/components/MapPage.jsx](src/components/MapPage.jsx): Standalone map example; avoid loading it alongside `useJsApiLoader` to prevent duplicate script loads.

## Data flow
- Air-quality data is simulated via `fetchAirQuality` and `almatyLocations` inside [src/components/HomePage.jsx](src/components/HomePage.jsx). Replace that fetcher with a real API while keeping the `dashboardData` shape and InfoWindow structure so charts and labels continue working.
- Map resize events are re-fired whenever the container grows; keep that observer when adjusting layout.

## Database helpers
- `scripts/setup_db.sh`: Provisions Postgres (Docker by default) and applies `migrations/001_create_readings.sql`.
- `scripts/check_db.sh`: Verifies connectivity using `.env.local`.
- `scripts/change_db_password.sh`: Rotates Postgres passwords and updates `.env.local` with URL-encoded values.
- `scripts/setup_prisma.sh`: Installs Prisma, refreshes `.env.local`, and runs migrations or `db push` for the `Reading` model defined in [prisma/schema.prisma](prisma/schema.prisma).

## Development tips
- Keep secrets in `.env.local`; never commit keys.
- Run `npm run lint` and `npm run build` before opening a PR.
- Add shared data helpers under `src/lib/` if you wire real backends (e.g., Supabase client).

## License
This project is licensed under the MIT License; see [LICENSE](LICENSE).
