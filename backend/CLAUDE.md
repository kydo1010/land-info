# CLAUDE.md (backend/)

Backend-specific conventions for `backend/app/`. See the root `CLAUDE.md` for the project overview, commands,
the frontend/backend API split, the VWorld-direct-from-browser exception, and identifier formats — all of
which apply here too.

### Backend layers (`backend/app/`)
- `main.py` — the FastAPI app: CORS (`settings.frontend_origin`), a global exception handler that turns any
  `ExternalAPIError` into an `Envelope` error response, and `include_router()` for each router.
- `routers/` — thin HTTP layer. `address.py` calls `clients/juso_client.py` directly and returns
  `Envelope[list[AddressCandidate]]` (a trivial single-call passthrough belongs in the router, not a service).
  `building.py` takes `sigunguCd`/`bjdongCd`/`platGbCd`/`bun`/`ji` as query params (aliased from snake_case,
  same CamelModel convention as everywhere else) and delegates to `services/building_service.py`. There is no
  `coordinates.py` router — it existed briefly but was deleted once Geocoder turned out to be blocked from the
  deployed server same as the other three VWorld APIs (see the root CLAUDE.md's JSONP exception); don't re-add
  it without re-confirming Geocoder actually works from wherever this backend is deployed.
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
  hand-build in mocks, so the frontend needs zero transform step for it (see `api/backend.js` in
  `frontend/CLAUDE.md`).
  `schemas/envelope.py`'s `Envelope[T]` (`{data, error}`) is the standard response wrapper for every endpoint.
- `errors.py` — converts any external API failure into `ExternalAPIError` with a normalized `status_code` and
  a canned Korean user-facing message (`user_message_for`); raw upstream error text is logged, never returned
  to the client. `vworld_error()` maps VWorld's error-code vocabulary; `generic_error()` is for APIs
  (juso.go.kr, data.go.kr) whose full error taxonomy isn't documented, treated as "not-success = error".
- `config.py` — `pydantic-settings` reading `backend/.env` (`VWORLD_API_KEY`, `BUILDING_API_KEY`,
  `JUSO_API_KEY`, `FRONTEND_ORIGIN`). VWorld's key is shared across 4 of the 6 external APIs; building and
  juso each need their own separately-issued key from a different portal.
