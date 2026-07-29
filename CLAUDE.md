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
There is **no FastAPI app entrypoint yet** — `app/routers/` and `app/services/` are empty placeholder packages.
The only implemented backend layer is `app/clients/` (see Architecture below). Don't assume `uvicorn` can be
run until a router/service/main is actually added.

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

### Two independent apps, loosely wired
`frontend/` (React 18 + Vite, plain JS/JSX — no TypeScript, no CSS framework, inline styles) and `backend/`
(FastAPI skeleton) are separate projects. As of now the backend is **not** actually called by the frontend for
land/zone/price data (see the JSONP exception below) and address search / building-register are still fully
mocked in the frontend — only the pieces described in planning.md's "구현 현황" notes and this file are real.

### Backend layers (`backend/app/`)
- `clients/` — one module per external API (`land_client.py`, `land_price_client.py`, `land_use_client.py`,
  `juso_client.py`, `building_client.py`, `geocoder_client.py`), each doing the HTTP call + turning the raw
  response into a Pydantic model. `clients/base.py` has the shared `httpx` `get_json()` helper (timeout +
  error wrapping). Changing one API's shape should only ever touch its one client module.
- `schemas/` — Pydantic models. `schemas/common.py`'s `CamelModel` is the base for anything that crosses to
  the frontend: fields are written snake_case in Python but serialize as camelCase, deliberately matching the
  shape `frontend/src/data/normalize.js` already produces from mocks. `schemas/envelope.py`'s `Envelope[T]`
  (`{data, error}`) is the intended standard response wrapper for every future endpoint.
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
  `patch(id, partial)` helper. `loadLand`/`loadZone`/`loadPrice` fire the real network calls per tab and are
  reused by both the initial `select()` and each section's retry button.
- `data/normalize.js` turns raw external-API JSON into the exact view-model shape each `*Section.jsx` expects.
  `data/apiFixtures.js` still holds mock data, but only for 건축물대장 (building register) — everything else
  it used to mock was deleted once real calls replaced it.
- `components/*Section.jsx` are presentational, one per report section (`zone`/`land`/`bld`/`price`), matched
  to the pill anchor-nav ids in `App.jsx`'s `SECTION_IDS`.

### The VWorld-direct-from-browser exception (important, read before touching land/zone/price)
Three VWorld "국가중점데이터" APIs — 토지·임야정보 (`ladfrlList`), 개별공시지가 (`getIndvdLandPrice`),
토지이용계획 (`getLandUseAttr`) — are called **directly from the browser via JSONP**
(`frontend/src/api/jsonp.js` + `frontend/src/api/vworld.js`), bypassing the backend entirely. This is not the
general pattern for this app — it's a workaround because the deployed backend's outbound IP gets blocked by
vworld.kr (see planning.md 7章 "예외" and 8-5). Address search (juso.go.kr) and 건축물대장 (data.go.kr) are a
different host each and are not known to be blocked, so they're designed to go through the backend as
originally intended — don't extend the JSONP pattern to them without a confirmed reason.

Quirks specific to this JSONP path, all reproduced empirically (planning.md 8-5):
- VWorld's `domain` query param must match **exactly** the domain string registered for that API key — no
  scheme, no port (e.g. `localhost`, not `http://localhost:5173`). If a `Referer` header happens to be present
  on the request, it must also match; a real browser always sends one automatically and it can't be spoofed
  from page JS, so this API key only actually works when the page is served from its registered domain.
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
  silently returns HTTP 200 with an **empty body** if the request doesn't send an `Accept: application/json`
  header — no error, just nothing. Always set that header when calling it directly.

### Identifiers
`pnu` (19 digits) = 법정동코드(10) + 산여부(1: 0=대지/1=산) + 본번(4) + 부번(4). `ldCode` (법정동코드, used by
the land-price API) is simply `pnu.slice(0, 10)` — see `ldCodeFromPnu()` in `frontend/src/api/vworld.js`.
건축HUB identifies buildings differently: `sigunguCd` (앞 5 of the 법정동코드) + `bjdongCd` (뒤 5) +
`platGbCd`/`bun`/`ji` (derived from 도로명주소 API's `mtYn`/`lnbrMnnm`/`lnbrSlno`), not `pnu`.

## Environment files
Both `backend/.env` and `frontend/.env` are gitignored; `.env.example` in each directory is the template.
`frontend/.env`'s `VITE_`-prefixed values are inlined into the built JS bundle and visible to any visitor —
that's expected/accepted for `VITE_VWORLD_API_KEY` given the domain-lock behavior above, not a bug to fix.
