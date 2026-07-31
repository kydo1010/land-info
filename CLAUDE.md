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
exception below): 토지대장/토지이용계획/공시지가/지도 좌표 go straight from the browser to VWorld; 건축물대장
goes through the backend as originally designed. 주소 검색 is a hybrid since 2026-07-31 (planning.md 8-9):
the frontend calls *both* the backend (juso.go.kr) and VWorld search 2.0 directly and merges the results — see
`frontend/src/api/search.js`. Keep that split in mind before "fixing" an inconsistency.

### Backend layers (`backend/app/`)
See `backend/CLAUDE.md` — module-by-module conventions for `main.py`/`routers/`/`services/`/`clients/`/
`schemas/`/`errors.py`/`config.py`.

### Frontend structure (`frontend/src/`)
See `frontend/CLAUDE.md` — `App.jsx` state shape, the `api/` module split, and the `components/*Section.jsx`
status-handling convention.

### The VWorld-direct-from-browser exception (important, read before touching land/zone/price/coordinates/search)
Five VWorld APIs this app uses — 토지·임야정보 (`ladfrlList`), 개별공시지가 (`getIndvdLandPriceAttr`),
토지이용계획 (`getLandUseAttr`), Geocoder (`req/address`, used for map coordinates), and search 2.0
(`req/search`, used for address search) — are called **directly from the browser via JSONP**
(`frontend/src/api/jsonp.js` + `frontend/src/api/vworld.js`), bypassing the backend entirely. This is not the
general pattern for this app — it's a workaround because the deployed backend's outbound IP gets blocked by
vworld.kr. Geocoder was originally wired through the backend (`app/routers/coordinates.py`) on the theory that
the block was specific to the `ned/data` (국가중점데이터) path; that router was deleted once a live call from
the same deployed-server environment reproduced the exact same `RemoteDisconnected`/`502` failure on
Geocoder's `req/address` path, confirming the block is host-wide, not path-specific (planning.md 8-7).
**If you're tempted to route any vworld.kr call through the backend, assume it will be blocked too** — the
presumption has flipped from "innocent until proven blocked" to "blocked until proven otherwise" for this
host. 건축물대장 (data.go.kr) is a different host entirely and is not known to be blocked, so it still goes
through the backend as originally intended (`app/routers/building.py`). Address search (juso.go.kr) is also a
different host and not blocked, but as of 2026-07-31 it's no longer the sole source for search — see below.

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
- Search 2.0 (`req/search`, address search) requires a `category` of `ROAD` or `PARCEL` when `type=address`,
  and each category **only matches queries in its own format** — a 지번-style query ("역삼동 737") only hits
  `category=parcel`, a 도로명-style query ("테헤란로 152") only hits `category=road`; unlike juso.go.kr's
  single `keyword` param, one call doesn't match both. `frontend/src/api/vworld.js`'s `searchAddress()` calls
  both categories in parallel and merges by `id`. Response field asymmetry: a `category=parcel` result's
  `address.parcel` is the full 시/도-inclusive string but `address.road` is partial (no 시/군/구); a
  `category=road` result is the reverse — and a parcel with no assigned road name at all comes back with
  `address.road` as an empty string; `searchAddress()` falls back to `jibun` in that case so `road` is never
  blank downstream. The response's `item.id` **is a fully correct, ready-to-use `pnu`** — use it directly, don't
  reconstruct it from parts (see the Identifiers section below for why an earlier version of this file said
  otherwise).
- 개별공시지가 has TWO VWorld operations that look interchangeable but aren't: `getIndvdLandPrice` (identified
  by `ldCode`, a 법정동 only — cannot be narrowed to one parcel, returns every 지목×용도지역 record in that
  법정동) vs. `getIndvdLandPriceAttr` (identified by `pnu` — genuinely parcel-level, one record per year). This
  app uses **only `getIndvdLandPriceAttr`** (`fetchLandPriceHistory()` in `api/vworld.js`) — don't "fix" it back
  to `getIndvdLandPrice`, that was a dead end already tried and abandoned (planning.md 8-5 → 8-8). Omitting
  `stdrYear` returns the parcel's entire yearly history in one call; the same year can appear more than once
  with identical values (a re-sync artifact, not a real revision) — `normalizePriceRows()` in `normalize.js`
  dedupes by `stdrYear` before handing `[{year, value}]` to `buildChart()`.
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
`pnu` (19 digits) = 법정동코드(10) + **필지구분**(1 digit: `1`=일반, `2`=산) + 본번(4) + 부번(4) — every VWorld
call in this app (land, zone, price, and the `ldCode` implicitly embedded in a `pnu`) is keyed off this one
value; there's no separate ldCode derivation anymore (see the price-API note above). 건축HUB identifies
buildings **differently and with a different code**: `sigunguCd` (앞 5 of the 법정동코드) + `bjdongCd` (뒤 5) +
`platGbCd` (`0`=대지, `1`=산, `2`=블록) + `bun`/`ji`.

**These two digits are NOT the same value** despite both describing 대지-vs-산 — mixing them up was a real,
confirmed bug (2026-07-31, planning.md 8-11) that made every VWorld land/zone/price call for every juso-covered
address return empty results for most of this project's life, without erroring: `pnu`'s digit was built by
reusing juso.go.kr's `mt_yn`/`platGbCd` value (`0`/`1`) directly, but the PNU's own digit needs `1`/`2` — so
every constructed `pnu` was subtly wrong (`...0007370000` instead of the real `...1007370000` for 강남파이낸스센터,
for example). Live re-test after the fix, same parcel: `ladfrlList` totalCount 0→1, `getLandUseAttr` 0→13,
`getIndvdLandPriceAttr` 0→40 — while 건축HUB (unaffected, uses the other code) stayed at `platGbCd=0` →
success throughout. **If you're deriving a `pnu`, always convert**: `parcelGb = mt_yn == "1" ? "2" : "1"` (or
equivalently, from `platGbCd`), never reuse the 0/1 value as-is in the `pnu`'s digit position.
`schemas/address.py`'s `to_candidate()` does this conversion for juso.go.kr-derived candidates (that's the one
place this derivation happens for that source); `frontend/src/api/vworld.js`'s `toCandidate()` does the reverse
conversion for VWorld search 2.0 candidates, since VWorld's own `item.id` already comes back as a correct,
ready-to-use `pnu` and only `platGbCd` needs deriving from it. The frontend never re-derives either scheme from
scratch beyond that. Not yet empirically confirmed: whether 필지구분 `2` genuinely returns 산/임야 data — every
real parcel tested so far only had data under `1`.

## Environment files
Both `backend/.env` and `frontend/.env` are gitignored; `.env.example` in each directory is the template.
`frontend/.env`'s `VITE_`-prefixed values are inlined into the built JS bundle and visible to any visitor —
that's expected/accepted for `VITE_VWORLD_API_KEY` given the domain-lock behavior above, not a bug to fix.
