# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

필지종합조회 — a single-address lookup tool that shows 토지대장(land register) / 건축물대장(building register) /
개별공시지가(officially assessed land price) / 토지이용계획(land-use plan) for one parcel on one page. Full
product spec, screen design, and (important) a dated log of real API findings live in **`planning.md`** at the
repo root — read it before assuming how an external API behaves; sections 8-1 through 8-5 record what was
actually verified by live calls, and several early assumptions there were later found wrong and corrected in a
later-numbered subsection (e.g. 8-5 corrects 8-1's "접합" → the API actually returns "접함").

## Commands

### Frontend (`frontend/`)
```
npm install
npm run dev       # Vite dev server
npm run build     # production build (also the fastest way to typo-check JSX)
npm run preview
```
No test runner or linter is configured in this project yet.

### Backend (`backend/`)
Dependency management is via `uv` (`uv.lock`, `.python-version` present).
```
uv sync
```
```
uv run uvicorn app.main:app --reload --port 8000
```
Only `/api/address/search` and `/api/building` are wired up (see Architecture below) — `/api/land*` and
`/api/coordinates` are deliberately *not* implemented here, since the frontend calls VWorld directly for all
four of those instead (see the JSONP exception below). Don't add a router for any VWorld-backed endpoint
without first checking whether that's still true.

### `backend/api-sample/`
Standalone, throwaway scripts (not imported by `app/`) for poking a real external API directly with plain
`urllib` — used to verify request/response shapes before writing real client code, and to reproduce
prod-only failures locally. Run from `backend/`:
```
python3 api-sample/land-list.py
python3 api-sample/address-search.py
```
All of them load secrets via `api-sample/_common.py`'s `load_env_key(name)`, which reads `backend/.env`
directly — never print or copy API key values out of `.env`; add new keys to `.env`/`.env.example` by name only.

## Architecture

### Two apps, split by which one calls which external API
`frontend/` (React 18 + Vite, plain JS/JSX — no TypeScript, no CSS framework, inline styles) and `backend/`
(FastAPI) are separate projects. Every report section now hits a real external API — there is no mock data
left anywhere in this codebase — but *which* layer makes the call differs per section (see the JSONP
exception below): 토지대장/토지이용계획/공시지가/지도 좌표 go straight from the browser to VWorld; 주소 검색/
건축물대장 go through the backend as originally designed. Keep that split in mind before "fixing" an
inconsistency.

### Backend layers (`backend/app/`)
- `main.py` — the FastAPI app: CORS (`settings.frontend_origin`), a global exception handler that turns any
  `ExternalAPIError` into an `Envelope` error response, and `include_router()` for each router.
- `routers/` — thin HTTP layer. `address.py` calls `clients/juso_client.py` directly and returns
  `Envelope[list[AddressCandidate]]` (a trivial single-call passthrough belongs in the router, not a service).
  `building.py` takes `sigunguCd`/`bjdongCd`/`platGbCd`/`bun`/`ji` as query params (aliased from snake_case,
  same CamelModel convention as everywhere else) and delegates to `services/building_service.py`. There is no
  `coordinates.py` router — it existed briefly but was deleted once Geocoder turned out to be blocked from the
  deployed server same as the other three VWorld APIs (see JSONP exception below); don't re-add it without
  re-confirming Geocoder actually works from wherever this backend is deployed.
- `services/building_service.py` — the one place with real orchestration logic: calls `building_client.get_title()`
  then (if a building exists) `get_floors()`, and combines them via `schemas/building.py`'s `to_building_record()`.
  This is the pattern for "service" — multi-client orchestration goes here, single-client passthroughs go
  straight in the router.
- `clients/` — one module per external API (`land_client.py`, `land_price_client.py`, `land_use_client.py`,
  `juso_client.py`, `building_client.py`, `geocoder_client.py`), each doing the HTTP call + turning the raw
  response into a Pydantic model. `clients/base.py` has the shared `httpx` `get_json()` helper (timeout +
  error wrapping). Changing one API's shape should only ever touch its one client module. Four of these six
  (`land_client.py`, `land_price_client.py`, `land_use_client.py`, `geocoder_client.py`) have **no router
  calling them at all** — they're kept as working reference implementations for if/when the VWorld network
  block gets resolved, not dead code to delete.
- `schemas/` — Pydantic models. `schemas/common.py`'s `CamelModel` is the base for anything that crosses to
  the frontend: fields are written snake_case in Python but serialize as camelCase, deliberately matching the
  shape `frontend/src/data/normalize.js` produces for the VWorld-direct sections — `schemas/building.py`'s
  `BuildingRecord` in particular is defined to come out byte-for-byte identical to what the frontend used to
  hand-build in mocks, so the frontend needs zero transform step for it (see `api/backend.js` below).
  `schemas/envelope.py`'s `Envelope[T]` (`{data, error}`) is the standard response wrapper for every endpoint.
- `errors.py` — converts any external API failure into `ExternalAPIError` with a normalized `status_code` and
  a canned Korean user-facing message (`user_message_for`); raw upstream error text is logged, never returned
  to the client. `vworld_error()` maps VWorld's error-code vocabulary; `generic_error()` is for APIs
  (juso.go.kr, data.go.kr) whose full error taxonomy isn't documented, treated as "not-success = error".
- `config.py` — `pydantic-settings` reading `backend/.env` (`VWORLD_API_KEY`, `BUILDING_API_KEY`,
  `JUSO_API_KEY`, `FRONTEND_ORIGIN`). VWorld's key is shared across 4 of the 6 external APIs; building and
  juso each need their own separately-issued key from a different portal.

### Frontend structure (`frontend/src/`)
- `App.jsx` owns all state. `tabs` is an array of open parcels (the UI lets you keep several addresses open
  as browser-like tabs); each tab independently tracks a `zone`/`land`/`bld`/`price` status
  (`"loading" | "ok" | "empty" | "error"`) plus the normalized data for that section, updated via the local
  `patch(id, partial)` helper. `loadLand`/`loadZone`/`loadPrice`/`loadBuilding` fire the real network calls per
  tab and are reused by both the initial `select()` and each section's retry button. `candidates` (search
  results) is its own piece of state now, populated by `runSearch()` calling the real backend — there is no
  static candidate list anymore.
- `api/backend.js` calls the FastAPI backend (`searchAddress()`, `fetchBuilding()` — only these two); all four
  VWorld-backed things (`fetchLadfrl()`, `fetchLandUse()`, `fetchLandPriceByYears()`, `fetchCoordinates()`) live
  in `api/vworld.js` + `api/jsonp.js` instead (see exception below). `data/normalize.js` turns raw VWorld JSON
  into the view-model each `*Section.jsx` expects — building doesn't need this step since the backend's
  `BuildingRecord` already comes out in that shape (see `schemas/building.py` note above).
  Coordinates (`tab.coords`, `{lat, lng}`) are only ever used as a text label in `PriceSection.jsx` — there's
  no real map widget yet (see below), so a failed geocode is swallowed silently rather than shown as an error.
- `components/*Section.jsx` are presentational, one per report section (`zone`/`land`/`bld`/`price`), matched
  to the pill anchor-nav ids in `App.jsx`'s `SECTION_IDS`. Each one branches on `status` — make sure any new
  status value handles `"empty"` explicitly (a section with no error and no data is a legitimate real-world
  outcome, not just a placeholder for "still loading"); `ZoneSection.jsx` currently has no distinct `"empty"`
  branch, which is a known gap, not an oversight to copy elsewhere.

### The VWorld-direct-from-browser exception (important, read before touching land/zone/price/coordinates)
All four VWorld APIs this app uses — 토지·임야정보 (`ladfrlList`), 개별공시지가 (`getIndvdLandPrice`),
토지이용계획 (`getLandUseAttr`), and Geocoder (`req/address`, used for map coordinates) — are called **directly
from the browser via JSONP** (`frontend/src/api/jsonp.js` + `frontend/src/api/vworld.js`), bypassing the
backend entirely. This is not the general pattern for this app — it's a workaround because the deployed
backend's outbound IP gets blocked by vworld.kr. Geocoder was originally wired through the backend
(`app/routers/coordinates.py`) on the theory that the block was specific to the `ned/data` (국가중점데이터)
path; that router was deleted once a live call from the same deployed-server environment reproduced the exact
same `RemoteDisconnected`/`502` failure on Geocoder's `req/address` path, confirming the block is host-wide,
not path-specific (planning.md 8-7). **If you're tempted to route any vworld.kr call through the backend,
assume it will be blocked too** — the presumption has flipped from "innocent until proven blocked" to
"blocked until proven otherwise" for this host. Address search (juso.go.kr) and 건축물대장 (data.go.kr) are
different hosts entirely and are not known to be blocked, so they go through the backend as originally
intended (`app/routers/address.py`, `app/routers/building.py`).

Quirks specific to this JSONP path, all reproduced empirically (planning.md 8-5, 8-7):
- VWorld's `domain` query param must match **exactly** the domain string registered for that API key — no
  scheme, no port (e.g. `localhost`, not `http://localhost:5173`). If a `Referer` header happens to be present
  on the request, it must also match; a real browser always sends one automatically and it can't be spoofed
  from page JS, so this API key only actually works when the page is served from its registered domain.
  Geocoder is the one exception: it's not a 국가중점데이터-category endpoint, so it answered fine with no
  `domain` param at all in testing — `fetchCoordinates()` still sends one anyway, for consistency with the
  other three calls, not because it's required.
- A successful response is wrapped as `callbackName({...})` with `Content-Type: application/javascript`. An
  *unsuccessful* one (e.g. `INCORRECT_KEY`) comes back as bare, unwrapped JSON despite the same
  `Content-Type` — Chrome's ORB (Cross-Origin Read Blocking) then blocks the script load outright, so failures
  surface as a network error (`net::ERR_BLOCKED_BY_ORB`) rather than a catchable JS error with a message.
- 개별공시지가 cannot be queried per-parcel (PNU) — VWorld only accepts a 법정동 code (`ldCode`) and returns
  every 지목×용도지역 record in that 법정동, with no field narrowing it to one parcel. `normalizePrice()` in
  `normalize.js` averages across records per year for the trend chart and also exposes the raw per-record
  breakdown; the UI must disclose that this is dong-level, not parcel-level, data (already done in
  `PriceSection.jsx`).
- 건축HUB (`apis.data.go.kr`, used by `building_client.py` and `api-sample/building-title.py`/`building-floors.py`)
  silently returns HTTP 200 with an **empty body** if a plain `urllib` request doesn't send an
  `Accept: application/json` header — no error, just nothing (httpx's default `Accept: */*` is fine; this only
  bit the standalone `api-sample` scripts, which use bare `urllib`). Also: `getBrTitleInfo`/`getBrFlrOulnInfo`
  return numeric fields (`platArea`, `bcRat`, `grndFlrCnt`, `area`, ...) as real JSON numbers, not strings as
  originally assumed — `schemas/building.py` declares them `float`/`int` (not `str`) for exactly this reason;
  don't revert that without re-checking a live response.
- 건축HUB also occasionally fails with a generic connection error that clears up on a bare retry — that's
  upstream flakiness, not a bug here.

### Identifiers
`pnu` (19 digits) = 법정동코드(10) + 산여부(1: 0=대지/1=산) + 본번(4) + 부번(4). `ldCode` (법정동코드, used by
the land-price API) is simply `pnu.slice(0, 10)` — see `ldCodeFromPnu()` in `frontend/src/api/vworld.js`.
건축HUB identifies buildings differently: `sigunguCd` (앞 5 of the 법정동코드) + `bjdongCd` (뒤 5) +
`platGbCd`/`bun`/`ji`. `schemas/address.py`'s `to_candidate()` derives *both* identifier schemes from one
juso.go.kr response (`admCd`/`mtYn`/`lnbrMnnm`/`lnbrSlno`) into a single `AddressCandidate` — that's the one
place this derivation happens; the frontend never re-derives it.

## Environment files
Both `backend/.env` and `frontend/.env` are gitignored; `.env.example` in each directory is the template.
`frontend/.env`'s `VITE_`-prefixed values are inlined into the built JS bundle and visible to any visitor —
that's expected/accepted for `VITE_VWORLD_API_KEY` given the domain-lock behavior above, not a bug to fix.
