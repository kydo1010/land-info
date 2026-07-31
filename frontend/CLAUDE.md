# CLAUDE.md (frontend/)

Frontend-specific conventions for `frontend/src/`. See the root `CLAUDE.md` for the project overview, commands,
the frontend/backend API split, the VWorld-direct-from-browser exception, and identifier formats — all of
which apply here too.

### Frontend structure (`frontend/src/`)
- `App.jsx` owns all state. `tabs` is an array of open parcels (the UI lets you keep several addresses open
  as browser-like tabs); each tab independently tracks a `zone`/`land`/`bld`/`price` status
  (`"loading" | "ok" | "empty" | "error"`) plus the normalized data for that section, updated via the local
  `patch(id, partial)` helper. `loadLand`/`loadZone`/`loadPrice`/`loadBuilding` fire the real network calls per
  tab and are reused by both the initial `select()` and each section's retry button. `candidates` (search
  results) is its own piece of state now, populated by `runSearch()` calling `api/search.js`'s hybrid
  `searchAddress()` — there is no static candidate list anymore.
- `api/backend.js` calls the FastAPI backend (`searchAddress()`, `fetchBuilding()`); `api/vworld.js` +
  `api/jsonp.js` call VWorld directly (see the root CLAUDE.md's JSONP exception) — `fetchLadfrl()`, `fetchLandUse()`,
  `fetchLandPriceHistory()`, `fetchCoordinates()`, and (since 2026-07-31, planning.md 8-9) its own
  `searchAddress()` for VWorld search 2.0. `App.jsx` never imports either `searchAddress` directly — it goes
  through `api/search.js`, which calls both in parallel and merges by `pnu` (juso.go.kr's result wins when the
  same parcel comes back from both; for VWorld-only parcels, `vworld.js`'s `refineParcelIdentifiers()`
  re-derives the identifiers via Geocoder before they're used — see the root CLAUDE.md's JSONP exception for why).
  `data/normalize.js` turns raw VWorld JSON
  into the view-model each `*Section.jsx` expects — building doesn't need this step since the backend's
  `BuildingRecord` already comes out in that shape (see `schemas/building.py` note in `backend/CLAUDE.md`).
  Coordinates (`tab.coords`, `{lat, lng}`) feed `components/ParcelMap.jsx` (Leaflet/`react-leaflet`, OpenStreetMap
  tiles) in `PriceSection.jsx`; a failed geocode is swallowed silently (map falls back to a "확인 중" placeholder)
  rather than shown as an error, since it's a secondary display, not one of the 4 report sections.
- `components/*Section.jsx` are presentational, one per report section (`zone`/`land`/`bld`/`price`), matched
  to the pill anchor-nav ids in `App.jsx`'s `SECTION_IDS`. Each one branches on `status` — make sure any new
  status value handles `"empty"` explicitly (a section with no error and no data is a legitimate real-world
  outcome, not just a placeholder for "still loading"); `ZoneSection.jsx` currently has no distinct `"empty"`
  branch, which is a known gap, not an oversight to copy elsewhere.
